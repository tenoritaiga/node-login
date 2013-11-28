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

var messages = db.collection('messages');


var messageWriter = function (data, req, res) {
    //console.log("THREAD STORAGE got message from server: " + data);
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