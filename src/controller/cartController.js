const Cart = require("../models/cartModel");
// const Product = require('../models/productModel');
// const validate = require('../utils/validation');

const getCart = async (req, res) =>{
  try {
    let userId = req.params.userId;

    //checking if the cart exist with this userId or not
    let findCart = await Cart.findOne({ userId: userId }).populate('items.productId');
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

    res.status(200).send({ status: true, message: "Cart Details", data: findCart })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const deleteCart = async (req, res) =>{
  try {
    let userId = req.params.userId;

    //checking if the cart exist with this userId or not
    let findCart = await Cart.findOne({ userId: userId });
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

    //checking for an empty cart
    if(findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

    let delCart = await Cart.findByIdAndUpdate(
      {_id: findCart._id},
      {items: [], totalPrice: 0, totalItems: 0},
      {new: true}
    )

    res.status(200).send({ status: true, message: "Products removed successfully", data: delCart })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

module.exports = { getCart, deleteCart }