const bcrypt = require("bcryptjs");
const jdenticon = require("jdenticon");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/prisma-client");
require("dotenv").config();

const UserController = {
  // register: (req, res) => {
  //   res.send("register");
  // },
  register: async (req, res) => {
    const { email, password, name } = req.body;
    // console.log(email, password, name);
    if (!email || !password || !name) {
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

      const png = jdenticon.toPng(`${name}_${Date.now()}`, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatarUrl: `/uploads/${avatarName}`,
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

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (error) {
      console.error("login error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // getUserById: async (req, res) => {
  //   res.send("getUserById");
  // },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    // console.log(id);
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { followers: true, following: true },
      });
      if (!user) {
        console.log("USER", user);
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
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBrith, bio, location } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    if (id !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "Почта уже используется" });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          bio: bio || undefined,
          location: location || undefined,
          dateOfBirth: dateOfBrith || undefined,
        },
      });
      res.json(user);
    } catch (error) {
      console.error("Update user Error", error);
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
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
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
