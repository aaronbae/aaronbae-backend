const Stock = require('../models/Stock');
const History = require('../models/History');
const Dates = require('./Dates')
const fetch = require('node-fetch')

/*********************************************************
 * 
 * Stocks.js
 * 1. query_stocks
 *    - input: 
 *      - ticker    : string 
 *      - start_date: date object
 *      - end_date  : date object
 *    - output: 
 *      -  Mongoose Query object
 * 
 * 2. guarantee_fresh_yahoo
 *    - input: 
 *      - ticker : string
 *    - output:
 *      - Promise object
 * 
 *********************************************************/
module.exports = {
  query_ticker_partial:query_ticker_partial,
  query_limited:query_limited,
  query_all: query_all,
  query_topgainers: query_topgainers,
  query_toplosers: query_toplosers,
  guarantee_fresh_yahoo: guarantee_fresh_yahoo
}
function query_ticker_partial(word_piece) {
  return Stock.find({ticker: {$regex: `^${word_piece}.*$`}}, "ticker -_id").limit(5)
}
function query_toplosers(date, count) {
  return History.find({date: date}).sort({change: 1}).limit(count)
}
function query_topgainers(date, count) {
  return History.find({date: date}).sort({change: -1}).limit(count)
}
function query_limited(ticker, count) {
  return History.find({ticker: ticker}).sort({date: -1}).limit(count)
}
function query_all(ticker) {
  return History.find({ticker: ticker}).sort({date: -1})
}
function get_yahoo_url(ticker, start, end) {
  const formatted_start = Math.trunc(start.getTime() / 1000);
  const formatted_end = Math.trunc(end.getTime() / 1000);
  ticker = ticker.replace(/\./g, "-")
  return `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${formatted_start}&period2=${formatted_end}&interval=1d&events=history`
}
function dangerously_fetch_yahoo(ticker, previous, today) {
  return new Promise((resolve, reject) =>{
    fetch(get_yahoo_url(ticker, previous, today))
    .then(response=>response.text())
    .then(async(text) => {
      if(text.includes("404 Not Found") || text.includes("422 Unprocessable Entity")) {
        throw new Error("Yahoo returned empty!")
      } 
      const splitted_text = text.split("\n")
      let new_history = []
      for(let i = 1; i < splitted_text.length; i++) {
        const splitted_row = splitted_text[i].split(",")    
        if(!splitted_row.includes("null")){
          let new_row = new History()
          new_row.ticker = ticker
          new_row.date = new Date(splitted_row[0])
          new_row.open = splitted_row[1]
          new_row.high = splitted_row[2]
          new_row.low = splitted_row[3]
          new_row.close = splitted_row[4]
          new_row.adj_close = splitted_row[5]
          new_row.volume = splitted_row[6]
          new_row.change = (new_row.close - new_row.open)/ new_row.open
          new_history.push(new_row)
        }
      }
      if(new_history.length === 0){
        throw new Error("No New History!")
      } 
      await History.insertMany(new_history, {ordered: false}).catch(error=>{
        Dates.log(error, "UTILS/STOCKS")
      })
      await Stock.updateOne({ticker: ticker},{updated: today}, {upsert: true})
      Dates.log("UTILS/STOCKS", `Added ${new_history.length} new records for ${ticker}!`)
      resolve(new_history.length)
    })
    .catch(error => reject(error))
  })
}
function guarantee_fresh_yahoo(ticker) {
  ticker = ticker.toUpperCase()
  return new Promise((resolve, reject) => {
    if(!ticker.match(/^[.A-Z]+$/)) {
      throw new Error("Invalid ticker symbol!") 
    }
    const today = Dates.round_date(Date.now())
    const query = Stock.find({ticker: ticker})
    query.exec().then( stocks => {
      if(stocks.length == 0 || stocks[0].updated < today){
        // if no company found or info outdated
        const last_updated = stocks.length==0? Dates.to_pst(new Date('1900')): stocks[0].updated
        return dangerously_fetch_yahoo(ticker, last_updated, today)  
      }
    })
    .then((count)=> {
      resolve(count)
    })
    .catch((error)=> reject(error))
  })
}