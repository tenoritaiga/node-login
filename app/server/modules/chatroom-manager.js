/**
 * All of the logic that controls creating a new chatroom should go in here.
 * Probably we open a connection to the database, write in the name of the chat
 * that we received from the POST on create-chat.jade (passed to us from router.js)
 * into a collection called "chatrooms," and then we need to redirect the user
 * to chat.jade. chat.js will need to retrieve the names of the chats from the database
 * (for now we can retrieve and show all, we can add group membership later) and show
 * them as tabs.
 *
 */