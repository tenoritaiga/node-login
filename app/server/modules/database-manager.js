var scrypt      = require('scrypt');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});

var accounts = db.collection('accounts');
var chatrooms = db.collection('chatrooms');
var messages = db.collection('messages');


function openDatabase(callback) {
    db.open(function(err, db) {
        if (err)
            return callback(err);

        console.log('Connected successfully to MongoDB.');

        return callback(null, db);
    });
}

openDatabase(function(err, db) {
    if (err) {
        console.log('ERROR CONNECTING TO DATABASE');
        console.log(err);
        process.exit(1);
    }
});

exports.db = db;
exports.openDatabase = openDatabase;

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
    accounts.findOne({user:user}, function(e, o) {
        if (o){
            o.pass == pass ? callback(o) : callback(null);
        }else{
            callback(null);
        }
    });
}

exports.manualLogin = function(user, pass, callback)
{
    accounts.findOne({user:user}, function(e, o) {
        if (o == null){
            callback('user-not-found');
        }	else{
            validatePassword(pass, o.pass, function(err, res) {
                if (res){
                    callback(null, o);
                }	else{
                    callback('invalid-password');
                }
            });
        }
    });
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
    accounts.findOne({user:newData.user}, function(e, o) {
        if (o){
            callback('username-taken');
        }	else{
            accounts.findOne({email:newData.email}, function(e, o) {
                if (o){
                    callback('email-taken');
                }	else{
                    saltAndHash(newData.pass, function(hash){
                        newData.pass = hash;
                        // append date stamp when record was created //
                        newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                        newData.chatrooms = [];
                        newData.friends = [];
                        accounts.insert(newData, {safe: true}, callback);
                    });
                }
            });
        }
    });
}

exports.updateAccount = function(newData, callback)
{
    accounts.findOne({user:newData.user}, function(e, o){
        o.name 		= newData.name;
        o.email 	= newData.email;
        o.country 	= newData.country;
        if (newData.pass == ''){
            accounts.save(o, {safe: true}, function(err) {
                if (err) callback(err);
                else callback(null, o);
            });
        }	else{
            saltAndHash(newData.pass, function(hash){
                o.pass = hash;
                accounts.save(o, {safe: true}, function(err) {
                    if (err) callback(err);
                    else callback(null, o);
                });
            });
        }
    });
}

exports.updatePassword = function(email, newPass, callback)
{
    accounts.findOne({email:email}, function(e, o){
        if (e){
            callback(e, null);
        }	else{
            saltAndHash(newPass, function(hash){
                o.pass = hash;
                accounts.save(o, {safe: true}, callback);
            });
        }
    });
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
    accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
    accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
    accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
        callback(o ? 'ok' : null);
    });
}

exports.getAllRecords = function(callback)
{
    accounts.find().toArray(
        function(e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
};

exports.delAllRecords = function(callback)
{
    accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

/* Upgraded with super scrypt powers */
var saltAndHash = function(pass, callback) {

    //console.log("Launching scrypt");

    scrypt.passwordHash(pass,0.1,function(err, pwdhash) {
        if(!err) {
            callback(pwdhash);
        }
        else {
            console.log("Scrypt failed...")
        }
    });
}

var validatePassword = function (plainPass, hashedPass, callback)
{
    scrypt.verifyHash(hashedPass,plainPass,function(err, result) {
        if(!err) {
            //Password matched
            callback(null,result);
        }
        else {
            //Password did not match
            callback(null,result);
        }
    });

}

/* auxiliary methods */

var getObjectId = function(id)
{
    return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

var findById = function(id, callback)
{
    accounts.findOne({_id: getObjectId(id)},
        function(e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
    accounts.find( { $or : a } ).toArray(
        function(e, results) {
            if (e) callback(e)
            else callback(null, results)
        });
}

exports.writeChatroom = function (data, callback) {
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

exports.addChatToUser = function(username, chatname, callback)
{
    accounts.findOne({user:username}, function(e, user){
        console.log("trying to find: " + username);
            accounts.findOne({user:username, chatrooms:chatname}, function(e, o){
                console.log(username);
                console.log(chatname);
                if(!e){
                    user.chatrooms.push(chatname);
                    accounts.save(user, {safe: true},function(e, o){});
                    callback("added", user);
                } else {
                    callback("You are already in that channel!", user);
                }
            });
    });
}

exports.addFriendToUser = function(username, friendName, callback)
{
    accounts.findOne({user:username}, function(e, user){
        console.log("looking for : " + username + ", " + friendName);
        accounts.findOne({user:username, friends:friendName}, function(e, o){
                if(!o){ // check to make sure friend not already added
                    accounts.findOne({user:friendName}, function(e, friend){
                        if(friend){
                            user.friends.push(friendName);
                            accounts.save(user, {safe: true},function(e, blah){});
                            callback("Friend added", friend);
                        } else {
                            // friend does not exist
                            callback("That user does not exist!", friend);
                        }
                    });

            } else {
                callback("You already have that friend!", user);
            }
        });
    });
}
exports.getUserChatrooms = function(username, callback)
{
    accounts.findOne({user:username}, function(err, user){
        console.log(username);
        if (user){
            callback(null, user.chatrooms);
        } else {
            callback(null, "no such user");
        }
    });
}

exports.readChatrooms = function(user, callback)
{
    chatrooms.find({},{chatname:true, _id:false}).toArray(
        function(e, res) {
            if (e)
                callback(e);
            else
                callback(null, res);
    });
};


//TODO: call this from somewhere to add members when they join a chat. DB schema here may be wrong
exports.writeMember = function (member, chatname, callback) {
    if (member) {

        console.log("OK, WRITING TO DB");

        var room = db.collection(chatname);

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

exports.writeMessage = function (data) {
    console.log("writeMessage got message from server: " + data);
    console.log("Name of collection is " + data.room);

    var messages = db.collection(data.room);

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