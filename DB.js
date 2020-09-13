const remote_mongo = {
  DB: process.env.MONGO_ATLAS_URL,
  options: {
    ssl: true,
    sslValidate: false,
    dbName: "aaronbaeDB",
    poolSize: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

const aws_mongo = {
  DB: process.env.MONGO_EC2_URL,
  options: {
    autoIndex: false,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
};

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


module.exports = process.env.NODE_ENV === "development" ? local_mongo : remote_mongo;