const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const app = express();
const multer= require("multer");            ////--------AWS

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())                    ////----------AWS

///////////////// [ MONGO-DB CONNECTION ] /////////////////
mongoose.connect("mongodb+srv://Aman300:ByXZ2qfTNQNWF7Uj@cluster0.o4rcy.mongodb.net/Project-5_group_18?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

///////////////// [ ROOT API ] /////////////////
app.use('/', route)

///////////////// [ SERVER CONNECTION ] /////////////////
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
