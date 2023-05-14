require("dotenv").config();
const mongoose = require("mongoose");

const inProduction = process.env.NOD_ENV === "production";
const connectDB = async () => {
mongoose.set('strictQuery', true)
  try {
    mongoose.connect(process.env.MONGODB_URL);
  } catch (err) {
    console.log('we ahve an error')
    console.log(err);
  }
};

module.exports = connectDB;