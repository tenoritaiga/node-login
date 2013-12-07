/**
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
**/
var express = require('express');
var http = require('http');
var app = express();

app.configure(function(){
	app.set('port', 8080);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./app/server/router')(app);

//var io = require('socket.io').listen(app.listen(ioport));

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
})

var io = require('socket.io').listen(server);
var DB = require('./app/server/modules/database-manager');

io.sockets.on('connection', function (socket) {

    console.log("socket.io got a connection");

    socket.on('adduser', function(username, room){
        console.log("Server: adduser got username: " + username + " and room: " + room);
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
        socket.room = room;

        // send client to room
        socket.join(room);

        // echo to room that user has connected
        socket.broadcast.to(room).emit('message', 'SERVER', username + ' has connected');
        //socket.emit('updaterooms', rooms, 'room1');
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('message', 'SERVER', 'you have connected to '+ newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('message', 'SERVER', socket.username+' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('message', 'SERVER', socket.username+' has joined this room');
        //socket.emit('updaterooms', rooms, newroom);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        //delete usernames[socket.username];

        // update list of users in chat, client-side
        //TODO: enable this
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });

    socket.on('send', function (data) {
        //io.sockets.emit('message', data);
        console.log("Server is emitting message " + data + " in room " + socket.room);
        io.sockets.in(socket.room).emit('message', data);
        DB.writeMessage(data);
        //TODO: make sure chat name associated with message is being written in here
    });
});