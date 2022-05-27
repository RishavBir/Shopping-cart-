const express = require('express');
const router = express.Router();

//// IMPORTING CONTROLLERS  /////
const { createUser, userLogin, getDetails, updateUser }= require("../controller/userController");
const {createProduct, getProduct,updateProducts} = require('../controller/productController')

////// API ///////

router.post('/register', createUser)
router.post("/login", userLogin)
router.get('/user/:userId/profile', getDetails)
router.put('/user/:userId/profile', updateUser)

router.post('/createProduct', createProduct)
router.get('/products', getProduct)
router.put('/products/:productId', updateProducts)


module.exports = router;