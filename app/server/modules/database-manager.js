var scrypt      = require('scrypt');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var S           = require('string');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'pgpchat';

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
                } else {
                    saltAndHash(newData.pass, function(hash){
                        newData.pass = hash;
                        // append date stamp when record was created //
                        newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                        newData.chatrooms = ["Default"];
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
        o.name 		= S(newData.name).stripTags().s;
        o.email 	= S(newData.email).stripTags().s;
        o.country 	= S(newData.country).stripTags().s;
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

writeChatroom = function (data, callback) {
    if (data && !isChatroomPresent(data)) {
        console.log("inserting chatroom")
        chatrooms.insert({
            "chatname" : S(data).stripTags().s,
            "chatters" : []
        }, function(e){
            if (e){
                console.log("Something bad happened while trying to write to db.");
            }
        });
        console.log("Finished writeChatroom");

    } else {
        if(!isChatroomPresent(data))
            callback("Chatroom already exists");
        else
            callback("Not a valid chatroom");
        console.log("There is a problem:", data);
    }
}
exports.writeChatroom = writeChatroom;

exports.getThread = function (chatname, callback) {

    var room = db.collection(chatname);

    room.find({},{username:true, message:true, time:true, _id:false}).toArray(
        function(e, o) {
        if(!e) {
            //console.log("About to print object");
            //console.log(o);
            var arr = [];
            for(var i = 0; i < o.length; i++) {
                //arr.push(o[i].message);
                arr.push(o[i]);    //push whole object so we can get other attributes besides the message itself
            }
            callback(null, arr);
        }
        else {
            console.log("getThread: error " + e);
            callback(e, null);
        }
    });

}


exports.addChatnameToChatrooms = function(chatname, callback){
    accounts.findOne({chatname:chatname}, function(e, chatroom){
        if(chatroom){
            callback("Chatroom already exists", chatroom);
        } else {
            chatroom.insert({
                "chatname" : S(chatname).stripTags().s
            }, function(e){
                if (e){
                    console.log("Something bad happened while trying to write to db.");
                }
            });
        }
    });
}

var isChatroomPresent = function(chatname){
    accounts.findOne({chatname:chatname}, function(e, chatroom){
        if(chatroom){
            return true;
        } else {
           return false;
        }
    });
}

var getUsersFriends = function(username, callback){
    accounts.findOne({user:username}, function(e, user){
        if(user){
            callback(null, user.friends);
        } else{
            callback(null, "User does not exist"); // should technically never get here
        }
    });
}
exports.getUsersFriends = getUsersFriends;

exports.addChatToUser = function(username, chatname, callback)
{
    accounts.findOne({user:username}, function(e, user){
        console.log("trying to find: " + username);
            accounts.findOne({user:username, chatrooms:chatname}, function(e, o){
                if(!o && !isChatroomPresent(chatname)){
                    user.chatrooms.push(S(chatname).stripTags().s);
                    accounts.save(user, {safe: true},function(e, o){});
                    writeChatroom(chatname, function(e){});
                    console.log("About to add chatter");

                    addChatter(chatname, username, function(e,o){});


                    //removeChatter(chatname, username, function(e){});
                    //addChatter(chatname, "samuel", function(e,o){});
                    //console.log("chatters: " + getChatters(chatname, function(e){}));
                    //removeChatter(chatname, "samuel", function(e){});
                    //console.log("removed samuel : " + getChatters(chatname, function(e){}));
                    callback("added", user);
                } else {
                    if(!isChatroomPresent(chatname))
                        callback("That chatroom already exists");
                    else
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
                        if(friend && friend.name != user.name){
                            user.friends.push(S(friendName).stripTags().s);
                            accounts.save(user, {safe: true},function(e, blah){});
                            callback("Friend added", friend);
                        } else {
                            if(!friend){
                                callback("That user does not exist!", friend)
                            } else {
                                callback("You can't add yourself silly", friend);

                            }

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
    var defaultchat = [];
    defaultchat.push("Default");

    accounts.findOne({user:username}, function(err, user){
        console.log(username);
        if (user){
            if(user.chatrooms.length <= 0)
                callback(null,defaultchat);
            else
                callback(null, user.chatrooms);
                callback(null, user.chatrooms);
        } else {
            callback(null, "no such user");
        }
    });
}

var getChatters = function(chatname, callback){
    chatrooms.find({chatname:chatname}, function(e, chatroom) {
        if(chatroom){
            callback(chatroom.chatters);
        }
    });
}
exports.getChatters = getChatters;
var addChatter = function(chatname, username, callback){
    chatrooms.findOne({chatname:chatname}, function(e, chatroom) {
        if (chatroom){
            console.log(chatroom.chatname);
            console.log(chatroom.chatters);
            chatroom.chatters.push(S(username).stripTags().s);
            chatrooms.save(chatroom, {safe: true},function(e, o){});
            callback("Added", chatroom);
            // add user
        }else{
            callback("Chatroom doesn't exist", e);
        }
    });
}
exports.addChatter = addChatter;

var removeChatter = function(chatname, username, callback){
    chatrooms.findOne({chatname:chatname}, function(e, chatroom) {
        if (chatroom){

            var index = chatroom.chatname.indexOf(username);
            chatroom.chatname.splice(index, 1);
            chatrooms.save(chatroom, {safe: true},function(e, o){});
            callback("Removed", chatroom);
        }else{
            callback("Chatroom doesn't exist", e);
        }

    });
}
exports.removeChatter = removeChatter;

var removeChatroomFromUser = function(username, chatname, callback){
    accounts.findOne({user:username, chatrooms:chatname}, function(e, user) {
        if (user){
            var index = user.chatrooms.indexOf(chatname);
            user.chatrooms.splice(index, 1);
            accounts.save(user, {safe: true},function(e, o){});
            callback("removed", user);
        } else {
            callback("Chatroom doesn't exist", e);
        }

    });
}
exports.removeChatroomFromUser = removeChatroomFromUser;

exports.readChatrooms = function(callback)
{
    chatrooms.find({},{chatname:true, _id:false}).toArray(
        function(e, res) {
            if (e)
                callback(e);
            else
                callback(res, res);
    });
};


//TODO: call this from somewhere to add members when they join a chat. DB schema here may be wrong
exports.writeMember = function (member, chatname, callback) {
    if (member) {

        console.log("OK, WRITING TO DB");

        var room = db.collection(chatname);

        room.insert({
            "member" : S(data).stripTags().s
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
            "username" : S(data.username).stripTags().s,
            "message" : S(data.message).stripTags().s,
            "time" : S(data.time).stripTags().s
        }, function(e){
            if (e){
                console.log("Something bad happened while trying to write to db.");
            }
        });

    } else {
        console.log("There is a problem:", data);
    }
}