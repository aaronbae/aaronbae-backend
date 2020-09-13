const express = require('express');
const userRoutes = express.Router();
const Stocks = require("../utils/Stocks");
const Dates = require("../utils/Dates");

// Query most recent
// Defaults to yesterday and today
userRoutes.route('/:id').get(function (req, res) {
  const ticker = req.params.id.toString().toUpperCase()

  Stocks.guarantee_fresh_yahoo(ticker).then(()=>{
    return Stocks.query_all(ticker).exec()
  })
  .then(stocks => {
    Dates.log(req.baseUrl+req.path)
    res.json({stocks: stocks})
  })
  .catch(error => {
    Dates.error(error, req.baseUrl+req.path)
    res.status(500)
    res.send({error: error.message})
  })
});

// Query specified by how many days in the past
userRoutes.route('/:id/:days').get(function (req, res) {
  const ticker = req.params.id.toString().toUpperCase()
  const days = parseInt(req.params.days)

  Stocks.guarantee_fresh_yahoo(ticker).then(()=>{
    return Stocks.query_limited(ticker, days).exec()
  })
  .then(stocks => {
    Dates.log(req.baseUrl+req.path)
    res.json({stocks: stocks})
  })
  .catch(error => {
    Dates.error(error, req.baseUrl+req.path)
    res.status(500)
    res.send({error: error.message})
  })
});

userRoutes.route("/topgainers/:date/:count").get(function(req, res){
  let date = parseInt(req.params.date)
  const count = parseInt(req.params.count)
  if(!date) {
    res.status(500)
    res.send({error: "Invalid parameter date!"})
  } else if(!count){
    res.status(500)
    res.send({error: "Invalid parameter count!"})
  } else {
    date = Dates.round_date(date)
    Stocks.query_topgainers(date, count).exec().then((stocks)=>{
      Dates.log(req.baseUrl+req.path)
      res.status(200)
      res.send({message: "Success", stocks: stocks})
    })
    .catch(error=>{
      Dates.error(error, req.baseURL+req.path)
    })
  }
})
userRoutes.route("/toplosers/:date/:count").get(function(req, res){
  let date = parseInt(req.params.date)
  const count = parseInt(req.params.count)
  if(!date) {
    res.status(500)
    res.send({error: "Invalid parameter date!"})
  } else if(!count){
    res.status(500)
    res.send({error: "Invalid parameter count!"})
  } else {
    date = Dates.round_date(date)
    Stocks.query_toplosers(date, count).exec().then((stocks)=>{
      Dates.log(req.baseUrl+req.path)
      res.status(200)
      res.send({message: "Success", stocks: stocks})
    })
    .catch(error=>{
      Dates.error(error, req.baseURL+req.path)
    })
  }
})

module.exports = userRoutes;
      