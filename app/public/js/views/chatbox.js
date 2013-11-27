$(document).ready
(
	function()
	{
		var displayMessage = function(user, message)
		{
			var allMessages = $("#chatbox").val();
			var timestamp = getTimestamp();
			var output = timestamp + " " + user + ": " + message + " \n";
			$("#chatbox").val(allMessages + output);
		}

		var clearEnter = function()
		{
			$("#inputMessage").val("");
		}

		var sendToDatabase = function(user, message)
		{
		}

		var encryptMessage = function(message)
		{
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

		var getSender = function()
		{
			return "You";
		}

		var sendMessage = function()
		{
			var message = $("#inputMessage").val();
			if(message.length > 0)
			{
				displayMessage(getSender(), message);
			}
			clearEnter();
		}

		$("#inputSend").click
		(
			function()
			{
				sendMessage();
			}
		);

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
	}
);
