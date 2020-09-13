const Mailer =  require("nodemailer")
const mongoose = require('mongoose')
const cron_utils = require("./Cron");
const Dates = require('./Dates')


module.exports = {
  warn_cron_status: warn_cron_status,
  new_cron_batch_notification: new_cron_batch_notification,
  send_email: send_email,
  heartbeat: heartbeat
}

var transporter = Mailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
      type: "OAuth2",
      user: process.env.ADMIN_EMAIL,
      serviceClient: process.env.ADMIN_SERVICE_CLIENT,
      privateKey: process.env.ADMIN_PRIVATE_KEY
  }
})
function heartbeat() {
  if(mongoose.connection.readyState != 1){
    Dates.log("MAIL", "DB not ready!")
  } else {
    const to_email = process.env.ADMIN_EMAIL
    const title = "Heartbeat from AWS EC2"
    const text = `Heart beat at ${Dates.current_formatted()}\nCurrent cron status:\n${JSON.stringify(cron_status, null, 2)}`
    send_email(to_email, title, text) 
  }
}
function closeTo(val, goal) {
  return Math.abs(val-goal) < 0.001
}
function warn_cron_status() {  
  if(mongoose.connection.readyState != 1){
    Dates.log("MAIL", "DB not ready!")
  } else {
    mongoose.connection.db.stats().then(db_status=>{
      const mem_used = db_status.fsUsedSize/ db_status.fsTotalSize
      if(closeTo(mem_used, 0.75) || closeTo(mem_used, 0.80) || closeTo(mem_used, 0.85) || closeTo(mem_used, 0.90)){
        const cron_status = cron_utils.get_stocks_status()
        const to_email = process.env.ADMIN_EMAIL
        const title = "AWS EC2 is Running Out of Space"
        const text = `AWS EC2 is running out of space - ${Math.round(mem_used * 1000)/ 1000}\nCurrent cron status:\n${JSON.stringify(cron_status, null, 2)}\n Current DB Stats:\n${JSON.stringify(db_status, null, 2)}`
        send_email(to_email, title, text) 
      }
    })
  }
}
function new_cron_batch_notification(cron_status){
  if(mongoose.connection.readyState != 1){
    Dates.log("MAIL", "DB not ready!")
  } else {
    const to_email = process.env.ADMIN_EMAIL
    const title = "Started a new CRON Batch for Stocks"
    const text = `New batch for Stocks initiated:\n${JSON.stringify(cron_status, null, 2)}`
    send_email(to_email, title, text) 
  
  }
}
function send_email(to_email, subject, text) {
  const options = {
    from: process.env.ADMIN_EMAIL,
    to: to_email,
    subject: subject,
    text: text
  }
  transporter.verify().then(()=>{
    transporter.sendMail(options, function(err, data){
      if(err){
        Dates.error(err, "MAIL", "Email failed to send!")
      } else {
        Dates.log("MAIL", "Email sent!")
      }
    });
  }).catch(error=> {
    Dates.error(error, "MAIL", "Email failed to verify!")
  })
}