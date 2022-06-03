const orderModel = require('../models/orderModel')
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const moment = require('moment')






const isValidStringTrim = (value) => {
    if(typeof value != 'string' || value.trim().length == 0 ) return true;
    return false; 
  }

//////////////////////////////////////////////////////////////////////////////////////////////////// 
const createOrder = async function (req,res){
   try{ 
       let user_id = req.params.userId
       let bodyData = req.body

       console.log(bodyData)


       if(Object.keys(bodyData).length != 0){
           if(isValidStringTrim(bodyData.cartId)){
               return res.status(400).send({status:false, message:"cart id is empty"})
           }
       }else{
        return res.status(400).send({status:false, message:"request body is empty"})
    }
    if(!mongoose.Types.ObjectId.isValid(bodyData.cartId)){
        return res.status(400).send({status:false, message:"cart Id is not valid"})
    }


    if(mongoose.Types.ObjectId.isValid(user_id)){
            let findUser = await userModel.findById(user_id)                            /// cart needed to be empty 
            if(findUser){
                let findCart= await cartModel.findOne({_id:bodyData.cartId})
                if(findCart.items.length == 0){
                    return res.status(400).send({status:false,message:"Cart is already empty."})
                }
            }else{
                return res.status(404).send({status:false, message:"User not found"})
            }
            
    }else{
        return res.status(400).send({status:false,message:"user Id not valid"})
    }

   

    // if(isValidStringTrim(bodyData)){
    //     return res.status(400).send({status:false, message:"cart id should not be empty."})
    // }
    let status = await orderModel.findOne({userId:user_id}).select({status:1})
   

    console.log(status)

    if(status.status === "completed"){
        
        
    let cartDetails = await cartModel.findById(bodyData.cartId)

    let obj = {}
     obj.userId = user_id
     obj.items = cartDetails.items
     obj.totalPrice =cartDetails.totalPrice
     obj.totalItems = cartDetails.totalItems
     obj.totalQuantity = cartDetails.totalQuantity


    let orderCreate = await orderModel.create(obj)
    let {_id, userId,items, totalPrice, totalItems, totalQuantity,cancellable, status,createdAt, updatedAt} = orderCreate

        await cartModel.findOneAndUpdate({_id:bodyData.cartId},{$set:{items:[],totalItems:0,totalPrice:0}})


        return res.status(201).send({status:true, message:"Order details", data:{_id, userId,items, totalPrice, totalItems, totalQuantity,cancellable, status,createdAt, updatedAt}})
    }else if(status.status === "pending"){
        return res.status(409).send({status:false, message:"Order with this userid is already pending."})
    }else{
       return res.status(200).send({status:true, message:"This order has already been cancelled."})
    }
    }catch(error){
        console.log(error)
        res.status(500).send({status:false, message:error.message})
    }
}

///////////////////////////////////////////////////////////

const updateOrder = async function(req,res){
    try{
        let user_id = req.params.userId
        let order_id = req.body.orderId

    if(mongoose.Types.ObjectId.isValid(user_id)){
            let findUser = await userModel.findById(user_id)
            if(!findUser){
                return res.status(404).send({status:false, message:"User not found"})
            }   
    }else{
        return res.status(400).send({status:false,message:"user Id not valid"})
    }
   
    if(order_id){

        if(mongoose.Types.ObjectId.isValid(order_id)){
            let dbData = await orderModel.findById(order_id)
            
            if(dbData){
                let orderDetails = await orderModel.findOne({_id:order_id}).select({status:1}) 
                if(orderDetails.cancellable != "true"){
                    return res.status(400).send({status:false, message:"This order is not cancellable. "})
                }
                    if(orderDetails.status == "pending"){
                            await orderModel.findOneAndUpdate({_id:order_id},{$set:{status:"cancelled"}})
                        return res.status(201).send({status:false, message:"Order has been cancelled."})
                
                    }else if(orderDetails.status == "cancelled"){
                        return res.status(400).send({status:false, message:"You can not cancel this order."})
                    }else{
                        return res.status(400).send({status:false,message:"Order already placed."})
                    }
                }else{
                    return res.status(404).send({status:false, message:"Order for this user is not found."})
                }

        }else{
            return res.status(400).send({status:false,message:"Please provide valid Order Id."})
        }
    }else{
        return res.status(400).send({status:false,message:"please provide orderId"})
    }

   





    // res.status(200).send({status:true, message:"created"})
}catch(error){
    console.log(error)
    res.status(500).send({status:false,message:error.message})
}
}



module.exports = {createOrder, updateOrder}