const { prisma } = require("../../prisma/prisma-client");

const FollowController = {
  FollowUser: async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });

      const existingFollow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: { followerId: userId, followingId: id },
        },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Нет пользователя для подписки" });
      }

      if (existingFollow) {
        return res.status(409).json({ error: "Уже есть подписка" });
      }

      const follow = await prisma.follows.create({
        data: {
          followerId: userId,
          followingId: id,
        },
      });
      res.json(follow);
    } catch (error) {
      console.error("Follow user error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  UnfollowUser: async (req, res) => {
    const userId = req.user.userId;

    const { id } = req.params;

    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        return res.status(400).json({ error: "Нет такого пользователя" });
      }

      const existingFollow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: { followerId: userId, followingId: id },
        },
      });

      if (!existingFollow) {
        return res.status(409).json({ error: "Вы не подписаны" });
      }

      const unfollow = await prisma.follows.delete({
        where: {
          followerId_followingId: { followerId: userId, followingId: id },
        },
      });
      res.json(unfollow);
    } catch (error) {
      console.error("Unfollow user error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = FollowController;
