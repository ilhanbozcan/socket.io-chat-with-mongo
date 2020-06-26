let mongoose = require('mongoose');
const { Timestamp } = require('mongodb');

//users schema

let messagesSchema = mongoose.Schema({
    senderID:{
        type: String,
        
    },
    receiverID:{
        type: String,
        
    },
    message:{
        type: String
    },
    time_stamp:{
        type: String
    },
    type:{
        type: String
    }
   


});



let messages = module.exports = mongoose.model('messages',messagesSchema);
