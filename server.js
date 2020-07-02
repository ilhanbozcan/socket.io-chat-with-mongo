var express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const port = process.env.port || 3000;
const indexRouter = require('./routes/indexRouter');
const adminRouter = require('./routes/adminRouter');

app.use(bodyParser.urlencoded({extended: false}));
const session = require('express-session');

const users = require('./models/users.js');
const Message = require('./models/messages.js');
const Room = require('./models/rooms.js');
const LocationRooms = require('./models/location_rooms.js');


app.use(
    session({
        secret: "keyboard cat",
        cookie: { maxAge: 3600000 },
        resave: true,
        saveUninitialized: true,
    })
);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('view options', {
    layout: false
});

mongoose.connect('mongodb://localhost/chatDB');

var http = require('http');
const { Session } = require('inspector');
const router = require('./routes/indexRouter');
const { type } = require('os');
const { PassThrough } = require('stream');

var server = http.createServer(app);

var io = require('socket.io').listen(server);


app.use('/', indexRouter);
app.use('/admin', adminRouter);



server.listen('3000', () => {
    console.log('Server listening on Port 3000');
  })

//when restart set socketIds null
  users.find(({ "socketID": { "$ne": null } }), function (err, existUser) {
    existUser.forEach(user => {
        user.socketID = null;
        user.save();
    });
});


io.sockets.on('connection', function (socket) {

    


    socket.on('user-info',function(data){
        console.log(data.longitude);
        console.log(data.latitude);

        users.update({'username':data.username},{'socketID': socket.id,'longitude': data.longitude, 'latitude':data.latitude},{returnNewDocument: true},function (err, existUser) {
            if(err){
                console.log(err);
            }else{
                update_location_rooms();
                update_users();
                
            }
        });

    });

    socket.on('broadcast-message', function (data) {
        
        users.find(({ "socketID": { "$ne": null } }), function (err, clients) {
            users.find({ 'username': data.sender}, function (err, senderUser) {
                for(var i in clients ){
                    console.log('++++++++++++++++');
                    //console.log(typeof(clients[i]._id));
                    //console.log(typeof(senderUser[0]._id));
                    var message = new Message();
                    message.receiverID = clients[i]._id;
                    message.senderID = senderUser[0]._id;
                    message.message = data.content;
                    var today = new Date();
                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date+' '+time;
                    message.time_stamp = dateTime;
                    message.type = 'broadcast';

                    if(clients.length == 1){
                        message.receiverID = null;
                        message.save();

                    }
                    else if(!(clients[i]._id.equals(senderUser[0]._id))){ // block self add 
                        message.save();
                    
                    }

                }
                
    
            });

        });
        io.emit("add-message", data);
    });

        
     


    socket.on('private-message', function (data) {
        var message = new Message();

        users.find({ 'username': data.sender}, function (err, senderUser) {
            message.senderID = senderUser[0]._id;
            users.find({ 'username': data.username }, function (err, receiverUser) {
                message.receiverID = receiverUser[0]._id;
                message.message = data.content;
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                message.time_stamp = dateTime;
                message.type = 'private';
                message.save();
                });

                
        });

       


        console.log("Sending: " + data.content + " to " + data.username);
        //var uni = data.username;
        
        console.log('----------------------------');

        
        console.log('----------------------------');

        users.find(({ "socketID": { "$ne": null } }), function (err, clients) {
            //console.log(existUser);
            for (var i in clients) {
                console.log('socid: ' + clients[i].socketID);
                console.log('uname: ' + clients[i].username);
                //socket.emit('get_users', {username: rows[i].username, soc_id: rows[i].soc_id});
                if (data.username == clients[i].username) {
                    io.sockets.connected[clients[i].socketID].emit("add-message", data);
                    io.sockets.connected[socket.id].emit("add-message", data);
                    break;
                }
               
            }
            
        });



    });

    socket.on('join-room', function(room){
        //console.log('44444444444444');
        //console.log(data.username);
        socket.leaveAll();
        socket.join(room);
    });
    
    socket.on('room-message', function (data) {
        console.log('-----------------------------------------');
        users.find({ 'username': data.sender}, function (err, senderUser) {
            io.of('/').in(data.username).clients((error, clients) => {
                //clients = sockets
                console.log(typeof(clients[0]));
                console.log(typeof(senderUser[0].socketID));
                
                for (var i in clients){
                    console.log(clients[i]);
                    console.log('**************************')
                    if(clients.length == 1){
                        Room.find(({ "name": data.username}), function (err, rooms) {
                            users.find({ 'username': data.sender}, function (err, senderUser) {
                                for(var i in rooms ){
                                    var message = new Message();
                                    message.senderID = senderUser[0]._id;
                                    message.receiverID = null;
                                    message.message = data.content;
                                    var today = new Date();
                                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                    var dateTime = date+' '+time;
                                    message.time_stamp = dateTime;
                                    message.type = 'room';
                                    message.save();
                
                                }
                                
                            });
                
                        });
                    }
                    else{
                        if(clients[i] != senderUser[0].socketID){
                            Room.find(({ "name": data.username}), function (err, rooms) {
                                users.find({ 'username': data.sender}, function (err, senderUser) {
                                    for(var i in rooms ){
                                        var message = new Message();
                                        message.senderID = senderUser[0]._id;
                                        message.receiverID = rooms[i]._id;
                                        message.message = data.content;
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        var dateTime = date+' '+time;
                                        message.time_stamp = dateTime;
                                        message.type = 'room';
                                        message.save();
                                    }
                                    
                                });
                    
                            });
                        }
                    }
    
                }
            });

        });
        
        console.log('-----------------------------------------');
        //users.find(({ "socketID": { "$ne": null } }), function (err, existUser) {
        console.log("Sending room : " + data.content + " to " + data.username);
        io.sockets.in(data.username).emit('add-message', data);

    });

    socket.on('location-room-message', function (data) {
        console.log('-----------------------------------------');
        users.find({ 'username': data.sender}, function (err, senderUser) {
            io.of('/').in(data.username).clients((error, clients) => {
                //clients = sockets
                console.log(typeof(clients[0]));
                console.log(typeof(senderUser[0].socketID));
                
                for (var i in clients){
                    console.log(clients[i]);
                    console.log('**************************')
                    if(clients.length == 1){
                        LocationRooms.find(({ "name": data.username}), function (err, rooms) {
                            users.find({ 'username': data.sender}, function (err, senderUser) {
                                for(var i in rooms ){
                                    var message = new Message();
                                    message.senderID = senderUser[0]._id;
                                    message.receiverID = null;
                                    message.message = data.content;
                                    var today = new Date();
                                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                    var dateTime = date+' '+time;
                                    message.time_stamp = dateTime;
                                    message.type = 'location_room';
                                    message.save();
                
                                }
                                
                            });
                
                        });
                    }
                    else{
                        if(clients[i] != senderUser[0].socketID){
                            LocationRooms.find(({ "name": data.username}), function (err, rooms) {
                                users.find({ 'username': data.sender}, function (err, senderUser) {
                                    for(var i in rooms ){
                                        var message = new Message();
                                        message.senderID = senderUser[0]._id;
                                        message.receiverID = rooms[i]._id;
                                        message.message = data.content;
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        var dateTime = date+' '+time;
                                        message.time_stamp = dateTime;
                                        message.type = 'location_room';
                                        message.save();
                                    }
                                    
                                });
                    
                            });
                        }
                    }
    
                }
            });

        });
        
        console.log('-----------------------------------------');
        //users.find(({ "socketID": { "$ne": null } }), function (err, existUser) {
        console.log("Sending room : " + data.content + " to " + data.username);
        io.sockets.in(data.username).emit('add-message', data);

    });

    socket.on('disconnect', function () {
        users.findOneAndUpdate({'socketID':socket.id},{'socketID': null},{returnNewDocument: true},function (err, existUser) {
            if(err){
                console.log(err);
            }else{

                update_users();
                console.log(existUser)
            }
        });
        //update user socket id to null
        
    })

    function update_location_rooms() {
        console.log(' function in');
        var Rooms = [];
        users.find(({ "socketID": socket.id}), function (err, existUser) {
            console.log(existUser)

            LocationRooms.find(function(err, rooms) {
                console.log(rooms)

                rooms.forEach(room => {
                    console.log(room);
                    if(((existUser[0].latitude) >= room.latitude - 0.005) && ((existUser[0].latitude) <= room.latitude + 0.005)){
                        console.log('first if in');
                        if(((existUser[0].longitude) >= room.longitude - 0.005) && ((existUser[0].longitude) <= room.longitude + 0.005)){
                            console.log('second if in');
                            Rooms.push(room);
                            
                        }
            
                    }


                });
                console.log('Rooms : ' +Rooms);
                io.emit('location_room_list', {'rooms': Rooms});

            });
            
        });
        
    }

   

});

function update_users() {
    users.find(({ "socketID": { "$ne": null } }), function (err, existUser) {
        //console.log(existUser);
        io.emit('users_list', {'users': existUser });
    });
}


module.exports = app;