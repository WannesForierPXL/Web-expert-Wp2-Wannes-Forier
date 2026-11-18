const bcrypt = require('bcryptjs');

const usersIncludingPasswords = [
    {
        _id: "c7adad86-7bc8-4a9c-bf62-e3689ade2209",
        username: "user1",
        roles: ["user"],
        password: "password1",
        hashedPassword: bcrypt.hashSync("password1", 8)
    },
    {
        _id: "65484816-eba7-409f-9cbf-f8b93df19aae",
        username: "user2",
        roles: ["user"],
        password: "password2",
        hashedPassword: bcrypt.hashSync("password2", 8)
    }
];

const tasks = [
    {
        _id: "82315cfd-2999-42b0-89a8-829917fc7589",
        todo: 'task1',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "4b6db145-571e-4ad0-984f-afabba6e41ab",
        todo: 'task2',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "8f97fe6d-6ce7-4354-b051-0f0b00194cc3",
        todo: 'task3',
        completed: false,
    }
];

module.exports = {usersIncludingPasswords, tasks};
