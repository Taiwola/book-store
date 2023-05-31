// Import Dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');

// Import utils
const connectDB = require("./utils/dbConnect");

//Import custom middlewares

//Import cutom routes
const users = require("./routes/users.router");
const auth = require("./routes/auth.router");
const books = require("./routes/books.routes");
const page = require('./routes/page.routes');

// Define middlewares
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

// Use middlewares
app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
//middleware for cookies
app.use(cookieParser());

// Static assets
app.use("/", express.static(path.join(__dirname, "public")));
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// use custom middelwares

//use routes

app.use('/', page)
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/books', books);


//connect to server
mongoose.connection.once("open", () => {
    console.log("Connected to DB");
    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
  });