const fetch = require('node-fetch')
const Stocks = require('./Stocks')
const Dates = require('./Dates')
const mail = require("./Mail")

module.exports = {
  get_stocks_status: get_stocks_status,
  fetch_fresh_data: fetch_fresh_data
}

/********************************************
 * 
 * STOCKS CRON JOB
 * 
 ********************************************/
// Status Variables
const STOCKS_JOB_ESTIMATED_INTERVAL = 7;// seconds
let STOCKS_JOB_STATUS = {
  n: 0,
  batch_total: 0,
  batch_started: null,
  last_updated: null,
  estimated_finish_time: null,
  current_time: null,
  queue: [],
}

// Functions
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
function valid_symbol(ticker_entry) {
  const description = ticker_entry.description
  const type = ticker_entry.type
  if(type==="WAR"||description===""){
    return false
  }
  return true
}
function get_stocks_status() {
  const current = Dates.current()
  STOCKS_JOB_STATUS.current_time = Dates.format(current)
  if(STOCKS_JOB_STATUS.n > 0){
    STOCKS_JOB_STATUS.estimated_finish_time = Dates.format(
      Dates.to_pst(new Date(current.getTime() + STOCKS_JOB_STATUS.n * STOCKS_JOB_ESTIMATED_INTERVAL * 1000))
    )
  } else {
    STOCKS_JOB_STATUS.estimated_finish_time = null
  }
  return {
    ...STOCKS_JOB_STATUS,
    batch_started: Dates.format(STOCKS_JOB_STATUS.batch_started),
    last_updated: Dates.format(STOCKS_JOB_STATUS.last_updated)
  }
}
function fetch_fresh_data() {
  STOCKS_JOB_STATUS.queue = []
  fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.FINN_HUB_TOKEN}`)
  .then((res) => res.json())
  .then(stocks => {
    stocks.forEach(entry => {
      if(valid_symbol(entry)){
        STOCKS_JOB_STATUS.queue.push(entry.symbol)
      }
    })
    const current = Dates.current()
    STOCKS_JOB_STATUS.batch_total = STOCKS_JOB_STATUS.queue.length
    STOCKS_JOB_STATUS.n = STOCKS_JOB_STATUS.queue.length
    STOCKS_JOB_STATUS.batch_started = current
    STOCKS_JOB_STATUS.last_updated = current
    mail.new_cron_batch_notification(STOCKS_JOB_STATUS) 
    Dates.log("CRON", `reloaded ${stocks.length} stocks!`)
  })
  .catch(error => { 
    Dates.error(error, "CRON", `failed to reload stocks!`)
  })
  .then(async ()=> {
    while(STOCKS_JOB_STATUS.n > 0){
      const ticker = STOCKS_JOB_STATUS.queue.shift()
      STOCKS_JOB_STATUS.n -= 1
      await Stocks.guarantee_fresh_yahoo(ticker)
      .then(async ()=>{
        mail.warn_cron_status()
        STOCKS_JOB_STATUS.last_updated = Dates.current()
        Dates.log("CRON", `Resolved ${ticker}!`)
        //await sleep(STOCKS_JOB_ESTIMATED_INTERVAL * 1000);
      })
      .catch(error => {
        Dates.error(error, "CRON", `Failed to resolve ${ticker}!`)
      })
    }
  })
}
