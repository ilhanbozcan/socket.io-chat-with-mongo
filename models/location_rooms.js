let mongoose = require('mongoose');


let locationRooms = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    longitude:{
        type: Number,
        required: true
    },
    latitude:{
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('location_rooms',locationRooms);