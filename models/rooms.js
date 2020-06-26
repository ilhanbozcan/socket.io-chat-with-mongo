let mongoose = require('mongoose');


let roomsSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    }

});

let rooms = module.exports = mongoose.model('rooms',roomsSchema);
