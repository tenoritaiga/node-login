function createChatController() {

    // bind event listeners to button clicks //
    var that = this;

// handle user logout //
    $('#button-create').click(function () {
        that.attemptLogout();
    });


    this.attemptLogout = function()
    {
        var that = this;
        $.ajax({
            url: "/home",
            type: "POST",
            data: {logout : true},
            success: function(data){
                that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
            },
            error: function(jqXHR){
                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
            }
        });
    }


}