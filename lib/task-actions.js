const uuid = require('node-uuid');

const TaskStatus = require('./task-status');
const {taskAttachment} = require('./task-message');
const {safeAsync} = require('./async');

module.exports = function TaskActions(store = {}) {

  /**
   * Adds a new task to a channel
   */
  this.addTask = safeAsync(function*(message) {
    let title = message.body.text;
    let task = {
      taskId: uuid.v4(),
      title: title,
      statusId: TaskStatus.planned.id,
      streamId: message.meta.channel_id
    };
    yield store.tasks.save(task);
    message.respond({
      attachments: [
        taskAttachment(task)
      ]
    });
  });

  /**
   * Remove a task
   */
  this.removeTask = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    yield store.tasks.remove(taskId);
    message.respond(`Removed task "${task.title}"`);
  });

  /**
   * List options for assigning a person
   */
  this.listAssignOptions = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    message.respond({
      attachments: [
        taskAttachment(task, { actions: [
          {
            name: "assign_self",
            text: "Assign me",
            value: task.taskId,
            type: "button"
          },
          {
            name: "assign_any",
            text: "Assign other",
            value: task.taskId,
            type: "button"
          }
        ]})
      ]
    });
  });

  /**
   * Assign the communicating user
   */
  this.assignSelf = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    task.assignee = message.meta.user_id;
    yield store.tasks.save(task);
    message.respond({
      attachments: [
        taskAttachment(task)
      ]
    });
  });

  /**
   * Init the assignment of a person mentioned in a following message
   */
  this.assignAny = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    store.conversations.next(message, safeAsync(function*(answer) {
      let findMentioned = /^.*(@(\w+)).*$/g;
      let match = findMentioned.exec(answer.body.text);
      let mentionedMember;
      if (match && (mentionedMember = match[2])) {
        // reload task to avoid overriding intermediate changes
        task = yield store.tasks.get(taskId);
        task.assignee = mentionedMember;
        yield store.tasks.save(task);
        message.respond({
          attachments: [
            taskAttachment(task)
          ]
        });
        store.conversations.end(answer);
      } else {
        message.respond({
          attachments: [
            taskAttachment(task, { actions: [] }),
            {
              text: "You need to mention the assignee (e.g. @bill). Try again, I'm still listening.",
              attachment_type: 'default',
              callback_id: 'task_action',
              actions: [
                {
                  name: "cancel",
                  text: "Cancel",
                  value: task.taskId,
                  type: "button"
                }
              ]
            }
          ]
        });
      }
    }));
    message.respond({
      attachments: [
        taskAttachment(task, { actions: [] }),
        {
          text: "I'm listening, please mention the assignee.",
          attachment_type: 'default',
          callback_id: 'task_action',
          actions: [
            {
              name: "cancel",
              text: "Cancel",
              value: task.taskId,
              type: "button"
            }
          ]
        }
      ]
    });
  });

  /**
   * Show the details of a task
   */
  this.showDetails = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    message.respond({
      attachments: [
        taskAttachment(task)
      ]
    });
  });

  /**
   * List statuses to select from
   */
  this.listStatusOptions = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    message.respond({
      attachments: [
        taskAttachment(task, { actions: [
          {
            name: "set_status",
            text: "Planned",
            value: JSON.stringify({
              taskId: task.taskId,
              statusId: TaskStatus.planned.id
            }),
            type: "button"
          },
          {
            name: "set_status",
            text: "In progress",
            value: JSON.stringify({
              taskId: task.taskId,
              statusId: TaskStatus.in_progress.id
            }),
            type: "button"
          },
          {
            name: "set_status",
            text: "Done",
            value: JSON.stringify({
              taskId: task.taskId,
              statusId: TaskStatus.done.id
            }),
            type: "button"
          }
        ]})
      ]
    });
  });

  /**
   * Sets the task status
   */
  this.setStatus = safeAsync(function*(message, value) {
    let {taskId, statusId} = JSON.parse(value);
    let task = yield store.tasks.get(taskId);
    task.statusId = statusId;
    message.respond({
      attachments: [
        taskAttachment(task)
      ]
    });
  });

  /**
   * Sets the task description from a text in a following message
   */
  this.setDescription = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    store.conversations.next(message, safeAsync(function*(answer) {
      // reload task to avoid overriding intermediate changes
      task = yield store.tasks.get(taskId);
      let changeText = task.description ? 'changed the' : 'added a';
      task.description = answer.body.text;
      yield store.tasks.save(task);
      message.respond({
        attachments: [
          taskAttachment(task)
        ]
      });
      store.conversations.end(answer);
    }));
    message.respond({
      attachments: [
        taskAttachment(task, { actions: [] }),
        {
          text: "I'm listening, please write a description."
        }
      ]
    });
  });

  /**
   * Sets the task title from a text in a following message
   */
  this.setTitle = safeAsync(function*(message, taskId) {
    let task = yield store.tasks.get(taskId);
    store.conversations.next(message, safeAsync(function*(answer) {
      // reload task to avoid overriding intermediate changes
      task = yield store.tasks.get(taskId);
      task.title = answer.body.text;
      yield store.tasks.save(task);
      message.respond({
        attachments: [
          taskAttachment(task)
        ]
      });
      store.conversations.end(answer);
    }));
    message.respond({
      attachments: [
        taskAttachment(task, { actions: [] }),
        {
          text: "I'm listening, please write a title."
        }
      ]
    });
  });

  /**
   * Lists the tasks of a channel, optionally filtered by status
   */
  this.listTasks = safeAsync(function*(message) {
    let tasks = yield store.tasks.getByStreamId(message.meta.channel_id);
    let requestedStatus = message.body.text;
    if (requestedStatus && TaskStatus[requestedStatus]) {
      tasks = tasks.filter((task) => {
        return TaskStatus[task.statusId].mention == requestedStatus;
      });
    }
    message.respond({
      attachments: tasks.map((task) => {
        return taskAttachment(task, {
          actions: [
            {
              name: "details",
              text: "View details",
              value: task.taskId,
              type: "button"
            }
          ],
          fields: []
        })
      })
    });
  });
};
