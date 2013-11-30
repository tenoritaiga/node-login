var cc = new CreateChatController();

// form //

console.log("create-chat.js is running");

$('#createchat-form').ajaxForm({
    success	: function(responseText, status, xhr, $form){
        console.log("create-chat.js got success");
        if (status == 'success') window.location.href = '/home';
    },
    error : function(e){
        console.log("createChatController failed.")
    }
});