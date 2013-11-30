function CreateChatController() {

    // bind event listeners to button clicks //
    //var that = this;

// handle user logout //
    $('#button-create').click(function () {
        console.log("The click function registered in createChatController");
        //that.attemptLogout();
    });


//    this.attemptLogout = function()
//    {
//        console.log("attemptLogout was called in createChatController, so that's good...");
//        var that = this;
//        $.ajax({
//            url: "/home",
//            type: "POST",
//            data: {logout : true},
//            success: function(data){
//                that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
//            },
//            error: function(jqXHR){
//                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
//            }
//        });
//    }


}