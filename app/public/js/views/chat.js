window.onload = function() {

    var messages = [];
    var socket = io.connect('http://localhost:3700');
    var field = document.getElementById("inputMessage");
    var sendButton = document.getElementById("inputSend");
    var content = document.getElementById("chatbox");
    //var name = document.getElementById("name");
    var name = "Tony";
    //placeOverlay();
    //generateKeypair();
    var pubkey = generateKeypair(name,'supersecretpassphrase');
    //removeOverlay();

    socket.on('message', function (data) {
        if(data.message) {

            //console.log(data.message);
            //data.message = openpgp.write_encrypted_message(pubkey,data.message);
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].time ? messages[i].time : Unknown) + " " +(messages[i].username ? messages[i].username : 'Server') + ': </b>';
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

    sendButton.onclick = sendMessage = function() {
        var timestamp = getTimestamp();
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            socket.emit('send', { message: text, username: name, time: timestamp});
            field.value = "";
        }
    };

}