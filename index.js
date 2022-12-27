const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const Image = require('./model/image');

require('dotenv').config();

//connecting to database:
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true },(err) => {
    if(err){
        console.log(err);
    }else{
        console.log("connected to DataBase!")
    }
});

// middleware:
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set("view engine", "ejs");

//setting multer storage:

var storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null, 'uploads');
    },
    filename : (req,file,cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});


var upload = multer({ storage : storage});

app.get('/',(req,res) => {
    Image.find({},(err,items) => {
        if(err){
            console.log(err);
            res.status(500).send('an error occurred',err);
        }else{
            res.render('index',{items : items});
        }
    });
});

app.post('/', upload.single('image'), (req, res, next) => {
 
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    Image.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
});



const PORT = process.env.PORT || 3000 ;
app.listen(PORT,(err) => {
    if(err){
        console.log("Unable to access the port!");
        console.log(err);
    }else{
        console.log(`Server is started on ${PORT}`);
    }
})
