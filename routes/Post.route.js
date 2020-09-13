const express = require('express');
const postRoutes = express.Router();
let Post = require('../models/Post');
var async = require("async");
const Dates = require('../utils/Dates');
let POSTS_PER_PAGE = 5;

/*********************************************************
 * 
 * Helpers
 * - req_to_skip
 * - get_queries
 * 
 *********************************************************/
function req_to_skip(req) {
  if("skip" in req.query && Number.isInteger(parseInt(req.query.skip))){
    return Math.ceil(parseInt(req.query.skip)/POSTS_PER_PAGE)*POSTS_PER_PAGE
  }
  return 0
}
function get_queries(skip=0, public_posts_only=true) {
  const public_filter = public_posts_only ? {public: true} : {}
  var fetch_query = function(callback) {
    Post.find(public_filter)
      .sort({createtime: 'desc'})
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .exec(function(err, posts){
        if(err){ 
          callback(err, null) 
        } else {
          callback(null, posts)
        }
      });
  }
  var count_query = function(callback) {
    Post.collection.countDocuments(public_filter, function(err, posts){
      if(err){
        callback(err, null)
      } else {
        callback(null, posts)
      }
    })
  }
  return [fetch_query, count_query]
}

/*********************************************************
 * 
 * Accesors
 * - /
 * - /public
 * - /:id
 * 
 *********************************************************/
postRoutes.route('/').get(function (req, res) {
  const skip = req_to_skip(req)
  async.parallel(get_queries(skip, false), function(err, results){
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
      res.status(400).send("unable to find posts")
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully fetched ${results[0].length} posts!`)
      res.json(
        {
          posts: results[0], 
          total_count: results[1],
          current_page: Math.trunc(skip/POSTS_PER_PAGE) + 1,
          total_pages: Math.ceil(results[1] / POSTS_PER_PAGE),
          skip: skip
        }
      );
    }
  }) 
});

postRoutes.route('/public').get(function (req, res) {  
  const skip = req_to_skip(req)
  async.parallel(get_queries(skip, true), function(err, results){
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
      res.status(400).send("unable to find posts")
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully fetched ${results[0].length} posts!`)
      res.json(
        {
          posts: results[0], 
          total_count: results[1],
          current_page: Math.trunc(skip/POSTS_PER_PAGE) + 1,
          total_pages: Math.ceil(results[1] / POSTS_PER_PAGE),
          skip: skip
        }
      )
    }
  })
});

postRoutes.route('/:id').get(function (req, res) {
  Post.findById(req.params.id.toString(), function (err, post) {
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully fetched the post!`)
      res.json({
        posts: [post],
        total_count: 1,
        current_page: 1,
        total_pages: 1,
        skip: 0
      });
    }
  });
});



/*********************************************************
 * 
 * Modifiers
 * - /add
 * - /delete/:id
 * - /update/:id
 * 
 *********************************************************/
postRoutes.route('/add/').post(function (req, res) {
  let post = new Post(req.body);
  post.save()
  .then(post => {
    Dates.log(req.baseUrl+req.path, `Successfully added the post!`)
    res.status(200).json({
      message: 'post in added successfully',
      post: post
    });
  })
  .catch(err => {
    Dates.error(err, req.baseUrl + req.path)
    res.status(400).send("unable to save to database");
  });
});

postRoutes.route('/delete/:id').get(function (req, res) {
  Post.findByIdAndRemove({ _id: req.params.id }, function (err, post) {
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
      res.json(err);
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully removed the post!`)
      res.json('Successfully removed');
    }
  });
});

postRoutes.route('/update/:id').post(function (req, res, next) {
  Post.findById(req.params.id, function (err, post) {
    if (!post)
      return next(new Error('Could not load Document'));
    else {
      post.title = req.body.title;
      post.content = req.body.content;
      post.tags = req.body.tags.map(Function.prototype.call, String.prototype.trim);
      post.public = req.body.public;
      post.updatetime = Date.now();

      post.save().then(post => {
        Dates.log(req.baseUrl+req.path, `Successfully updated the post!`)
        res.json('Update complete');
      })
      .catch(err => {
        Dates.error(err, req.baseUrl + req.path)
        res.status(400).send("unable to update the database");
      });
    }
  });
});

module.exports = postRoutes;