/*********************************************************
 * 
 * Dates.js
 * 1. round_date
 *    - input: 
 *      - an integer
 *    - output: 
 *      - a new Date object
 * 
 * 2. days_ago
 *    - input: 
 *      - a Date object 
 *      - an integer
 *    - output:
 *      - a new Date object 
 * 
 * 3. format
 *    - input: Date object
 *    - output: string
 * 
 * 4. current
 *    - input: (none)
 *    - ouptut: string
 * 
 *********************************************************/
module.exports = {
  to_pst: to_pst,
  round_date: round_date,
  format: format,
  current: current,
  log: log,
  error: error,
  current_formatted:current_formatted
}
const MAX_URL_NAME_LENGTH = 45; 
function round_date(milliseconds) {
  const days_in_milli = 1000 * 60 * 60 * 24
  return new Date(Math.floor(milliseconds / days_in_milli) * days_in_milli)
}

/****************************************
 * 
 * Logging Functions
 * 
 ****************************************/
function log(url, message="Successful!"){
  console.log(`[${format_24(new Date())}] ${url.padEnd(MAX_URL_NAME_LENGTH, ' ')} : ${message}`)
}
function error(error, url, message="Failed!") {
  error = error ? `\n${error.toString()}` : ""
  console.log(`[${format_24(new Date())}] ${url.padEnd(MAX_URL_NAME_LENGTH, ' ')} : ${message}${error}`)
}

/****************************************
 * 
 * Date formatting functions
 * 
 ****************************************/
function to_pst(date) {
  return new Date(date.getTime()-(420-date.getTimezoneOffset())*60*1000)
}
function format_24(date) {
  if(!date){
    return null
  }
  return date.toLocaleString('en-US', {hour12: false}).replace(/,/g, "")
}
function format(date) {
  if(!date){
    return null
  }
  return date.toLocaleString('en-US').replace(/,/g, "")
}
function current() {
  return to_pst(new Date())
}
function current_formatted() {
  return format(current())
}