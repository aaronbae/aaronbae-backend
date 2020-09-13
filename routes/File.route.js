const express = require('express');
const fileRoutes = express.Router();
const Dates = require('../utils/Dates')

// AWS S3 related modules
const AWS = require('aws-sdk');
const fs = require('fs');
var multer = require('multer')

//configuring the AWS environment
AWS.config.update({
  accessKeyId: "AKIAI3QF7QWEEFXFTEEA",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
var storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, 'temp')
  },
  filename: function (req, file, next) {
    next(null, Date.now() + "-" + file.originalname)
  }
})
var upload = multer({ storage: storage }).single("file")

// Uploading files
fileRoutes.route('/upload').post(function (req, res) {
  // temporarily save the file to local
  upload(req, res, function (err) {
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
      return res.status(500).json(err)
    }
    // Read in the Temp File
    fs.readFile(req.file.path, (err, data) => {
      if (err) {
        Dates.error(err, req.baseUrl + req.path)
        return res.status(500).json(err)
      }
      const params = {
        Bucket: 'aaronbaebucket',
        Key: req.file.filename,
        Body: data
      }
      // Upload to AWS
      s3.upload(params, function (s3Err, data) {
        if (s3Err) {
          Dates.error(s3Err, req.baseUrl + req.path)
          return res.status(500).json(s3Err)
        }
        // delete the temp file
        fs.unlink(req.file.path, function (err) {
          if (err) {
            Dates.error(err, req.baseUrl + req.path)
            return res.status(500).send(err)
          }
          // SUCCESS
          Dates.log(req.baseUrl + req.path, `Successfully uploaded the image to ${data.Location}`)
          return res.status(200).json({
            message: 'file added successfully',
            url: data.Location
          });
        })
      });
    })
  })
});

// Retrieving images from S3
fileRoutes.route('/:image_name').get(function (req, res) {
  const params = {
    Bucket: 'aaronbaebucket',
    Key: req.params.image_name
  }
  s3.getObject(params, function (err, data) {
    if (err) {
      Dates.error(err, req.baseUrl + req.path)
      return res.status(500).send(err)
    }
    else {
      Dates.log(req.baseUrl + req.path, `Successfully fetched the image!`)
      return res.status(200).send(data.Body)
    }
  })

});

module.exports = fileRoutes;