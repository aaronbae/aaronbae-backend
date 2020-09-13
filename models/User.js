const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let User = new Schema({
  login_id: {
    type: String,
  },
  login_password: {
    type: String,
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  }
},{
    collection: 'users'
});

module.exports = mongoose.model('User', User);