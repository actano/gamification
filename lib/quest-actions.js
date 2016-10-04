const uuid = require('node-uuid');

const yaml = require('node-yaml');

const {map} = require('lodash')

// const {taskAttachment} = require('./task-message');
const {safeAsync} = require('./async');

const helpAttachment = () => {
    return {
        pretext: "These are the commands that I understand:",
        fields: [
            {
                value: "*/quest* list | achieve <id> <@user>",
                short: true
            },
            {
                value: "list quests or mark quest achieved by a user",
                short: true
            }
        ],
        mrkdwn_in: ["fields"]
    }
};

const readQuests = () => {
    // TODO: cache! :)
    return yaml.readSync('../quests.yml');
}

module.exports = function QuestActions(store = {}) {
    
    this.listQuests = safeAsync(function*(message, text) {
        let {quests} = readQuests();
        console.log(quests)
        message.respond({
            attachments: Object.keys(quests).map((questId) => {
                let quest = quests[questId];
                console.log(questId, quest);
                return {
                    title: quest.title,
                    attachment_type: 'default',
                    callback_id: 'quest_action',
                    actions: [
                        {
                            name: "details",
                            text: "View details",
                            value: questId,
                            type: "button"
                        },
                        {
                            name: "achieve",
                            text: "Achieved",
                            value: questId,
                            type: "button"
                        }
                    ],
                    fields: []
                }
            })
        });
    });
    
    this.questDetails = safeAsync(function*(message, questId) {
        console.log(arguments)
        let {quests} = readQuests();
        let quest = quests[questId];
        // TODO: error handling
        message.respond({
            replace_original: false,
            response_type: 'ephemeral',
            pretext: '',
            attachments: [
                {
                    pretext: `Details for quest ${quest.title}`,
                    fields: [
                        {
                            value: "*Description*",
                            short: true
                        },
                        {
                            value: quest.description,
                            short: false
                        },
                        {
                            value: "*Points*",
                            short: true
                        },
                        {
                            value: quest.points,
                            short: false
                        }
                    ],
                    mrkdwn_in: ["fields"]
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
