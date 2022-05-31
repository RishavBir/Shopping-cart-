const express = require('express');
const router = express.Router();

//// IMPORTING CONTROLLERS  /////
const {  getCart, deleteCart }= require("../controller/cartController");
const {createProduct, getProduct,getProductById, updateProducts, deleteProductsById} = require('../controller/productController')
const { createUser, userLogin, getDetails, updateUser }= require("../controller/userController");
const {authentication, authorization} = require('../middleWare/userAuth')



////// API ///////

router.post('/register', createUser)
router.post("/login", userLogin)
router.get('/user/:userId/profile', authentication, getDetails)
router.put('/user/:userId/profile', authentication, authorization, updateUser)

router.post('/createProduct', createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
router.put('/products/:productId', updateProducts)
router.delete('/products/:productId', deleteProductsById)


router.get('/users/:userId/cart', getCart)
router.delete('/users/:userId/cart', deleteCart)

module.exports = router;