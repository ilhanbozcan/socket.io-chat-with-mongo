let mongoose = require('mongoose');

//users schema

let adminsSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
   


});

module.exports = mongoose.model('admins',adminsSchema);