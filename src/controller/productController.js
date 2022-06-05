const productModel = require('../models/productModel');
const mongoose = require('mongoose');
const { uploadFile } = require('../utils/awsUpload');
const moment = require('moment')



const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidSize = (sizes) => {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes);
}



//////////////////////////////////////////// [ create products ]  ////////////////////////////

let createProduct = async (req,res) =>{
  try{
      let body = req.body.data
      let files = req.files

      if (files && files.length > 0) {
          var image = await uploadFile(files[0]);
        } else{
          return res.status(400).send({ status: false, message: "image file not found" });
        }
      if(body){
          
          let bodyData = JSON.parse(body)
              let {title, description, price, currencyId, currencyFormat, style, availableSizes, installments} = bodyData

              ///////////////////////////// validations starts from here//////////////////
              /// checking title

              if(title){
                if(typeof(title)!= "string" ){
                  return res.status(400).send({status:false, message:"title should be a string."})
                }else if(title == " "){
                  return res.status(400).send({status:false,message:"Title can not be empty."})
                }}
                 else{   
                return res.status(400).send({status:false,message:"Title is missing."})
              }
              /// checking description
              if(description){
                if(typeof(description)!= "string" ){
                  return res.status(400).send({status:false, message:"Description should be a string."})
                }
                else if(description == " "){
                  return res.status(400).send({status:false,message:"Description can not be empty."})
                }
              }else{
                return res.status(400).send({status:false,message:"Product description is missing."})
              }
              
              //// checking price

              if(price){
                if(typeof(price) != "number" ){
                  return res.status(400).send({status:false, message:"Price should be a number."})}
              }else{ 
                return res.status(400).send({status:false,message:"Product price is missing."})}

                /// checking currencyId

              if(currencyId){
                if( typeof(currencyId) != "string"){
                  return res.status(400).send({status:false,message:"currencyId must ba a string."})
                }else if( currencyId != "INR"){
                  return res.status(400).send({status:false, message:"CurrencyId must be in INR."})}
              }else{
                return res.status(400).send({status:false,message:"currencyId is missing."})}

                /// checking currencyFormat

              if(currencyFormat){
                if(typeof(currencyFormat) != "string"){
                  return res.status(400).send({status:false, message:"Currency format should be a string."})
                }
                else if(currencyFormat != "₹"){
                  return res.status(400).send({status:false, message:"Currency format should be '₹'."})}
              }else{
                return res.status(400).send({status:false,message:"currencyFormat is missing."})}
                
                //checking style

              if(style){
                if(typeof(style) != "string"){
                  return res.status(400).send({status:false, message:"style should be a string."})
                }else if(style == " "){
                  return res.status(400).send({status:false,message:"style can not be empty."})
                }
              }else{
                return res.status(400).send({status:false,message:"style is missing."})
              }
             //// checking available sizes

             if (availableSizes) {
              if(typeof(availableSizes) != "string"){
                return res.status(400).send({status:false, message:"available sizes must be a string."})
              }else{
                let availableSize = availableSizes.trim().replace(/[\]\[]+/g,'').toUpperCase().split(',') /// using regex to find and replace unwanted cahrs from sizes
              for (let i = 0; i < availableSize.length; i++) {
                  if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                      return res.status(400).send({ status: false, message: `Sizes should be ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                  }}
                  bodyData.availableSizes = availableSize
              }}else{
                return res.status(400).send({status:false, message:"availableSizes is missing"})
              } 

            /// checking installments

              if(installments){
                if(typeof(installments) != "number"){
                  return res.status(400).send({status:false,message:"Installments should be a number"})
                }
              }else{
                return res.status(400).send({status:false,message:"installments key is missing."})
              }

              ///////////////// validation ends here///////////////////////////

              let dbData = await productModel.findOne({title:title})
              if(dbData){
                  return res.status(409).send({status:false, message:`Same product is already registered with id: ${dbData._id}`})
              }
              bodyData.productImage = image;
              let created = await productModel.create(bodyData)

              res.status(201).send({status:true,message:"sucessfull", data:created})
          }else{
              return res.status(400).send({status:false, message:"Product details is not present in the request"})
          }
  }
  catch(error){
      res.status(500).send({status:false, message: error.message})
  }
}
///////////////////////////////////[ get product   ] ///////////////////////////////////////////////

const getProduct = async function (req, res) {
  try {
  
    let data = req.query
    // let {name , sizes, priceGreaterThan, priceLessThan} = data
    let obj = {}

    if (data.name != undefined) {
      obj.title = data.name
    }
    if (data.size != undefined) {
      obj.availableSizes = data.size.toUpperCase()
    }
    if (data.priceGreaterThan != undefined) {
      obj.price = {$gt: data.priceGreaterThan};
    }
    if (data.priceLessThan != undefined) {
      obj.price = {$lt: data.priceLessThan}
    }

    obj.isDeleted = false;

    const productData = await productModel.find(obj).sort({price: 1}).select({deletedAt : 0})

    if (productData.length == 0) {
      return res.status(404).send({ status: false, message: "No product found" })
    }

    return res.status(200).send({ status: true, message: 'Success', data: productData })
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

//--------------------[        getProductById     ]------------------------------------

const getProductById= async function (req, res) {

  try {
      let id = req.params.productId
      if (!isValidObjectId(id)){
          return res.status(404).send({status:false, message:"Plz enter valid product id"})
      }
      let isValidProductId = await productModel.findById({_id:id})
      if(!isValidProductId){
          return res.status(404).send({status:false, message:"Plz enter valid product id"})
      }
      let isDeleted = await productModel.findOne({ _id:id , isDeleted: true });

     if(isDeleted){
    return res.status(404).send({status: true,message: "product is already deleted"});

  }
      let allProducts = await productModel.findOne({ _id: id, isDeleted: false }).select({deletedAt: 0})
      return res.status(200).send({status:true, message:"product found successfully" ,data:allProducts})
  } 
  catch (err) {
      res.status(500).send({ status: false, msg: err.message })
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////


const updateProducts = async function (req, res) {

  try {
    
    let files = req.files
    let productId = req.params.productId;

    if (!isValidObjectId(productId)) {
      return res.status(404).send({ status: false, message: "Enter a valid productId" });
    }

    let checkProductId = await productModel.findById(productId);

    if (!checkProductId) {
      return res.status(404).send({ status: false, message: "No product found check the ID and try again" });
    }      

    if (!Object.keys(req.body).length > 0) {
      return res.status(400).send({ status: false, message: "body must be requried if you want to req.body" })
    }

    if (!Object.keys(req.body.data).length > 0) {
      return res.status(400).send({ status: false, message: "body must be requried if you want to req.body.data update" })
    }

    let data = JSON.parse(req.body.data)

    let { title, description, price, currencyId, currencyFormat, style, isFreeShipping, availableSizes, installments } = data

    if (!Object.keys(data).length > 0) {
      return res.status(400).send({ status: false, message: "body must be requried if you want to data update" })

    }

    if (title != undefined) {
      if (typeof title != 'string' || title.trim().length == 0) {
        return res.status(400).send({ status: false, message: "title can not be a empty string" })
      }

      let istitle = await productModel.findOne({ title: title })
      if (istitle) {
        return res.status(404).send({ status: false, message: "if you want to update title please enter unique title" })
      }

    }

    if (description != undefined) {
      if (typeof description != 'string' || description.trim().length == 0) {
        return res.status(400).send({ status: false, message: "description can not be a empty string" })
      }
    }

    if (price != undefined) {
      if (typeof price != 'string' || price.trim().length == 0) {
        return res.status(400).send({ status: false, message: "price can not be a empty string" })
      }
      if (!/^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)) {
        return res.status(400).send({ status: false, message: "price should be only number" })
      }
    }

    if (currencyId != undefined) {
      if (typeof currencyId != 'string' || currencyId.trim().length == 0) {
        return res.status(400).send({ status: false, message: "currencyId can not be a empty string" })
      }

      if (!(/INR/.test(currencyId))) {
        return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
      }
    }

    if (currencyFormat != undefined) {
      if (typeof currencyFormat != 'string' || currencyFormat.trim().length == 0) {
        return res.status(400).send({ status: false, message: "currencyFormat can not be a empty string" })
      }
      if (!(/₹/.test(currencyFormat)))
        return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });
    }

    if (style != undefined) {
      if (typeof style != 'string' || style.trim().length == 0) {
        return res.status(400).send({ status: false, message: "style can not be a empty string" })
      }
    }

    if (isFreeShipping != undefined) {
      if (typeof isFreeShipping != 'string' || isFreeShipping.trim().length == 0) {
        return res.status(400).send({ status: false, message: "isFreeShipping can not be a empty string" })
      }

      if (typeof isFreeShipping == 'string') {
        if (isFreeShipping == 'true' || isFreeShipping == 'false') {
          //convert from string to boolean
          data.isFreeShipping = isFreeShipping;
        } else {
          return res.status(400).send({ status: false, message: "Enter a valid value for isFreeShipping" })
        }
      }
    }

    if (availableSizes != undefined) {

      if (typeof availableSizes != 'string' || availableSizes.trim().length == 0) {
        return res.status(400).send({ status: false, message: "availableSizes can not be a empty string" })
      }
    }


    if (installments != undefined) {
      if (typeof installments != 'string' || installments.trim().length == 0) {
        return res.status(400).send({ status: false, message: "installments can not be a empty string" })
      }
      if (!/^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(installments)) {
        return res.status(400).send({ status: false, message: "installments is valid formate" })
      }
    }

    let isDeleted = await productModel.findOne({ _id: productId, isDeleted: true });

    if (isDeleted) {
      return res.status(404).send({ status: true, message: "product is already deleted" });

    }

    if (files && files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      let p = await uploadFile(files[0])
      data.productImage = p;
    } else if (!files) {
      return res.status(400).send({ status: false, message: "image file not found" })
    }


    let updateProduct = await productModel.findByIdAndUpdate({ _id: productId }, data, { new: true });

    return res.status(200).send({ status: true, message: "Product updated successfully", data: updateProduct, });


  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

//--------------------[     deleteProductsById     ]------------------------------------

const deleteProductsById= async function (req, res) {

  try {
      let id = req.params.productId
      if (!isValidObjectId(id)){
          return res.status(400).send({status:false, message:"Plz enter valid product id"})
      }
      let isValidProductId = await productModel.findById({_id:id})
      if(!isValidProductId){
          return res.status(400).send({status:false, message:"Plz enter valid product id"})
      }
      let isDeleted = await productModel.findOne({ _id:id , isDeleted: true });

     if(isDeleted){
    return res.status(404).send({status: true,message: "product is already deleted"});

  }
     let time = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"); 
      let allProducts = await productModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time } }, { new: true,upsert:true })
      return res.status(200).send({status:true, message:"delete product successfully" ,data:allProducts})
  } 
  catch (err) {
      res.status(500).send({ status: false, msg: err.message })
  }
}


module.exports = { createProduct, getProduct, getProductById, updateProducts, deleteProductsById }