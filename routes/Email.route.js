const express = require('express');
const emailRoutes = express.Router();
const path = require('path');
const Email = require('../utils/Email');
const Dates = require('../utils/Dates');

emailRoutes.route("/highcurve_logo.svg").get(function(req,res){
  res.sendFile(path.join(__dirname, '../static', 'highcurve_logo.svg'))
})

emailRoutes.route("/me").post(function (req, res) {
  if(req.body.app_name && req.body.name && req.body.email && req.body.message){
    // Send an email to myself
    const my_email = process.env.ADMIN_EMAIL
    const my_email_title = `${req.body.name} contacted you through ${req.body.app_name}!`
    const my_email_text = `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
    //Email.send_email(my_email, my_email_title, my_email_text) 
    
    // Send an email to the person who contacted
    const server_ip = process.env.NODE_ENV==="production"?process.env.PRODUCTION_SERVER_IP:process.env.DEVELOPMENT_SERVER_IP
    const contactor_email = req.body.email
    const contactor_email_title = `You've Contacted HighCurve!`
    const contactor_email_text = "Thank you for conatcting HighCurve. Any feedback is appreciated!"
    const contactor_email_html = `
      <div>
        <p>Hi ${req.body.name},</p>
        <p>${contactor_email_text}</p>
        <p>Aaron Bae<br />HighCurve Chief Engineer</p>
        <div><img src="${server_ip}/api/email/highcurve_logo.svg" alt="HighCurveLogo.svg" /></div>
      </div>`
    Email.send_email(
      contactor_email, 
      contactor_email_title, 
      contactor_email_text, 
      contactor_email_html
    )

    Dates.log(req.baseUrl + req.path, "Both emails successfully sent!")
    return res.status(200).json({message: "Email successfully sent!"})
  } else {
    Dates.log(req.baseUrl+req.path, "Email failed to send!")
    return res.status(400).json({message: "Request was sent without key arguments. It requires app_name, name, email, and message!"})
  }
});

module.exports = emailRoutes;