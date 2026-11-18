const {ValidationError, AuthorisationError, NotFoundError} = require("../errors/error");
const uuid = require('uuid');

const Task = require("../models/taskModel.js");

async function findByUserId(requestingUserId) {
    if (!uuid.validate(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }
    return Task.find({userId: requestingUserId});
}

async function updateTask(taskId, requestingUserId, {completed, todo, userId}) {
    if (!uuid.validate(taskId)) {
        throw new ValidationError('Id is not valid');
    }
    if (!uuid.validate(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }
    if (requestingUserId.toString() !== task.userId.toString()) {
        throw new AuthorisationError('User is not the owner of the task');
    }

    if (completed !== undefined) task.completed = completed;
    if (todo !== undefined) task.todo = todo;
    if (userId !== undefined) {
        throw new AuthorisationError("Reassigning userId of a task is not allowed");
    }

    const validationError = task.validateSync();
    if (validationError) {
        throw new ValidationError(`Validation failed: ${validationError.message}`);
    }
    return task.save({validateBeforeSave: false});
}

async function findAll() {
    return Task.find({}).populate('userId', 'username');
}

module.exports = {findByUserId, updateTask, findAll};
