const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')


///// validator functions /////
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


///------------------------------------------file -----------------------------------///

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}



const phoneValidator = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/

const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/

const fnameValidator = /[A-Z][a-z]*/

const lnameValidator = /[A-Z]+([ '-][a-zA-Z]+)*/

const pincodeValidator = /^([0-9]{6})+$/

const passwordValidator = /^[a-z0-9@#$%^&*+=_\-><,\`~\/?!:;|]{8,15}$/

// const imageFile = /(\.jpg|\.jpeg|\.png|\.gif)$/i;


let createUser = async (req, res) => {

    try {
        let files = req.files

        if (!Object.keys(req.body).length > 0) {
            return res.status(400).send({ status: false, message: "body must be requried !!!!!!!!!!!!!!!!!!!" })
        }

        if (!Object.keys(files).length > 0) {
            return res.status(400).send({ status: false, message: "image file must be requried !!!!!!!!!!!!!!!!!!!" })
        }

        if (!Object.keys(req.body.data).length > 0) {
            return res.status(400).send({ status: false, message: "body must be requried !!!!!!!!!!!!!!!!!!!" })
        }

        let data = JSON.parse(req.body.data)

        let { fname, lname, email, phone, password, address } = data

        if (!Object.keys(data).length > 0) {
            return res.status(400).send({ status: false, message: "body must be requried" })

        } else if (!fname) {
            return res.status(400).send({ status: false, message: "fname must be requried" })

        } else if (!lname) {
            return res.status(400).send({ status: false, message: "lname must be requried" })

        } else if (!email) {
            return res.status(400).send({ status: false, message: "email must be requried" })

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

        } else if (!address.billing.street) {
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

        } if (!phoneValidator.test(phone)) {
            return res.status(400).send({ status: false, message: "phone no must be valid formate" })

        }

        let EmailIdINDB = await userModel.findOne({ email })
        if (EmailIdINDB) {
            return res.status(400).send({ status: false, message: "Email id. already registered" })
        }

        let phoneNoInDB = await userModel.findOne({ phone })
        if (phoneNoInDB) {
            return res.status(400).send({ status: false, message: "phoneNo. number already registered" })
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

        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let p = await uploadFile(files[0])
            data.profileImage = p;
        } else if (!files) {
            return res.status(400).send({ status: false, message: "image file not found" })
        }

        let allData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: allData })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//////////////////////////////////////////////////////   [ login ]   ////////////////////////////////////////////////////

const userLogin = async function (req, res) {

    try {

        let body = req.body
        let { email, password } = body

        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "body must be present !!" })
        } else if (!email) {
            return res.status(400).send({ status: false, message: "email must be present" })

        } else if (!password) {
            return res.status(400).send({ status: false, message: "password must be present" })

        } else if (!emailValidator.test(email)) {
            return res.status(400).send({ status: false, message: "email must be valid formate" })
        }

        let checkEmail = await userModel.findOne({ email: email })
        if (!checkEmail) {
            return res.status(404).send({ status: false, message: "Please check email and try again" })
        }

        let checkPassword = await bcrypt.compare(password, checkEmail.password)

        if (!checkPassword) {
            return res.status(404).send({ status: false, message: "Please check password and try again" })
        }

        let token = jwt.sign({
            userLogin: checkEmail._id.toString(),
            Organizations: "function_group_18_uranium",
            iat: Math.floor(Date.now() * 1000 + (60 * 60)),
            exp: Math.floor(Date.now() * 1000 + (60 * 60)),
        }, "key@$%&*0101")

        res.setHeader("function_group_18_uranium", token)
        return res.status(201).send({ status: true, message: "User login successfull", data: { userId: checkEmail._id, token } })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}



///////////////////////////////////////////////////// [ get details ]  /////////////////////////////////////////////////////

let getDetails = async function (req, res) {

    let user_id = req.params.userId;

    var isValid = mongoose.Types.ObjectId.isValid(user_id);
    if (isValid == false) {
        return res
            .status(400)
            .send({ status: false, message: "please provide valid userId" });
    }
    let userDetails = await userModel.findById(user_id);
    if (userDetails == null) {
        return res.status(404).send({ status: false, message: "User not found!" });
    }

    res
        .status(200)
        .send({
            status: "true",
            message: "User profile details",
            data: userDetails,
        });
};
////////////////////////////////////////////////   [ update user ]   ///////////////////////////////////////////////////

const updateUser = async function (req, res) {

    try {

        let body = req.body.data
        if(!body){
            return res.status(400).send({ status: false, msg: "body value must be present if want to update" })
        }
        let bodyData = JSON.parse(body) // convert the multi-part data from string to an object
        if(!bodyData){
            return res.status(400).send({ status: false, msg: "body value must be present if want to update" })
        }
        let { fname, lname, email, phone, password, address } = bodyData
        let userId = req.params.userId;
        let files = req.files

        if(!isValidObjectId(userId)){
            return res.status(404).send({ status: false, msg: "user Id not valid" })
        }

        let checkUser = await userModel.findById(userId)

        if (!checkUser) {
            return res.status(404).send({ status: false, msg: "No user found with this userId" })
        }

        if (fname != undefined) {
            if (Object.values(fname) == 0) {
                return res.status(400).send({ status: false, msg: "Please Provide fname" })
            }

            if (!fnameValidator.test(fname.trim())) {
                return res.status(400).send({ status: false, message: "fname must be in valid format" })
            }
        }


        if (lname != undefined) {
            if (Object.values(lname) == 0) {
                return res.status(400).send({ status: false, msg: "Please Provide lname" })
            }

            if (!lnameValidator.test(lname.trim())) {
                return res.status(400).send({ status: false, message: "lname must be in valid format" })
            }
        }

        if (email != undefined) {
            if (Object.values(email) == 0) {
                return res.status(400).send({ status: false, msg: "Please Provide email" })
            }

            if (!emailValidator.test(email.trim())) {
                return res.status(400).send({ status: false, message: "email id must be valid format" })
            }

            let find = await userModel.findOne({ email: email })
            if (find) {
                return res.status(400).send({ status: false, msg: "Already exist please enter another email" })
            }
        }

        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let p = await uploadFile(files[0])
            bodyData.profileImage = p;
        } else if (!files) {
            return res.status(400).send({ status: false, message: "image file not found" })
        }

        if (phone != undefined) {
            if (Object.values(phone) == 0) {
                return res.status(400).send({ status: false, msg: "Please Provide phone " })
            }

            if (!phoneValidator.test(phone.trim())) {
                return res.status(400).send({ status: false, message: "phone number must be valid format" })
            }

            let find = await userModel.findOne({ phone: phone })
            if (find) {
                return res.status(400).send({ status: false, msg: "Already exist please enter another phone" })
            }
        }

        if (password != undefined) {
            if (Object.values(password) == 0) {
                return res.status(400).send({ status: false, msg: "Please Provide password" })
            }

            if (password.length < 8) {
                return res.status(400).send({ status: false, message: "Your password must be at least 8 characters" })
            }
            if (password.length > 15) {
                return res.status(400).send({ status: false, message: "Password cannot be more than 15 characters" })
            }
        }

        if (address != undefined) {
            if (address.shipping != undefined) {
                if (address.shipping.street != undefined) {
                    if (typeof address.shipping.street != 'string' || address.shipping.street.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "street can not be a empty string" })
                    }

                }

                if (address.shipping.city != undefined) {
                    if (typeof address.shipping.city != 'string' || address.shipping.city.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "city can not be a empty string" })
                    }
                }

                if (address.shipping.pincode != undefined) {
                    if (address.shipping.pincode.toString().trim().length == 0 || address.shipping.pincode.toString().trim().length != 6) {
                        return res.status(400).send({ status: false, message: "shipping Pincode can not be a empty string or must be 6 digit number " })
                    }
                }

            } else {
                if (address.billing != undefined) {

                }
            }
        }

            const saltRounds = 10;
            const hash = bcrypt.hashSync(password, saltRounds);
            bodyData.password = hash;

        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, bodyData, { new: true })

        return res.status(200).send({ status: true, msg: " user have been updated successfully ", data: updatedUser })

    }

    catch (err) {

        res.status(500).send({ status: false, error: err.message })
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = { createUser, getDetails, userLogin, updateUser }




