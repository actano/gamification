module.exports = function ConversationStore(conversations = {}) {


  this.get = function(message) {
    return conversations[`${message.meta.channel_id}-${message.meta.user_id}`];
  };

  this.next = function(message, cb) {
    conversations[`${message.meta.channel_id}-${message.meta.user_id}`] = cb;
  };

  this.end = function(message) {
    conversations[`${message.meta.channel_id}-${message.meta.user_id}`] = undefined
  }
};
