const userModel = require('../model/userModel');
const { uploadFile } = require('./awsController')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
let saltRounds = 10
//------------------------------- validation functions ---------------------------------------------------------------------------------

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}
const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}


//------------------------ first api to create user -----------------------------------------------------------------------------------------

const createUser = async function (req, res) {
    try {

        const requestBody = JSON.parse(req.body.data)
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }

        const { fname, lname, email, phone, password, address } = requestBody

        const files = req.files
        if (!isValidfiles(files)) {
            res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
            return
        }
        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide user's first name" })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide user's last name" })
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide user's email" })
            return
        }
        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }
        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }
        if (address) {
            if (address.shipping) {
                if (!isValid(address.shipping.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                    return
                }
                if (!isValid(address.shipping.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                    return
                }
                if (!isValid(address.shipping.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                    return
                }
            }
            if (address.billing) {
                if (!isValid(address.billing.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                    return
                }
                if (!isValid(address.billing.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                    return
                }
                if (!isValid(address.billing.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                    return
                }
            }
        }

        // //----------------------------- email and phone  and password validationvalidation -------------------------------------------------


        if (!(validator.isEmail(email.trim()))) {
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }

        // //-----------------------------------unique validation ----------------------------------------------------------------------------------------------

        let Email = email.split(' ').join('')

        const isEmailAlreadyUsed = await userModel.findOne({ email: Email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Email} email address is already registered` })
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone}  phone is already registered` })
            return
        }

        const profilePicture = await uploadFile(files[0])

        const encryptedPassword = await bcrypt.hash(password, saltRounds)

        let FEmail = email.split(' ').join('')

        const userData = {
            fname: fname, lname: lname, profileImage: profilePicture, email: FEmail,
            phone, password: encryptedPassword, address: address
        }

        const newUser = await userModel.create(userData);

        res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });

    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

module.exports.createUser = createUser