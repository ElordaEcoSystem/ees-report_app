const express = require("express");
const router = express.Router();
const { UserController, WorkLogController } = require("../controllers");
const authenticateToken = require("../middleware/auth");
// const temp = require("../middleware/multerTemp");
const uploads = require("../middleware/multer")

//users
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.currentUser);
router.get("/user/:id", authenticateToken, UserController.getUserById);

//workLogs
router.post(
  "/worklogs",
  authenticateToken,
  uploads.single("photo"),
  WorkLogController.createWorkLog
);
router.get("/worklogs", authenticateToken, WorkLogController.getAllWorkLog);

module.exports = router;
