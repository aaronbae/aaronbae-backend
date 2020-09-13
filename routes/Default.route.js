const express = require('express');
const defaultRoutes = express.Router();
const Dates = require('../utils/Dates')

defaultRoutes.route("/").get(function (req, res) {
  Dates.log("/")
  res.status(200).json({message: "Default api route."})
});

module.exports = defaultRoutes;