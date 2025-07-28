const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
require("dotenv").config();

const UserController = {
  register: async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Пользователь с таким email уже есть" });
      }
      // return res.send("OK");
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          fullName,
          password: hashedPassword,
        },
      });

      return res.json(user);
    } catch (error) {
      console.error("Error in register", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email: email } });

      if (!user) {
        return res.status(400).json({ error: "Неверный логин и пароль" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Неверный логин и пароль" });
      }

      const token = jwt.sign(
        { userId: user.id, fullName: user.fullName },
        process.env.SECRET_KEY
      );

      res.json({ token });
    } catch (error) {
      console.error("login error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          groups: true,
          workLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!user) {
        // console.log("USER", user);
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const isFollowing = await prisma.follows.findFirst({
        where: { AND: [{ followerId: userId }, { followingId: id }] },
      });
      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Get current error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          groups: true,
          workLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!user) {
        return res.status(400).json({ error: "Не удалось найти пользователя" });
      }
      res.json(user);
    } catch (error) {
      console.log("Get Current Error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = UserController;
