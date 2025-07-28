const { prisma } = require("../../prisma/prisma-client");

const LikeController = {
  likePost: async (req, res) => {
    // return res.send("work");
    const userId = req.user.userId;
    const { postId } = req.params;

    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (!post) {
        return res.status(404).json("Пост не найден");
      }
      if (like) {
        return res.status(404).json("Лайк уже поставлен");
      }
      const createdLike = await prisma.like.create({
        data: { userId, postId },
      });

      res.json(createdLike);
    } catch (error) {
      console.error("Like post error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  unLikePost: async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    try {
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });
      if (!like) {
        return res.status(404).json("Лайка нету");
      }
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      return res.json({ message: "Post Unliked", likeData: { ...like } });
    } catch (error) {
      console.error("Unlike post error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = LikeController;
