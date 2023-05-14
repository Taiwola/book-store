const express = require("express");
const router = express.Router();

//Import middleware

//Import Controllers
const { handleGetUsers, handleDelete } = require("../controllers/users.controller");

//get req
router.get('/', handleGetUsers);

//post req

// put or patch req

//delete req
router.delete('/', handleDelete)


//error handlers

module.exports = router;
