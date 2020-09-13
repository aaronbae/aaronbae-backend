const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let History = new Schema({
  ticker: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: new Date('1900')
  },
  open: {
    type: Number,
    default: -1
  },
  high: {
    type: Number,
    default: -1
  },
  low: {
    type: Number,
    default: -1
  },
  close: {
    type: Number,
    default: -1
  },
  adj_close: {
    type: Number,
    default: -1
  },
  volume: {
    type: Number,
    default: -1
  },
  change: {
    type: Number,
    default: -1
  }
},{
  collection: 'history'
})


module.exports = mongoose.model('History', History);