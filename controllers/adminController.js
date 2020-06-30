const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatDB');


const Admins = require('../models/users.js');



module.exports.adminLoginPageGet = function (req, res) {
    res
        .status(200)
        .render('adminLogin.ejs');
};



module.exports.adminIndexPageGet = function (req, res) {
    res
        .status(200)
        .render('adminIndex.ejs');
};

module.exports.adminLoginPagePost = function (req, res) {
    console.log('posted');
    console.log(req.body.username);
    Admins.find({ 'username': req.body.username, 'password': req.body.password}, function (err, result) {

        if (result.length > 0) {
            req.session.adminUsername = req.body.username;
            console.log('-----------');
            console.log('-----------');
            console.log('in');
            res.redirect('/admin/index');
        }
        else {
            res.redirect('/admin');
        }
    });
};




