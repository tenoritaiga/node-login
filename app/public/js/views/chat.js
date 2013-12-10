var messages = [];
var socket = io.connect('http://localhost:8080');
var field = document.getElementById("inputMessage");
var sendButton = document.getElementById("inputSend");
var content = document.getElementById("chatbox");
var container = document.getElementById("container");

var chats = [];
var currentchat;

var displayNewTab = function(newTabName)
{
    $("#tabs > li").removeClass("active");

    $("<li class ='tab active'><a href='#' data-toggle='tab'>"
        + newTabName + "</a></li>").insertBefore("#newTabLi");

}

var displayFriend = function(friendName){
    $("ul.dropdown-menu > li.divider").before('<li class="friend">' + friendName + '</li>');
}

function switchRoom(room){
    socket.emit('switchRoom', room);
}


$.ajax({
    type: "POST",
    url: '/chatloader',
    data: {function: "getUsersFriends"}

}).done(function(data, status){
        data.forEach(function (element, index, array) {
            displayFriend(element); // TODO
        });
    }).fail(function (data, status){
        alert(data.toString() + " " + status);
    });


$(document).ready(function(){
    var addChat = function(text){
        $.ajax({
            type: "POST",
            url: '/chatloader',
            data: {function: "addChatToUser", chatname:text}

        }).done(function(data, status){
                if(data == 'added'){
                    displayNewTab(text);
                } else {
                    alert(data.toString());
                }
            }).fail(function (data, status){
                alert(data.toString() + " " + status);
            });
    }
    var addFriend = function(friendName){
        $.ajax({
            type: "POST",
            url: '/chatloader',
            data: {function: "addFriendToUser", friendName:friendName}

        }).done(function(data, status){
                 if(data == 'Friend added'){
                     //display friend here
                     displayFriend(friendName);
                     $("#addFriendDialog").dialog("close");
                     alert(data.toString());
                 } else {
                    alert(data.toString());
                }
            }).fail(function (data, status){
                alert(data.toString() + " " + status);
            });
    }
    //Display tabs from database
    $.ajax({
        type: "POST",
        url: '/chatloader',
        data: {function: "getUserChatrooms"}

    }).done(function(data, status){
            data.forEach(function (element, index, array) {
                displayNewTab(element);
                chats.push(element);
            });
            currentchat = chats[0]; //This is a dirty hack
        }).fail(function (data, status){
            alert(data.toString() + " " + status);
        });

    var getThread = function(text) {

        $.ajax({
            type: "POST",
            url: '/chatloader',
            data: {function: "getThread", chatname:text}
        }).done(function(data, status) {
                var html = '';


                for(var i=0;i<data.length;i++) {
                    html += '<b>' + (data[i].time ? data[i].time : 'Unknown') + " " +(data[i].username ? data[i].username : 'Server') + ': </b>';
                    html += data[i].message + '<br />';
                }
//                data.forEach(function (messages, index, array) {
//                    //$("#chatbox").append(element);
//                    html += '<b>' + (messages[i].time ? messages[i].time : 'Unknown') + " " +(messages[i].username ? messages[i].username : 'Server') + ': </b>';
//                    html += messages[i].message + '<br />';
//                });
                content.innerHTML = html;
                content.scrollTop = content.scrollHeight;
            }).fail(function (data,status) {
                console.log("CLIENT: getThread failed...");
            });
    }

    getThread("Default");

//    var initTabs = function() {
//
//        console.log("Called initTabs");
//        $("#tabs > li").removeClass("active");
//
//    }
//
//    initTabs();

    //When user wants to join friends chat
    $('#joinFriendChatDialog').on('click', '#joinChatBtn', function(){
        var selected = $('#joinFriendChat option:selected').text();
        if(selected == ""){
            alert("Pick one idiot!");
        } else {
            addChat(selected);
            $("#joinFriendChatDialog").dialog("close");

        }
        //alert($('#joinFriendChat option:selected').text());
    });

    $('ul').on('click', '.friend', function(){
        $('#joinFriendChat')
            .find('option').remove();
        var username = $(this).text();
        $.ajax({
            type: "POST",
            url: '/chatloader',
            data: {function: "getFriendsChatrooms", username:username}

        }).done(function(data, status){
                if(data.length <= 1){
                    alert("Your friend is not in any chats!");
                    return;
                }
                $("#joinFriendChatDialog").dialog("open");
                data.forEach(function (element, index, array) {

                    if(element != 'Default')
                        $('#joinFriendChat').append($("<option></option>").text(element));
                });
            }).fail(function (data, status){
                alert(data.toString() + " " + status);
            });
        //var text = $(this).text();
        //addChat(text);
    });
    $("#addFriend").click(
        function(){
            $("#addFriendUsername").val("");
            $("#addFriendDialog").dialog("open");
    });


    $("#newTab").click
    (
        function()
        {

            $(this).removeClass("active");
            $("#newChatroomName").val("");
            $("#newChatroomDialog").dialog("open");
        }
    );
    $("#newChatroomDialog").dialog( {autoOpen: false, modal: true, draggable: false} );
    $("#addFriendDialog").dialog( {autoOpen: false, modal: true, draggable: false} );
    $("#joinFriendChatDialog").dialog( {autoOpen: false, modal: true, draggable: false} );



    $("#tabs").on('click', '#tabs > li',function()
    {

        if($(this).children().first().text() != "New" && !$(this).hasClass("active"))
        {
            $("#tabs > li").removeClass("active");
            $(this).addClass("active");
            loadChat($(this).text());
            console.log("Clicked on " + $(this).text() + ", switching to it");

            //TODO: have a check here to make sure the name returned is also in chats array
            currentchat = $(this).text();
            switchRoom(currentchat);
            loadChat(currentchat);
        }
    });


    $("#newChatroomSubmit").click
    (
        function()
        {
            createNewRoom();
        }
    );
    $("#addFriendSubmit").click
    (
        function()
        {
            submitFriend();
        }
    );
    $("#newChatroomName").keypress
    (
        function(event)
        {
            var enterKey = 13;
            if(event.which == enterKey)
            {
                createNewRoom();
            }
        }
    );
    $("#addFriendUsername").keypress
    (
        function(event)
        {
            var enterKey = 13;
            if(event.which == enterKey)
            {
                submitFriend();
            }
        }
    );
    var createNewRoom = function()
    {
        var newName = $("#newChatroomName").val();
        if(newName == 'New'){
            alert('Illegal channel name');
            return;
        }
        if(validRoomName(newName))
        {
            $("#newChatroomDialog").dialog("close");
            addChat(newName);
            //console.log("ABOUT TO TRY SWITCHING ROOM TO " + newName);
            currentchat = newName;
            switchRoom(newName);
            loadChat(newName);

        }
    }
    var submitFriend = function()
    {
        var friendName = $("#addFriendUsername").val();
        addFriend(friendName);
    }
    var loadChat = function(chatroomName)
    {
        //$("#chatbox").val("");
        getThread(chatroomName);
        $("#chatList").val(getChatters(chatroomName));
    }

    var getChatters = function(chatroomName)
    {

        //TODO: get members of chatroomName and display names in pane

        var chatters = "";
        if(chatroomName == "Chat 1")
        {
            chatters = "John\nKevin\nYou\n"
        }
        else if(chatroomName == "Chat 2")
        {
            chatters = "Mike\nYou\n"
        }
        else
        {
            chatters = "You\n";
        }
        return chatters;
    }
    //loadChat("Chat 1");

    var validRoomName = function(chatroomName)
    {
        var maxNameLength = 15;
        var minNameLength = 1;
        if(chatroomName.length > maxNameLength || chatroomName.length < minNameLength)
        {
            return false;
        }

        if(chatroomName == "New")
        {
            return false;
        }

        return true;
    }
});



window.onload = function() {

    //placeOverlay();
    //generateKeypair();
    //var pubkey = generateKeypair(name,'supersecretpassphrase');
    //removeOverlay();

    //Set background color to cookie-defined color if it exists
    if($.cookie('color') != null)
        container.style.background = $.cookie('color');

    function getCookie(c_name)
    {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1)
        {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1)
        {
            c_value = null;
        }
        else
        {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1)
            {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start,c_end));
        }
        return c_value;
    }

    //console.log("Username: " + getCookie("user"));
    var name = getCookie("user");
    console.log("chat.js is setting name to " + name);

    socket.on('connect', function(){
        // call the server-side function 'adduser' and send username
        console.log("Client: calling adduser with name " + name);
        socket.emit('adduser', name, getChatroom());
    });


    socket.on('message', function (data) {
	console.log("CLIENT: socket.on message is receiving " + data.message + " in " + data.room);
        if(data.message) {

            console.log("PRINTER GOT " + data.message);
            //BAD - don't encrypt here, this will be after the plaintext has left the browser
            //data.message = openpgp.write_encrypted_message(pubkey,data.message);
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].time ? messages[i].time : 'Unknown') + " " +(messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
                //console.log("Trying logarithms..." + Math.log(10));
            }

            //console.log(content.innerHTML);
            content.innerHTML += html;
            content.scrollTop = content.scrollHeight;
            messages = []; //clear that jaun
            //content.value = html;
        } else {
            console.log("There is a problem:", data);
        }
    });


//    socket.on('updaterooms',function(room){
//
//    });



    $("#inputMessage").keydown
    (
        function(event)
        {
            var enterKey = 13;
            if(event.which == enterKey)
            {
                sendMessage();
            }
        }
    );

    function generateKeypair(userid, passphrase) {
        if(window.crypto.getRandomValues) {
            //require("./openpgp.min.js");
            //Initialize OpenPGP.js
            openpgp.init();

            //Generate keypair
            var key = openpgp.generate_key_pair(1, 1024, userid, passphrase),
                priv_key = key.privateKey,
                pub_key = openpgp.read_publicKey(key.publicKeyArmored);

            return pub_key;

        }
        else {
            window.alert("Unfortunately, your browser doesn't support secure cryptography. Please update to a recent version of Firefox, Chrome, or Opera.");
        }
    }

    function placeOverlay() {

        var overlay = document.createElement("div");
        overlay.setAttribute("id","overlay");
        overlay.setAttribute("class", "overlay");
        var header = document.createElement("h1");
        var message = document.createTextNode("Hang tight, generating a new RSA keypair just for you...");
        header.appendChild(message);
        overlay.appendChild(header);
        document.body.appendChild(overlay);
    }

    function removeOverlay() {
        document.body.removeChild(document.getElementById("overlay"));
    }

    var getTimestamp = function()
    {
        var date = new Date();
        var hours = date.getHours();
        var sign = "AM";
        var minutes = date.getMinutes();

        //Prepend a zero if needed
        if(minutes < 10) {
            minutes = "0" + date.getMinutes().toString();
        }

        if(hours >= 12)
        {
            sign = "PM";
        }
        hours = hours % 12;

        if(hours == 0)
            hours = 12;

        return "(" + hours + ":" + minutes + " " + sign + ")";
    }

    function getChatroom() {
        //alert("getChatroom is returning " + currentchat);
        return currentchat;
    }

    sendButton.onclick = sendMessage = function() {
        var timestamp = getTimestamp();
//        if(name.value == "") {
//            alert("Please type your name!");
//        } else {
            var text = field.value;
            //var encrypted = openpgp.write_encrypted_message(pubkey,text);
            socket.emit('send', { message: text, username: name, room: getChatroom(), time: timestamp});
            field.value = "";
        //}
    };

}
