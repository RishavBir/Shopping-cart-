 const userController = require('../models/userModel')


let createUser = async (req, res) =>{
    try{
        res.send("hi Aman kuamr")

    }catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}

module.exports = { createUser}




