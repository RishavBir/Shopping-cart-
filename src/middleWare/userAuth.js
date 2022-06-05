const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");
const  userModel = require('../models/userModel');
const validate = require('../utils/validation');
const  productModel = require('../models/productModel');

//----------------------------------------authentication----------------------------------------------------*/

const authentication = async(req,res,next) =>{
    try {
        
        let bearerHeader = req.headers.authorization;
        if(typeof bearerHeader == "undefined")
         return res.status(400).send({ status: false, message: "Token is missing" });

        let bearerToken = bearerHeader.split(' ')   
        let token = bearerToken[1];

        jwt.verify(token, "key@$%&*0101",(err, decodedToken)=>{
            if (err) {
                return res.status(400).send({ status: false, massage: "token is invalid" })
            }else{

                
        let exp = decodedToken.exp
        let iatNow = Math.floor(Date.now() / 1000)
        if(exp<iatNow) {
            return res.status(401).send({status:false,massage:'session expired, please login again'})
        }        

        req.decodedToken = decodedToken;

        next()
       }
    });         

     }catch (err) {
        console.log(err.massage)
        res.status(500).send({ status: false, massage: err.message })
    }
}
//--------------------------------------authentication end----------------------------------------------------*/

//----------------------------------------authorization----------------------------------------------------*/

let authorization = async (req, res, next) => {
    try{
        
        let userId = req.params.userId
        const decodedToken = req.decodedToken
      
          if(userId == "undefined"){
            return res.status(400).send({ status: false, message: 'user Id is must be present !!!!!!!' });

        } else if(mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, message: "user id  is not valid !!!!!!" });

        }

        let userById = await userModel.findOne({_id: userId,isDeleted: false})

        if(!userById){
            return res.status(404).send({ status: false, message: 'user Id is not found  !!!!!!!' });

        } else if (decodedToken.userLogin != userId) {
            return res.status(403).send({ status: false, message: 'unauthorized access' });

        }
        next();

    }catch(err){
        console.log(err.massage)
        res.status(500).send({status: false, massage: err.massage})
    }
}

module.exports = { authentication, authorization }

//------------------------------------authorization end ----------------------------------------------------*/