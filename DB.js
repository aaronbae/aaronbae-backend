const scale_grid_mongo = {
  DB: process.env.MONGO_SCALE_GRID_URL,
  options: {
    dbName: "aaronbaeDB",
    poolSize: 1,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
}

const local_mongo = {
  DB: 'mongodb://localhost:27017/aaronbaeDB',
  options: {
    autoIndex: false,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
};


module.exports = process.env.NODE_ENV === "development" ? local_mongo : scale_grid_mongo;