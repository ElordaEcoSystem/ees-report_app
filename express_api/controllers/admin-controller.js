const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const VALID_ROLES = ["ADMIN", "MANAGER", "OBSERVER", "EXECUTOR"];

const USER_SELECT = {
  id: true, email: true, fullName: true, position: true, role: true, createdAt: true,
  departmentId: true,
  department: { select: { id: true, code: true, name: true } },
};

const AdminController = {
  getUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true, email: true, fullName: true, position: true, role: true, createdAt: true,
          departmentId: true,
          department: { select: { id: true, code: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      });
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateUserRole: async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Допустимые роли: ${VALID_ROLES.join(", ")}` });
    }

    // Нельзя снять роль ADMIN у себя
    if (id === req.user.userId && role !== "ADMIN") {
      return res.status(400).json({ error: "Нельзя изменить собственную роль" });
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: USER_SELECT,
      });
      res.json(user);
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    const { adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({ error: "Требуется пароль администратора" });
    }

    if (id === req.user.userId) {
      return res.status(400).json({ error: "Нельзя удалить собственный аккаунт" });
    }

    try {
      const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const passwordValid = await bcrypt.compare(adminPassword, admin.password);
      if (!passwordValid) {
        return res.status(403).json({ error: "Неверный пароль администратора" });
      }

      const userWorkLogs = await prisma.workLog.findMany({
        where: { authorId: id },
        select: { photoUrls: true, beforePhotoUrls: true },
      });
      for (const wl of userWorkLogs) {
        for (const url of [...(wl.photoUrls ?? []), ...(wl.beforePhotoUrls ?? [])]) {
          const filePath = path.join(__dirname, "../", url);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      await prisma.workLog.deleteMany({ where: { authorId: id } });
      await prisma.user.delete({ where: { id } });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { fullName, position, email, newPassword, departmentId } = req.body;

    if (!fullName && !position && !email && !newPassword && departmentId === undefined) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }

    try {
      const data = {};
      if (fullName) data.fullName = fullName;
      if (position !== undefined) data.position = position || null;
      if (departmentId !== undefined) data.departmentId = departmentId || null;
      if (email) {
        const exists = await prisma.user.findFirst({ where: { email, NOT: { id } } });
        if (exists) return res.status(400).json({ error: "Email уже занят" });
        data.email = email;
      }
      if (newPassword) {
        if (newPassword.length < 8) {
          return res.status(400).json({ error: "Пароль должен быть не менее 8 символов" });
        }
        data.password = await bcrypt.hash(newPassword, 10);
      }

      const user = await prisma.user.update({
        where: { id },
        data,
        select: USER_SELECT,
      });
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  createUser: async (req, res) => {
    const { email, password, fullName, position, role, departmentId } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, пароль и имя обязательны" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Пароль должен быть не менее 8 символов" });
    }
    const assignedRole = VALID_ROLES.includes(role) ? role : "EXECUTOR";

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Пользователь с таким email уже есть" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email, fullName, position: position || null,
          password: hashedPassword, role: assignedRole,
          departmentId: departmentId || null,
        },
        select: USER_SELECT,
      });
      res.json(user);
    } catch (error) {
      console.error("Admin create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = AdminController;
