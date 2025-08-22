const { prisma } = require("../../prisma/prisma-client");
const fs = require("fs");
const path = require("path");
const {optimizeImage,addWatermark} = require("./workLog-service")

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const WorkLogController = {
  createWorkLog: async (req, res) => {
    const userId = req.user.userId;
    const userName = req.user.fullName;
    const { object, content } = req.body;

    if (!object || !content || !req.file) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      let filePath = path.join(uploadDir, req.file.filename);

      // Сжимаем/изменяем размер
      filePath = await optimizeImage(filePath);
      await addWatermark(filePath,object,userName)

      // Получаем новое имя файла (чтобы записать в БД)
      const fileName = path.basename(filePath);
      const photoUrl = `/uploads/${fileName}`;

      const workLog = await prisma.workLog.create({
        data: {
          object,
          content,
          photoUrl,
          authorId: userId,
        },
      });
      console.log("EXPRESS_WORKLOG_CREATE",workLog)

      res.json(workLog);
    } catch (error) {
      console.error("Create WorkLog error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllWorkLog: async (req, res) => {
    try {
      const allWorkLog = await prisma.workLog.findMany({
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(allWorkLog);
    } catch (error) {
      console.error("get all WorkLog error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  // getWorkLogImage: async (req,res) => {
  //   const filePath = path.join(__dirname, "..", "uploads", req.params.filename);

  // if (!fs.existsSync(filePath)) {
  //   return res.status(404).json({ error: "File not found" });
  // }

  // res.sendFile(filePath);
  // }
};

module.exports = WorkLogController;