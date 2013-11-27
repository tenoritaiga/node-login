
$(document).ready(function(){

	var hc = new HomeController();
	var av = new AccountValidator();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (av.validateForm() == false){
				return false;
			} 	else{
			// push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') hc.onUpdateSuccess();
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
			    av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();
	$('#github-banner').css('top', '41px');

// customize the account settings form //
	
	$('#account-form h1').text('Account Settings');
	$('#account-form #sub1').text('Here are the current settings for your account.');
	$('#user-tf').attr('disabled', 'disabled');
	$('#account-form-btn1').html('Delete');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Update');

// setup the confirm window that displays when the user chooses to delete their account //

	$('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-confirm .modal-header h3').text('Delete Account');
	$('.modal-confirm .modal-body p').html('Are you sure you want to delete your account?');
	$('.modal-confirm .cancel').html('Cancel');
	$('.modal-confirm .submit').html('Delete');
	$('.modal-confirm .submit').addClass('btn-danger');

})

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