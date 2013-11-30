function ChatroomController() {

    // bind event listeners to button clicks //
    var that = this;

// handle user logout //
    $('#button-create').click(function () {
        console.log("The click function registered in ChatroomController");
        that.writeChatName();
    });

    this.writeChatName = function()
    {
        console.log("writeChatName was called in ChatroomController, so that's good...");
        console.log("The chat name we got outside is: " + $('#chatname').val() );
        //var that = this;
        $.ajax({
            url: "/chatloader",
            type: "POST",
            data: {chatname: $('#chatname').val()},
            success: function(data){
                console.log("Success, got " + data.chatname);
            },
            error: function(err){
                console.log(err.responseText+' :: '+err.statusText);
            }
        });
    }
}