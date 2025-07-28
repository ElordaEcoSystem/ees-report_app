const { prisma } = require("../../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    if (!content || !postId) {
      return res.status(400).json({ error: "Неверные данные" });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(400).json("Данного поста нет");
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          postId,
          content,
          userId,
        },
      });
      return res.json(comment);
    } catch (error) {
      console.error("Create comment error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json("Коментарии не найден");
      }
      if (comment.userId !== userId) {
        return res.status(403).json("Нет доступа");
      }

      await prisma.comment.delete({ where: { id } });

      return res.json(comment);
    } catch (error) {
      console.error("Create delete error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = CommentController;
