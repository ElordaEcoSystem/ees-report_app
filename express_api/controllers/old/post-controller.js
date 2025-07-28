const { prisma } = require("../../prisma/prisma-client");

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          authorId,
          content,
        },
      });
      return res.json(post);
    } catch (error) {
      console.error("Create post error");
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllPosts: async (req, res) => {
    // res.send("getAllPosts");
    const userId = req.user.userId;

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const postsWithLikeInfo = posts.map((post) => {
        return {
          ...post,
          likeByUser: post.likes.some((like) => like.userId === userId),
        };
      });
      return res.json(postsWithLikeInfo);
    } catch (error) {
      console.error("Get all post error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    // const allPosts = prisma.post.
  },
  getPostById: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        },
      });

      if (!post) {
        return res.staus(400).json({ error: "Публикация не найдена" });
      }

      const postWithLikeInfo = {
        ...post,
        likeByUser: post.likes.some((like) => {
          like.userId === userId;
        }),
      };
      return res.send(postWithLikeInfo);
    } catch (error) {
      console.error("Get post by id error", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // res.send("getPostById");
  },

  deletePost: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      const post = await prisma.post.findUnique({
        where: { id: id },
        // include: { author: true },
      });
      if (!post) {
        return res.status(400).json({ error: "Такого поста нет" });
      }
      if (post.authorId !== userId) {
        return res.status(400).json({ error: "У тебя нет прав" });
      }

      const transaction = await prisma.$transaction([
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.post.deleteMany({ where: { id } }),
      ]);

      return res.json(transaction);
    } catch (error) {
      console.error("Delete post error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = PostController;
