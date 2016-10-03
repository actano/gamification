const express = require('express')
const Slapp = require('slapp')
const BeepBoopContext = require('slapp-context-beepboop')

if (!process.env.PORT) throw Error('PORT missing but required')

var app = express();
var slapp = Slapp({ context: BeepBoopContext() })

slapp.message('^(hi|hello|hey).*', ['direct_mention', 'direct_message'], (msg, text, greeting) => {
  msg
      .say(`${greeting}, how are you?`)
      .route('handleHowAreYou')  // where to route the next msg in the conversation
})

// register a route handler
slapp.route('handleHowAreYou', (msg) => {
  // respond with a random entry from array
  msg.say(['Me too', 'Noted', 'That is interesting'])
})

const HelpActions = require('./lib/help-actions')
const helpActions = new HelpActions()

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

// attach handlers to an Express app
slapp.attachToExpress(app).listen(process.env.PORT)
