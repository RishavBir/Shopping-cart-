const userModels = require("../models/userModel");
const jwt = require("jsonwebtoken");
const validator = require('validator')


// globelly function to validate a key 

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number') return false
    return true;
}

// globelly function to validate request body is empty or not

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const isValidTitle = function (title) {   //change--- add this function
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


//first create user api 

const createuser = async function (req, res) {
    try {

        let requestBody = req.body

        //validation of request body and body keys 

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' }) //change -- write user instead of author
            return
        }

        if (!isValid(requestBody.title)) {
            res.status(400).send({ status: false, message: 'title is required' })
            return
        }

        if (!isValidTitle(requestBody.title.trim())) {  //change--add this function and use trim()
            res.status(400).send({ status: false, message: `Title should be among Mr, Mrs and Miss` })
            return
        }

        if (!isValid(requestBody.name)) {
            res.status(400).send({ status: false, message: ' name is required' })
            return
        }

        if (!isValid(requestBody.phone)) {
            res.status(400).send({ status: false, message: 'phone  is required' })
            return
        }


        if (!isValid(requestBody.email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        }

        if (!isValid(requestBody.password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        }

        if (requestBody.address) {
            if (!isValid(requestBody.address.street)) {
                res.status(400).send({ status: false, message: 'street is required' })
                return
            }

            if (!isValid(requestBody.address.city)) {
                res.status(400).send({ status: false, message: 'city is required' })
                return
            }

            if (!isValid(requestBody.address.pincode)) {
                res.status(400).send({ status: false, message: 'pincode is required' })
                return
            }

            if (Object.keys(requestBody.address).length === 0) {
                res.status(400).send({ status: false, message: 'address cant be empty' })
                return
            }
        }

        // number minimum and maximum check validation

        if (!(requestBody.password.length >= 8 && requestBody.password.length <= 15)) {
            res.status(400).send({ status: false, message: 'password length should be greter then 8 and less than 15' })
            return
        }

        //  correct formet validation  number and email check email or number is velid or not 

        let check1 = requestBody.phone

        let check2 = (/^[0-9]{10}/.test(requestBody.phone))

        if (!(check1.length === 10 && check2)) {
            return res.status(400).send({ status: false, msg: 'enter valid number' })
        }

        if (!(validator.isEmail(requestBody.email.trim()))) {   //change -- add trim() otherwise say invalid email
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }

        // unique validation number and email

        const isEmailAlreadyUsed = await userModels.findOne({ email: requestBody.email });

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
            return
        }

        const isNumberAlreadyUsed = await userModels.findOne({ phone: requestBody.phone }); //change -- write phone istead email

        if (isNumberAlreadyUsed) {
            res.status(400).send({ status: false, message: `${requestBody.phone.trim()} number is already registered` }) //change -- add trim()
            return
        }

        // sucessfully craete user data in dabse

        let userSaved = await userModels.create(requestBody);
        res.status(201).send({ status: true, data: userSaved });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports.createuser = createuser 