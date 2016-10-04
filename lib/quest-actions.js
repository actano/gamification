const uuid = require('node-uuid');

const {map} = require('lodash')

// const {taskAttachment} = require('./task-message');
const {safeAsync} = require('./async');
const questStore = require('./quest-store');

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

module.exports = function QuestActions(store = {}) {
    
    this.listQuests = safeAsync(function*(message, text) {
        const quests = questStore()
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
    
    this.achieveQuest = safeAsync(function*(message, questId) {
        const quests = questStore()
        let quest = quests[questId];
        store.conversations.next(message, safeAsync(function*(answer) {
            console.log(answer);
            let findMentioned = /^.*?(@\w+).*$/g;
            let match = findMentioned.exec(answer.body.text);
            let mentionedMember;
            if (match && (mentionedMember = match[2])) {
                // reload quest to avoid overriding intermediate changes
                store.game.achieveQuest(mentionedMember, questId);
                message.respond({
                    text: `Quest marked achieved for ${mentionedMember}`
                });
                store.conversations.end(answer);
            } else {
                message.respond({
                    replace_original: false,
                    response_type: 'ephemeral',
                    pretext: '',
                    attachments: [
                        {
                            pretext: `Achievement for quest ${quest.title}`,
                            text: "You need to mention the user (e.g. @bill). Try again, I'm still listening.",
                            attachment_type: 'default',
                            callback_id: 'quest_action',
                            actions: [
                                {
                                    name: "cancel",
                                    text: "Cancel",
                                    value: questId,
                                    type: "button"
                                }
                            ]
                        }
                    ]
                });
            }
        }));
        message.respond({
            replace_original: false,
            response_type: 'ephemeral',
            pretext: '',
            attachments: [
                {
                    pretext: `Achievement for quest ${quest.title}`,
                    text: "You need to mention the user (e.g. @bill).",
                    attachment_type: 'default',
                    callback_id: 'quest_action',
                    actions: [
                        {
                            name: "cancel",
                            text: "Cancel",
                            value: questId,
                            type: "button"
                        }
                    ]
                }
            ]
        });
    });
    
    
    this.questDetails = safeAsync(function*(message, questId) {
        console.log(arguments)
        const quests = questStore()
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
