const express = require('express');
const mongoose = require('mongoose');
const monitorRoute = express.Router();
const cron = require('../utils/Cron');
const Dates = require('../utils/Dates');

monitorRoute.route('/cron').get(function(req, res) {
  Dates.log(req.baseUrl + req.path)
  res.status(200)
  res.json(cron.get_stocks_status())
})

monitorRoute.route('/db').get(async function (req, res) {  
  if(mongoose.connection.readyState != 1){
    Dates.error(null, req.baseUrl + req.path, "Failed to fetch db information!")
    res.status(500)
    res.json({message: "Failed to fetch db information!"})
  } else {
    const db = mongoose.connection.db
    let result = {}
    const collections = await db.listCollections().toArray()
    const stats = await db.stats()
    
    const collection_info = await Promise.all(collections.map(async collection=>{
      const current_collection = db.collection(collection.name)
      const n = await current_collection.estimatedDocumentCount()
      const collection_stats = await current_collection.stats()      
      return {
        name: collection.name,
        n: n,
        storage: collection_stats.size,
        reserved: collection_stats.storageSize
      }
    }))
    
    result.name = stats.db
    result.num_collections = collection_info.length
    result.collections = collection_info
    result.total_storage = stats.dataSize
    result.total_reserved = stats.storageSize
    result.machine_memory_used = stats.fsUsedSize
    result.machine_memory_total = stats.fsTotalSize

    Dates.log(req.baseUrl + req.path, "Successfully fetched db information!")
    res.status(200);
    res.json(result)
  }
})



module.exports = monitorRoute;