const userService = require("../services/userService");

async function getAllUsers(req, res, next) {
    try {
        const status = 200;
        const users = await userService.findAll();
        res.status(status).json(users);
    } catch (err) {
        next(err);
    }
}

module.exports = {getAllUsers};