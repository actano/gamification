const TaskStore = require('./task-store');
const uuid = require('node-uuid');
const expect = require('chai').expect;
const async = require('co').wrap;

describe('TaskStore', function() {

  this.timeout(10000);

  const store = new TaskStore();
  let created = [];

  const createAndSaveTask = async(function*(attributes = {}) {
    let taskId = uuid.v4();
    let task = Object.assign({ taskId, title: 'Task title' }, attributes);
    yield store.save(task);
    created.push(task.taskId);
    return task;
  });

  afterEach('clean up', async(function*() {
    return yield created.map((taskId) => {
      return store.remove(taskId);
    });
  }));

  it('should save a task', async(function*() {
    yield createAndSaveTask();
  }));

  it('should remove a tasks', async(function*() {
    let {taskId} = yield createAndSaveTask();
    yield store.remove(taskId);
    created.pop();
  }));

  it('should get a task', async(function*() {
    let task = yield createAndSaveTask();
    let returnedTask = yield store.get(task.taskId);
    expect(returnedTask).to.eql(task);
  }));

  it('should get tasks by streamId', async(function*() {
    let streamId = uuid.v4();
    let taskList = yield [
      createAndSaveTask({streamId, statusId: 'planned'}),
      createAndSaveTask({streamId, statusId: 'done'})
    ];
    let returnedTaskList = yield store.getByStreamId(streamId);
    expect(returnedTaskList).to.deep.include(taskList[0]);
    expect(returnedTaskList).to.deep.include(taskList[1]);
  }));

});
