const async = require('co').wrap;
var AWS = require('aws-sdk');

const objectToItem = (task) => {
  return Object.keys(task).reduce((item, key) => {
    let taskValue = task[key];
    let itemType = 'S';
    if (Array.isArray(taskValue)) {
      itemType = 'SS';
    }
    let itemValue = {};
    itemValue[itemType] = taskValue;
    item[key] = itemValue;
    return item;
  }, {})
};

const itemToObject = (item) => {
  return Object.keys(item).reduce((task, key) => {
    task[key] = item[key][Object.keys(item[key])[0]];
    return task;
  }, {})
};

module.exports = function TaskStore(dynamo = new AWS.DynamoDB({
  region: 'us-west-1'
})) {

  this.get = async(function*(taskId) {
    let resp = yield dynamo.getItem({
      TableName: 'tasks',
      Key: objectToItem({taskId})
    }).promise();
    return itemToObject(resp.Item)
  });

  this.getByStreamId = async(function*(streamId) {
    let resp = yield dynamo.query({
      TableName: 'tasks',
      IndexName: 'streamId-index',
      KeyConditionExpression: 'streamId = :streamId',
      ExpressionAttributeValues: {
        ':streamId': {
          'S': streamId
        }
      }
    }).promise();
    return resp.Items.map(itemToObject);
  });

  this.save = async(function*(task) {
    return yield dynamo.putItem({
      TableName: 'tasks',
      Item: objectToItem(task)
    }).promise();
  });

  this.remove = async(function*(taskId) {
    return yield dynamo.deleteItem({
      TableName: 'tasks',
      Key: objectToItem({taskId})
    }).promise();
  });
};
