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

const offerHelpAttachment = (greetings) => {
  return {
    pretext: greetings,
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
    message.respond({
      attachments: [
        offerHelpAttachment("Hi! Nice talking to you.")
      ]
    });
  };

  this.offerHelpWithIntro = (message) => {
    message.respond({
      attachments: [
        offerHelpAttachment("Hi! I'm here to help you with managing tasks.")
      ]
    });
  };

  this.showHelp = (message) => {
    message.respond({
      attachments: [
        helpAttachment()
      ]
    });
  };

  this.showHelpInteractive = (message) => {
    message.respond({
      attachments: [
        helpAttachment()
      ]
    });
  };
};
