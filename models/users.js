let mongoose = require('mongoose');

//users schema

let usersSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    socketID:{
        type: String
    },
    longitude:{
        type: Number
    },
    latitude:{
        type: Number
    }


});

let users = module.exports = mongoose.model('users',usersSchema);
