mongo aaronbaeDB --eval "db.dropDatabase()"
mongodump --uri=MONGO_DUMP_URL
mongorestore dump/
rd -rf dump/