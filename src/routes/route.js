const express = require('express');
const router = express.Router();

//// IMPORTING CONTROLLERS  /////
const { createUser, userLogin, getDetails, updateUser }= require("../controller/userController");
const {createProduct, getProduct,updateProducts, deleteProductsById} = require('../controller/productController')
const {authentication, authorization} = require('../middleWare/userAuth')



////// API ///////

router.post('/register', createUser)
router.post("/login", userLogin)
router.get('/user/:userId/profile', authentication, getDetails)
router.put('/user/:userId/profile', authentication, authorization, updateUser)

router.post('/createProduct', createProduct)
router.get('/products', getProduct)
router.put('/products/:productId', updateProducts)
router.delete('/products/:productId', deleteProductsById)


module.exports = router;