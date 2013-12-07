var displayNewTab = function(newTabName)
{
    $("#newTabLi").removeClass("active");
    $("<li class ='tab active'><a href='#' data-toggle='tab'>"
        + newTabName + "</a></li>").insertBefore("#newTabLi");
}

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
    //Display tabs from database
    $.ajax({
        type: "POST",
        url: '/chatloader',
        data: {function: "getUserChatrooms"}

    }).done(function(data, status){
            data.forEach(function (element, index, array) {
                displayNewTab(element);
            });
        }).fail(function (data, status){
            alert(data.toString() + " " + status);
        });

    //When user wants to join friends chat
    $("li > span").click(function (){
        var text = $(this).text();
        addChat(text);
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

    $(".tab").click
    (
        function()
        {

            if($(this).children().first().text() != "New" && !$(this).hasClass("active"))
            {
                console.log("Triggered");
                $(".tab").removeClass("active");
                $(this).addClass("active");
                loadChat($(this).text());
                console.log("User clicked on " + $(this).text());
            }

        }
    );

    $("#newChatroomSubmit").click
    (
        function()
        {
            createNewRoom();
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
            loadChat(newName);
            addChat(newName);

        }
    }

    var loadChat = function(chatroomName)
    {
        $("#chatbox").val("");
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
    loadChat("Chat 1");

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

    var messages = [];
    var socket = io.connect('http://localhost:8080');
    var field = document.getElementById("inputMessage");
    var sendButton = document.getElementById("inputSend");
    var content = document.getElementById("chatbox");

    //placeOverlay();
    //generateKeypair();
    var pubkey = generateKeypair(name,'supersecretpassphrase');
    //removeOverlay();


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

    socket.on('connect', function(){
        // call the server-side function 'adduser' and send username
        socket.emit('adduser', name);
    });

    socket.on('message', function (data) {
	//console.log("got message from server: "+data);
        if(data.message) {

            console.log("PRINTER GOT " + data.message);
            //BAD - don't encrypt here, this will be after the plaintext has left the browser
            //data.message = openpgp.write_encrypted_message(pubkey,data.message);
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].time ? messages[i].time : 'Unknown') + " " +(messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }

            //console.log(content.innerHTML);
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
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
        return "Dummy chatroom";
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
