const express = require('express');
const router = express.Router();


// import controllers
const getHomePage = require('../controllers/page.controller');


// use router
router.get('/', getHomePage);


module.exports = router;