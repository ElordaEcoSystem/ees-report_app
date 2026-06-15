const express = require("express");
const router = express.Router();
const { UserController, WorkLogController, DepartmentController } = require("../controllers");
const AdminController = require("../controllers/admin-controller");
const authenticateToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const uploads = require("../middleware/multer");

// Auth
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.currentUser);
router.get("/user/:id", authenticateToken, UserController.getUserById);
router.get("/executors", authenticateToken, UserController.getExecutors);

// WorkLogs — просмотр для всех авторизованных, создание только ADMIN, EXECUTOR и MANAGER
router.post(
  "/worklogs",
  authenticateToken,
  checkRole("ADMIN", "EXECUTOR", "MANAGER"),
  uploads.fields([{ name: "photos", maxCount: 10 }, { name: "beforePhotos", maxCount: 10 }]),
  WorkLogController.createWorkLog
);
router.get("/worklogs", authenticateToken, WorkLogController.getAllWorkLog);
router.delete("/worklogs/:id", authenticateToken, checkRole("ADMIN"), WorkLogController.deleteWorkLog);

// Departments — для всех авторизованных
router.get("/departments", authenticateToken, DepartmentController.getDepartments);

// Admin — только для ADMIN
router.get("/admin/users", authenticateToken, checkRole("ADMIN"), AdminController.getUsers);
router.post("/admin/users", authenticateToken, checkRole("ADMIN"), AdminController.createUser);
router.patch("/admin/users/:id", authenticateToken, checkRole("ADMIN"), AdminController.updateUser);
router.patch("/admin/users/:id/role", authenticateToken, checkRole("ADMIN"), AdminController.updateUserRole);
router.delete("/admin/users/:id", authenticateToken, checkRole("ADMIN"), AdminController.deleteUser);

module.exports = router;
