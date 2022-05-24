const express = require('express');
const router = express.Router();

//// IMPORTING CONTROLLERS  /////
const { createUser }= require("../controller/userController");
// const bookController = require("../controllers/bookController")
// const reviewController = require("../controllers/reviewController")
// const middleware = require ("../middleware/auth")

//////

router.post('/register', createUser)
//router.post('/', userLogin)

module.exports = router;
