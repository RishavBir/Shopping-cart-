const productModel = require('../models/productModel');
const mongoose = require('mongoose');
const aws = require("aws-sdk");
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



///--------------------AWS CONFIG --------------------///
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket", //HERE
      Key: "abc/" + file.originalname, //HERE
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      console.log("file uploaded succesfully");
      return resolve(data.Location);
    });

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"
  });
};
///////

//////////////////////////////////////////// [ create products ]  ////////////////////////////
let createProduct = async (req, res) => {
  try {
    let body = req.body.data
    let files = req.files



    if (files && files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      var image = await uploadFile(files[0]);

    } else {
      return res
        .status(400)
        .send({ status: false, message: "image file not found" });
    }
    if (body) {

      let bodyData = JSON.parse(body)
      let { title, descriptiion, price, currencyId, currencyFormat, style, availableSizes, installments } = bodyData
      let dbData = await productModel.findOne(bodyData)
      if (dbData) {
        return res.status(409).send({ status: false, message: `Same product is already registered with id: ${dbData._id}` })
      }
      bodyData.productImage = image;
      let created = await productModel.create(bodyData)

      res.status(201).send({ status: true, message: "sucessfull", data: created })
    } else {
      return res.status(400).send({ status: false, message: "Product details is not present in request" })
    }
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}

const getProduct = async function (req, res) {
  try {
    const queryDetails = req.query

    if (Object.keys(queryDetails).length == 0) {
      let dbDetails = await productModel.find({ isDeleted: false })
      return res.status(200).send({ status: true, message: 'Products list', data: dbDetails })
    }
    else {
      let dbData = await productModel.find({ isDeleted: false })

      let { size, name, priceGreaterThan, priceLessThan } = queryDetails

      let pappu = dbData.filter(c => (c.price > priceLessThan && c.price < priceGreaterThan)).map(res => res.price);  /// not giving data properly
      console.log(pappu)


      let findDetails = { title: name, availableSizes: size, price: pappu }
      let dbDetails = await productModel.findOne(findDetails)

      return res.status(200).send({ status: true, message: "Products list", data: dbDetails })
    }
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
      let allProducts = await productModel.findOne({ _id: id, isDeleted: false })
      return res.status(200).send({status:true, message:"product found successfully" ,data:allProducts})
  } 
  catch (err) {
      res.status(500).send({ status: false, msg: err.message })
  }
}


const updateProducts = async function (req, res) {

  try {
    
    let files = req.files
    let productId = req.params.productId;

    if (!isValidObjectId(productId)) {
      return res.status(404).send({ status: false, msg: "Enter a valid productId" });
    }

    let checkProductId = await productModel.findById(productId);

    if (!checkProductId) {
      return res.status(404).send({ status: false, msg: "No product found check the ID and try again" });
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

//--------------------[        deleteProductsById     ]------------------------------------

const deleteProductsById= async function (req, res) {

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
     let time = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"); 
      let allProducts = await productModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time } }, { new: true,upsert:true })
      return res.status(200).send({status:true, message:"delete product successfully" ,data:allProducts})
  } 
  catch (err) {
      res.status(500).send({ status: false, msg: err.message })
  }
}


module.exports = { createProduct, getProduct, getProductById, updateProducts, deleteProductsById }