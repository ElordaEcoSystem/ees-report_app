const express = require("express");
const router = express.Router();
const { UserController, WorkLogController } = require("../controllers");
const authenticateToken = require("../middleware/auth");
// const upload = require("../middleware/multer");
const temp = require("../middleware/multerTemp");
//users
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.currentUser);
router.get("/user/:id", authenticateToken, UserController.getUserById);
// router.put("/user/:id", authenticateToken, UserController.updateUser);

//workLogs
router.post(
  "/worklogs",
  authenticateToken,
  temp.single("photo"),
  WorkLogController.createWorkLog
);
router.get("/worklogs", authenticateToken, WorkLogController.getAllWorkLog);

// //posts
// router.post("/posts", authenticateToken, PostController.createPost);
// router.get("/posts", authenticateToken, PostController.getAllPosts);
// router.get("/posts/:id", authenticateToken, PostController.getPostById);
// router.delete("/posts/:id", authenticateToken, PostController.deletePost);

// //Comments
// router.post(
//   "/posts/:postId/comments",
//   authenticateToken,
//   CommentController.createComment
// );
// router.delete(
//   "/comments/:id",
//   authenticateToken,
//   CommentController.deleteComment
// );

// //Like
// router.post("/posts/:postId/likes", authenticateToken, LikeController.likePost);

// router.delete(
//   "/posts/:postId/likes",
//   authenticateToken,
//   LikeController.unLikePost
// );

// //follow
// router.post(
//   "/users/:id/follow",
//   authenticateToken,
//   FollowController.FollowUser
// );
// router.delete(
//   "/users/:id/follow",
//   authenticateToken,
//   FollowController.UnfollowUser
// );

module.exports = router;
