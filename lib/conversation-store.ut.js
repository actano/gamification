const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const ConversationStore = require('./conversation-store');

describe('conversationStore', () => {

  let conversationStore = new ConversationStore();

  it('should get an added conversations', () => {
    var cb = sinon.stub();
    var message = {meta: {channel_id: 'channelId', user_id: 'userId'} };
    conversationStore.next(message, cb);
    var returnedCb = conversationStore.get(message);
    expect(returnedCb).to.equal(cb);
  });

  it('should remove a conversations on end', () => {
    var cb = sinon.stub();
    var message = {meta: {channel_id: 'channelId', user_id: 'userId'} };
    conversationStore.next(message, cb);
    var returnedCb = conversationStore.end(message);
    expect(returnedCb).to.not.exist;
  });

});
