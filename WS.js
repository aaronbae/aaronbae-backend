const dates = require("./utils/Dates");
const Stocks = require("./utils/Stocks");

module.exports = function(conn) {
  dates.log("WSS", "A user connected")
  conn.on("ticker_search", (ticker)=>{
    ticker = ticker.toUpperCase()
    try {
      if(ticker.length <= 0){
        throw new Error("Ticker must be of length greater than 0!")
      }
      Stocks.query_ticker_partial(ticker).exec().then((tickers)=>{
        conn.emit('ticker_search',tickers)   
        dates.log("WSS", `Sent ${tickers.length} possible tickers related to ${ticker}`)
      })
    } catch (error) {
      dates.log("WSS", error.message)
      conn.emit('ticker_search',[])   
    }      
  })
  conn.on("disconnect", ()=>{
    dates.log("WSS", "A user disconnected")
  })
}
  