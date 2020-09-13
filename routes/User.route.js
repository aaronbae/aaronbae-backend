const express = require('express');
const userRoutes = express.Router();
let User = require('../models/User');
const Dates = require('../utils/Dates');

// Defined store route
userRoutes.route('/add').post(function (req, res) {
  let user = new User(req.body);
  user.save()
    .then(user => {
      Dates.log(req.baseUrl+req.path, `Successfully added the user ${user.login_id}!`)
      res.status(200).json({ 'user': 'user in added successfully' });
    })
    .catch(err => {
      Dates.error(err, req.baseUrl+req.path)
      res.status(400).send("unable to save to database");
    });
});

// Defined get data(index or listing) route
userRoutes.route('/').get(function (req, res) {
  User.find(function (err, users) {
    if (err) {
      Dates.error(err, req.baseUrl+req.path)
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully found the user ${users[0].login_id}!`)
      res.json(users);
    }
  });
});

// Defined edit route
userRoutes.route('/edit/:id').get(function (req, res) {
  let id = req.params.id;
  User.findById(id, function (err, user) {
    if (err) {
      Dates.error(err, req.baseUrl+req.path)
    } else {
      Dates.log(req.baseUrl+req.path, `Successfully found the user!`)
      res.json(user);
    }
  });
});

//  Defined update route
userRoutes.route('/update/:id').post(function (req, res) {
  User.findById(req.params.id, function (err, next, user) {
    if (!user)
      return next(new Error('Could not load Document'));
    else {
      user.id = req.params.id;
      user.login_id = req.body.login_id;
      user.login_password = req.body.login_password;

      user.save().then(user => {
        Dates.log(req.baseUrl+req.path, `Successfully updated the user!`)
        res.json('Update complete');
      })
      .catch(err => {
        Dates.error(err, req.baseUrl+req.path)
        res.status(400).send("unable to update the database");
      });
    }
  });
});

// Defined delete | remove | destroy route
userRoutes.route('/delete/:id').get(function (req, res) {
  User.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
    if (err) {
      Dates.error(err, req.baseUrl+req.path)
      res.json(err);
    }
    else {
      Dates.log(req.baseUrl+req.path, `Successfully deleted the user!`)
      res.json('Successfully removed');
    }
  });
});

// Login
userRoutes.route('/login').post(function (req, res) {
  User.find({
    login_id: req.body.login_id,
    login_password: req.body.login_password
  }, function (err, user) {
    if (user.length == 0) {
      Dates.error(err, req.baseUrl+req.path, `Failed login for user ${req.body.login_id}!`)
      res.status(400).json({ "status": 400 })
    } else {
      Dates.log(req.baseUrl+req.path, `Successfully logged in for user ${req.body.login_id}`)
      res.status(200).json({ "status": 200 })
    }
  });
})

module.exports = userRoutes;