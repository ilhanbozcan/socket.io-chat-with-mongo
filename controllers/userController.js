const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatDB');

const users = require('../models/users.js');
const express = require('express');







let db = mongoose.connection;

//Check connection
db.once('open', function () {
    //console.log('Connected');
})


//check db
db.on('error', function () {
    console.log(err);
});


module.exports.loginPageGet = function (req, res) {
    res
        .status(200)
        .render('login.ejs');
};

module.exports.registerPageGet = function (req, res) {
    data = { msg: 'No' };
    res
        .status(200)
        .render('register.ejs', data);
};


module.exports.indexPageGet = function (req, res) {
    console.log('**********************');

    //console.log('username in index' + req.session.userID );
    console.log('username'+ req.session.username);
    res.render('index.ejs',{'username': req.session.username});
    //console.log('loaded');

};



module.exports.loginPagePost = function (req, res) {
    
   // console.log('username ' +req.body.username);
    users.find({ 'username': req.body.username, 'password': req.body.password }, function (err, result) {
        //console.log(result);
        if (result.length > 0) {

            req.session.username = req.body.username;
            //console.log('login posted');
            
            res.redirect('/');
        }
        else {
            console.log('There is no user');
            res.redirect('/login');
        }
    });
};


module.exports.registerPagePost = function (req, res) {
    let user = new users();
    user.username = req.body.username;
    user.password = req.body.password;
    user.longitude = null;
    user.latitude = null;
    user.socketID = null;
    users.find({ 'username': req.body.username }, function (err, existUser) {
        //console.log(existUser.length);
        //console.log(existUser);
        if (existUser.length === 0) { // There is no user so u can create new one

            if (user.save()) {
                console.log('Saved');
                res.redirect('/login');
            }
            else {
                console.log('SMTH WORNG');
            }

        }

        else { // There is user with same name

            data = { msg: 'There are user with same username' };
            res.render('register.ejs', data);

        }
    });
};