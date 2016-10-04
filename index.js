const express = require('express')
const Slapp = require('slapp')
const BeepBoopContext = require('slapp-context-beepboop')

if (!process.env.PORT) throw Error('PORT missing but required')

var app = express();
var slapp = Slapp({ context: BeepBoopContext() })

const AwardActions = require('./lib/award-actions')
const HelpActions = require('./lib/help-actions')
const TaskActions = require('./lib/task-actions')
const TaskStore = require('./lib/task-store')
const ConversationStore = require('./lib/conversation-store')

store = {
  tasks: new TaskStore(),
  conversations: new ConversationStore()
};

const awardActions = new AwardActions(store);
const taskActions = new TaskActions(store);
const helpActions = new HelpActions();

/**
 * Award commands
 */
slapp.command('/award', /.*(\d+).*(@\w+).*/, awardActions.checkAwardPoints);
slapp.command('/award', awardActions.showHelp);

/**
 * Award actions
 */
slapp.action('award_action', 'award_yes', awardActions.awardPoints);
slapp.action('award_action', 'award_no', awardActions.noPoints);

/**
 * Task commands
 */
slapp.command('/plan', taskActions.addTask);
slapp.command('/tasks', taskActions.listTasks);

/**
 * Task actions
 */
slapp.action('task_action', 'remove', taskActions.removeTask);
slapp.action('task_action', 'list_assign_options', taskActions.listAssignOptions);
slapp.action('task_action', 'assign_self', taskActions.assignSelf);
slapp.action('task_action', 'assign_any', taskActions.assignAny);
slapp.action('task_action', 'cancel', taskActions.showDetails);
slapp.action('task_action', 'details', taskActions.showDetails);
slapp.action('task_action', 'list_status_options', taskActions.listStatusOptions);
slapp.action('task_action', 'set_status', taskActions.setStatus);
slapp.action('task_action', 'set_description', taskActions.setDescription);
slapp.action('task_action', 'set_title', taskActions.setTitle);

slapp.use((message, next) => {
  const event = message.body.event
  if (event
      && event.type == 'message'
      && event.subtype == 'channel_join'
      && event.text.indexOf(message.meta.bot_user_id) !== -1) {
    helpActions.offerHelpWithIntro(message)
  } else {
    next()
  }
})

slapp.command('/workstreams', helpActions.showHelp)
slapp.action('help', 'show', helpActions.showHelp)

/**
 * Handle replies in conversations
 */
slapp.command('/reply', (message) => {
  let conversation = store.conversations.get(message);
  if (conversation) {
    conversation(message);
  } else {
    console.log("Saw a repl without an open conversation")
  }
})

// attach handlers to an Express app
slapp.attachToExpress(app).listen(process.env.PORT)
