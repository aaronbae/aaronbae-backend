const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Stock = new Schema({
  ticker: {
    type: String,
    required: true
  },
  updated: {
    type: Date,
    default: new Date('1900')
  },
  name: {
    type: String,
    default: "NA"
  }
},{
    collection: 'stocks'
});


module.exports = mongoose.model('Stock', Stock);