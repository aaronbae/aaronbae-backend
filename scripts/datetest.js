function round_date(milliseconds) {
  const days_in_milli = 1000 * 60 * 60 * 24
  return new Date(Math.floor(milliseconds / days_in_milli) * days_in_milli)
}

function add_a_day(date) {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000)
}

const DATE_DIFF = 1

const today = round_date(Date.now())
const yesterday = new Date(today.getTime() - DATE_DIFF*24*60*60*1000)
const tomorrow = add_a_day(today)

const t = today.getTime()/1000
const y = yesterday.getTime()/1000
const m = tomorrow.getTime()/1000
console.log(t)
console.log(y)
console.log(m)
console.log(`https://query1.finance.yahoo.com/v7/finance/download/IBM?period1=${y}&period2=${t}&interval=1d&events=history`)
console.log(`https://query1.finance.yahoo.com/v7/finance/download/IBM?period1=${y}&period2=${m}&interval=1d&events=history`)