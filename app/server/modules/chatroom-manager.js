/**
 * All of the logic that controls creating a new chatroom should go in here.
 * Probably we open a connection to the database, write in the name of the chat
 * that we received from the POST on create-chat.jade (passed to us from router.js)
 * into a collection called "chatrooms," and then we need to redirect the user
 * to chat.jade. chat.js will need to retrieve the names of the chats from the database
 * (for now we can retrieve and show all, we can add group membership later) and show
 * them as tabs.
 *
 */


//TODO: Have this reuse the connection from account-manager

var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
    if (e) {
        console.log(e);
    }	else{
        console.log('connected to database :: ' + dbName);
    }
});

var chatrooms = db.collection('chatrooms');


var chatroomWriter = function (data, callback) {
    if (data) {

        console.log("OK, WRITING TO DB");

        chatrooms.insert({
            "chatname" : data
        }, function(e){
            if (e){
                console.log("Something bad happened while trying to write to db.");
            }
        });

    } else {
        console.log("There is a problem:", data);
    }
}

exports.chatroomWriter = chatroomWriter;