const express = require('express');
const app = express();
let router = express.Router();
const userController = require('../controllers/userController.js');


var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);



const redirectLoign = function(req,res,next){
    if(req.session.username){
        next();
    }
    else{
        res.redirect('/login')
    }

};




  
router
.route('/')
.get(redirectLoign,userController.indexPageGet);



router
.route('/login')
.get(userController.loginPageGet);


router
.route('/register')
.get(userController.registerPageGet);

router
.route('/login')
.post(userController.loginPagePost);

router
.route('/register')
.post(userController.registerPagePost);



module.exports = router
