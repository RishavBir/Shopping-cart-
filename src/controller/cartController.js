const cartModel = require("../models/cartModel");
const mongoose = require('mongoose');
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const getCart = async (req, res) =>{
    try {
        const userId = req.params.userId;

        if (Object.keys(userId).length === 0) {
            return res.status(400).send({ status: false, message: "UserId is not present, plz provide userId" })
        }

        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false, msg:"userId is not Valid"})
        }

        let checkCart = await cartModel.findOne({userId:userId})

        if (!checkCart) {
            return res.status(404).send({ status: false, msg: "No cart found with this userId" })
        }

        const foundedCart = await cartModel.findOne({ _id: checkCart._id, items: [], totalItems: 0, totalPrice: 0})

        if (foundedCart) {
            return res.status(404).send({ status: false, message: "Carts not found , maybe the cart is empty" })
        }

        // const availableCarts = await cartModel.find({ userId:_id,  })
        return res.status(200).send({ status: true, cartData: checkCart})

    } 
 
        catch (error) { res.status(500).send({ msg: error.message })
    }
}

const deleteCart = async (req, res) =>{
  try {
    let userId = req.params.userId;

    if (Object.keys(userId).length === 0) {
        return res.status(400).send({ status: false, message: "UserId is not present, plz provide userId" })
    }

    if(!isValidObjectId(userId)){
        return res.status(400).send({status:false, msg:"userId is not Valid"})
    }

    let checkCart = await cartModel.findOne({userId:userId})

    if (!checkCart) {
        return res.status(404).send({ status: false, msg: "No cart found with this userId" })
    }

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