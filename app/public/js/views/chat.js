$(document).ready(function(){
    $("span").click(function (){
        displayNewTab($(this).text());
    });
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

    socket.on('message', function (data) {
	//console.log("got message from server: "+data);
        if(data.message) {

            //console.log(data.message);
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
            var encrypted = openpgp.write_encrypted_message(pubkey,text);
            socket.emit('send', { message: encrypted, username: name, room: getChatroom(), time: timestamp});
            field.value = "";
        //}
    };

}
