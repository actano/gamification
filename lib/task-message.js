const TaskStatus = require('./task-status');
const {taskLink, fileLink} = require('./link-builder');

const taskAttachment = (task, options = {}) => {
  let attachment = {
    title: task.title,
    title_link: taskLink(task.taskId),
    attachment_type: 'default',
    callback_id: 'task_action'
  };
  if (options.pretext) {
    attachment.pretext = options.pretext;
  }
  if (task.description) {
    attachment.text = task.description;
  }
  if (!options.fields) {
    attachment.fields = [
      {
        title: 'Status',
        value: `${TaskStatus[task.statusId].icon}  ${TaskStatus[task.statusId].title}`,
        short: true
      },
      {
        title: 'Assignee',
        value: task.assignee ? `<@${task.assignee}>` : '-',
        short: true
      }
    ];
    if (task.attachedFiles && task.attachedFiles.length !== 0) {
      attachment.fields.push({
        title: 'Attached files',
        value: task.attachedFiles.map((fileAsText) => {
          let file = JSON.parse(fileAsText);
          return `<${fileLink(file.fileId)}|${file.title}>`
        }).join('\n'),
        short: false
      })
    }
  } else {
    task.fields = options.fields;
  }

  if (!options.actions) {
    attachment.actions = [
      {
        name: "set_title",
        text: "Edit title",
        value: task.taskId,
        type: "button"
      },
      {
        name: "set_description",
        text: task.description ? "Edit description" : "Add description",
        value: task.taskId,
        type: "button"
      },
      {
        name: "list_status_options",
        text: "Change Status",
        value: task.taskId,
        type: "button"
      },
      {
        name: "list_assign_options",
        text: task.assignee ? "Change assignee" : "Assign person",
        value: task.taskId,
        type: "button"
      },
      {
        name: "remove",
        text: "Remove",
        value: task.taskId,
        type: "button",
        style: "danger",
        confirm: {
          title: "Are you sure?",
          text: "Removing a task cannot be undone.",
          ok_text: "Yes",
          dismiss_text: "No"
        }
      }
    ];
  } else {
    attachment.actions = options.actions;
  }
  return attachment;
};

module.exports = {
  taskLink,
  taskAttachment
};
