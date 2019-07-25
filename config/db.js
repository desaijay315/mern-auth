const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('Mongodb connected');
  } catch (error) {
    console.error(error.message);
    //exit the process with 1
    process.exit(1);
  }
};

module.exports = connectDB;
