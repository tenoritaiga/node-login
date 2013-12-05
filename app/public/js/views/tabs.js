var displayNewTab = function(newTabName)
{
    alert("hello");
    $("#newTabLi").removeClass("active");
    $("<li class ='tab active'><a href='#' data-toggle='tab'>"
        + newTabName + "</a></li>").insertBefore("#newTabLi");
}

$(document).ready
(
	function()
	{
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
					$(".tab").removeClass("active");
					$(this).addClass("active");
					loadChat($(this).text());
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

			if(validRoomName(newName))
			{
				displayNewTab(newName);
				$("#newChatroomDialog").dialog("close");
				loadChat(newName);
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
	}
);
