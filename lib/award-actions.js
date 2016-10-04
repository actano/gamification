const uuid = require('node-uuid');

// const {taskAttachment} = require('./task-message');
const {safeAsync} = require('./async');

const helpAttachment = () => {
    return {
        pretext: "These are the commands that I understand:",
        fields: [
            {
                value: "*/award* <number> points to <@user>",
                short: true
            },
            {
                value: "awards points to a user",
                short: true
            }
        ],
        mrkdwn_in: ["fields"]
    }
};

module.exports = function AwardActions(store = {}) {
    
    this.ladder = safeAsync(function*(message, text) {
        ladderResult = store.game.getLadder();
        message.respond({
            text: 'Current Points',
            attachments: ladderResult.map((result) => {
                console.log(result);
                return {
                    title: result.user,
                    attachment_type: 'default',
                    callback_id: 'quest_action',
                    fields: [
                        {
                            value: "*Position*",
                            short: true
                        },
                        {
                            value: result.position,
                            short: true
                        },
                        {
                            value: "*Points*",
                            short: true
                        },
                        {
                            value: result.points,
                            short: true
                        }
                    ],
                    mrkdwn_in: ["fields"]
                }
            })
        });
    });

    this.awardPoints = safeAsync(function*(message, text) {
        // TODO: we need conversation store to not have to parse the values from the action text?
        let findValues = /.*?(\d+?)\|(.*?)\|(.*)/;
        let match = findValues.exec(text);
        let points = parseInt(match[1]);
        let assignee = match[2];
        let grantor = match[3];
        store.game.awardPoints(assignee, points, grantor);
        message.respond({
            attachments: [
                {
                    pretext: `Award ${points} points to ${assignee} by ${grantor}?`,
                    text: `:white_check_mark:`
                }
            ]
        });
    });
    
    this.noPoints = safeAsync(function*(message, text) {
        // TODO: we need conversation store to not have to parse the values from the action text?
        let findValues = /.*(\d+?)\|(.*?)\|(.*)/;
        let match = findValues.exec(text);
        let points = match[1];
        let assignee = match[2];
        let grantor = match[3];
        message.respond({
            attachments: [
                {
                    pretext: `Award ${points} points to ${assignee} by ${grantor}?`,
                    text: `:negative_squared_cross_mark:`
                }
            ]
        });
    });
    
    this.checkAwardPoints = safeAsync(function*(message, text, points, assignee) {
        console.log(arguments)
        let grantor = message.body.user_name
        message.respond({
            attachments: [
                {
                    pretext: `Award ${points} points to ${assignee} by ${grantor}?`,
                    fallback: 'Yes or No?',
                    callback_id: 'award_action',
                    actions: [
                        {name: 'award_yes', text: 'Yes', type: 'button', value: `${points}|${assignee}|${grantor}`},
                        {name: 'award_no', text: 'No', type: 'button', value: `${points}|${assignee}|${grantor}`}
                    ]
                }
            ]
        });
    });
    
    this.showHelp = (message) => {
        message.respond({
            replace_original: false,
            response_type: 'ephemeral',
            pretext: '',
            attachments: [
                helpAttachment(),
            
            ]
        });
    };
};
