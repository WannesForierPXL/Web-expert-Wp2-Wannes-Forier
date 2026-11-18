const User = require('../models/userModel.js');

async function findAll() {
    return User.find({},{hashedPassword: 0});
}

module.exports = { findAll };