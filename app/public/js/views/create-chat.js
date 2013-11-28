var cc = new createChatController();

// form //

$('#createchat-form').ajaxForm({
    success	: function(responseText, status, xhr, $form){
        if (status == 'success') window.location.href = '/home';
    },
    error : function(e){
        console.log("createChatController failed.")
    }
});