const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Post = new Schema({
  title: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    default: ""
  },
  updatetime: {
    type: Date,
    default: Date.now
  },
  createtime: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: Array,
    default: []
  },
  public: {
    type: Boolean,
    default: false
  }
},{
    collection: 'posts'
});

module.exports = mongoose.model('Post', Post);