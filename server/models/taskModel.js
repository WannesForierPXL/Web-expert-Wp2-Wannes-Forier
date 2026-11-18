const mongoose = require('mongoose');
const uuid = require('uuid');

const taskSchema = new mongoose.Schema(
    {
        todo: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[A-Za-z0-9 ]+$/.test(value);
                },
                message: (props) => `${props.value} is not a valid todo`
            },
            required: [true, 'Todo is required']
        },
        completed: {
            type: Boolean,
            default: false
        },
        userId: {
            type: String,
            ref: 'User',
            validate: {
                validator: function (value) {
                    return uuid.validate(value);
                },
                message: (props) => `${props.value} is not a valid uuid.`
            }
        },
        _id: {
            type: String,
            required: true,
            default: uuid.v4,
            validate: {
                validator: function (value) {
                    return uuid.validate(value);
                },
                message: (props) => `${props.value} is not a valid uuid.`
            }
        }
    },
    {
        collection: 'tasks'
    }
);
module.exports = mongoose.model('Task', taskSchema);


