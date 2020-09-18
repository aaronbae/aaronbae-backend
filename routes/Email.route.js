const express = require('express');
const emailRoutes = express.Router();
const fs = require('fs');
const util = require('util');
const Email = require('../utils/Email');
const Dates = require('../utils/Dates');

emailRoutes.route("/me").post(async function (req, res) {
  if(!req.body.app_name || !req.body.name || !req.body.email || !req.body.message){
    Dates.log(req.baseUrl+req.path, "Email failed to send!")
    return res.status(400).json({message: "Request was sent without key arguments. It requires app_name, name, email, and message!"})
  }

  let html = await util.promisify(fs.readFile)('./static/contact.html', {encoding: 'utf-8'})

  // Send an email to myself
  const my_email = process.env.ADMIN_EMAIL
  const my_email_title = `${req.body.name} contacted you through ${req.body.app_name}!`
  const my_email_text = `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
  //Email.send_email(my_email, my_email_title, my_email_text) 

  // Send an email to the person who contacted
  html = html.replace("<NAME>", req.body.name)
  Email.send_email(
    req.body.email, 
    "You've Contacted HighCurve!", 
    "Thank you for contacting HighCurve. Your feedback is much appreciate!", 
    html
  )

  Dates.log(req.baseUrl + req.path, "Both emails successfully sent!")
  return res.status(200).json({message: "Email successfully sent!"})
});

module.exports = emailRoutes;