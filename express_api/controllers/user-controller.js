const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
require("dotenv").config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserController = {
  register: async (req, res) => {
    const { email, password, fullName, position } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Некорректный формат email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Пароль должен быть не менее 8 символов" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь с таким email уже есть" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, fullName, position: position || null, password: hashedPassword },
      });

      return res.json(user);
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Некорректный формат email" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      const token = jwt.sign(
        { userId: user.id, fullName: user.fullName, role: user.role },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );

      res.json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          workLogs: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user by id error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          department: { select: { id: true, code: true, name: true } },
        },
      });
      if (!user) {
        return res.status(400).json({ error: "Не удалось найти пользователя" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getExecutors: async (req, res) => {
    try {
      const { role, userId } = req.user;

      let departmentId = null;
      if (role !== "ADMIN") {
        const requester = await prisma.user.findUnique({
          where: { id: userId },
          select: { departmentId: true },
        });
        departmentId = requester?.departmentId ?? null;
        if (!departmentId) {
          return res.json([]);
        }
      }

      const where = {
        role: "EXECUTOR",
        ...(departmentId ? { departmentId } : {}),
      };

      const users = await prisma.user.findMany({
        where,
        select: { id: true, fullName: true, position: true, departmentId: true },
        orderBy: { fullName: "asc" },
      });
      res.json(users);
    } catch (error) {
      console.error("Get executors error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = UserController;
