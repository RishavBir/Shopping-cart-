const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');


const phoneValidator = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/

const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/


let createUser = async (req, res) => {
    try {
           

        if(!Object.keys(req.body).length > 0){
            return res.status(400).send({status: false, message: "body must be requried !!!!!!!!!!!!!!!!!!!"})
        }

        if(!Object.keys(req.body.data).length > 0){
            return res.status(400).send({status: false, message: "body must be requried !!!!!!!!!!!!!!!!!!!"})
        }

        let data = JSON.parse(req.body.data)

        let { fname, lname, email, profileImage, phone, password, address } = data

        if (!Object.keys(data).length > 0) {
            return res.status(400).send({ status: false, message: "body must be requried" })

        } else if (!fname) {
            return res.status(400).send({ status: false, message: "fname must be requried" })

        } else if (!lname) {
            return res.status(400).send({ status: false, message: "lname must be requried" })

        } else if (!email) {
            return res.status(400).send({ status: false, message: "email must be requried" })

        } else if (!profileImage) {
            return res.status(400).send({ status: false, message: "profileImage must be requried" })

        } else if (!phone) {
            return res.status(400).send({ status: false, message: "phone must be requried" })

        } else if (!password) {
            return res.status(400).send({ status: false, message: "password must be requried" })

        } else if (!address) {
            return res.status(400).send({ status: false, message: "address must be requried" })

        } else if (!address.shipping) {
            return res.status(400).send({ status: false, message: "shipping must be requried" })

        } else if (!address.billing) {
            return res.status(400).send({ status: false, message: "billing must be requried" })

        } else if (!address.shipping.street) {
            return res.status(400).send({ status: false, message: "shipping street must be requried" })

        } else if (!address.shipping.city) {
            return res.status(400).send({ status: false, message: "shipping city must be requried" })

        } else if (!address.shipping.pincode) {
            return res.status(400).send({ status: false, message: "shipping pincode must be requried" })

        }else if (!address.billing.street) {
            return res.status(400).send({ status: false, message: "billing street must be requried" })

        } else if (!address.billing.city) {
            return res.status(400).send({ status: false, message: "billing city must be requried" })

        } else if (!address.billing.pincode) {
            return res.status(400).send({ status: false, message: "billing pincode must be requried" })

        } else if (address != undefined) {
            if (address.shipping.street != undefined) {
                if (typeof address.shipping.street != 'string' || address.shipping.street.trim().length == 0) {
                    return res.status(400).send({ status: false, message: "shipping street can not be a empty string" })
                }
            }
            if (address.shipping.city != undefined) {
                if (typeof address.shipping.city != 'string' || address.shipping.city.trim().length == 0) {
                    return res.status(400).send({ status: false, message: "shipping city can not be a empty string" })
                }
            }

            if (address.shipping.pincode != undefined) {
                if (address.shipping.pincode.toString().trim().length == 0 || address.shipping.pincode.toString().trim().length != 6) {
                    return res.status(400).send({ status: false, message: "shipping Pincode can not be a empty string or must be 6 digit number " })
                }
            }
            if (address.billing.street != undefined) {
                if (typeof address.billing.street != 'string' || address.billing.street.trim().length == 0) {
                    return res.status(400).send({ status: false, message: "billing street can not be a empty string" })
                }
            }
            if (address.billing.city != undefined) {
                if (typeof address.billing.city != 'string' || address.billing.city.trim().length == 0) {
                    return res.status(400).send({ status: false, message: "billing city can not be a empty string" })
                }
            }

            if (address.billing.pincode != undefined) {
                if (address.billing.pincode.toString().trim().length == 0 || address.billing.pincode.toString().trim().length != 6) {
                    return res.status(400).send({ status: false, message: "billing Pincode can not be a empty string or must be 6 digit number " })
                }
            }
        }
        
        
        if (!emailValidator.test(email)) {
            return res.status(400).send({ status: false, message: "email id must be valid formate" })

        }  if (!phoneValidator.test(phone)) {
            return res.status(400).send({ status: false, message: "phone no must be valid formate" })

        }

        let phoneNoInDB = await userModel.findOne({ phone })
        if (phoneNoInDB) {
            return res.status(400).send({ status: false, message: "phoneNo. number already registered" })
        }

        let EmailIdINDB = await userModel.findOne({ email })

        if (EmailIdINDB) {
            return res.status(400).send({ status: false, message: "Email id. already registered" })
        }

        if (password.length < 8) {
            return res.status(400).send({ status: false, message: "Your password must be at least 8 characters" })
        }
        if (password.length > 15) {
            return res.status(400).send({ status: false, message: "Password cannot be more than 15 characters" })
        }
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        data.password = hash;



        let allData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", message: allData })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser }




