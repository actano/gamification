const helpAttachment = () => {
  return {
    pretext: "These are the commands that I understand:",
    fields: [
      {
        value: "*/plan* task title",
        short: true
      },
      {
        value: "adds a task to a channel",
        short: true
      },
      {
        value: "*/tasks* [planned | progress | done]",
        short: true
      },
      {
        value: "lists all tasks in a channel, optionally filtered by status",
        short: true
      },
      {
        value: "*/workstreams*",
        short: true
      },
      {
        value: "lists available commands",
        short: true
      }
    ],
    mrkdwn_in: ["fields"]
  }
};

const offerHelpAttachment = () => {
  return {
    text: 'Do you want to know more about how I can be of help?',
    callback_id: 'help',
    attachment_type: 'default',
    actions: [
      {
        name: "show",
        text: "List commands",
        value: "show",
        type: "button"
      }
    ]
  }
};

module.exports = HelpActions = function () {

  this.offerHelp = (message) => {
    message.say({
      text: "Hi! Nice talking to you.",
      attachments: [
        offerHelpAttachment()
      ]
    });
  };

  this.offerHelpWithIntro = (message) => {
    message.say({
      text: "Hi! I'm here to help you with managing tasks.",
      attachments: [
        offerHelpAttachment()
      ]
    });
  };

  this.showHelp = (message) => {
    message.respond({
      replace_original: false,
      response_type: 'ephemeral',
      attachments: [
        helpAttachment()
      ]
    });
  };
};
