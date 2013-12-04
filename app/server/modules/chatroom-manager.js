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

var AM = require('./account-manager');

var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

var chatrooms = AM.db.collection('chatrooms');


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

var chatroomReader = function(callback)
{
    console.log("OK, READING FROM DB");

    chatrooms.find({},{chatname:true, _id:false}).toArray(
        function(e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
};


//TODO: call this from somewhere to add members when they join a chat. DB schema here may be wrong
var memberWriter = function (member, chatname, callback) {
    if (member) {

        console.log("OK, WRITING TO DB");

        var room = AM.db.collection(chatname);

        room.insert({
            "member" : data
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
exports.chatroomReader = chatroomReader;
exports.memberWriter = memberWriter;