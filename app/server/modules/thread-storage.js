var AM = require('./account-manager');

var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

var messages = AM.db.collection('messages');

var messageWriter = function (data) {
    //console.log("THREAD STORAGE got message from server: " + data);

    //var messages = AM.db.collection(data.chatname);

    if (data.message) {

        console.log("OK, WRITING TO DB");

        messages.insert({
            "username" : data.username,
            "message" : data.message
        }, function(e){
            if (e){
                console.log("Something bad happened while trying to write to db.");
            }
        });

    } else {
        console.log("There is a problem:", data);
    }
}

exports.messageWriter = messageWriter;