const express = require("express");
const userController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.route("/").get(userController.getUsers);

// router.route("/signup", fileUpload.single("image")).post(userController.signup);
router.post("/signup", fileUpload.single("image"), userController.signup);
router.route("/login").post(userController.login);

module.exports = router;
