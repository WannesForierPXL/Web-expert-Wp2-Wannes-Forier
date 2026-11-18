const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const {authenticate, authorize} = require("../middleware/authentication");
const userController = require("../controllers/userController");

router.get("/",
    cookieParser(),
    authenticate,
    authorize('admin'),
    userController.getAllUsers
);

module.exports = router;
