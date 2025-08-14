const { prisma } = require("../prisma/prisma-client");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const convert = require("heic-convert");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function convertHeicToJpeg(inputPath) {
  const inputBuffer = fs.readFileSync(inputPath);
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.8,
  });

  const jpegPath = inputPath.replace(/\.[^/.]+$/, ".jpg");
  fs.writeFileSync(jpegPath, outputBuffer);

  // удаляем оригинальный HEIC
  fs.unlinkSync(inputPath);

  return jpegPath;
}

async function optimizeImage(filePath) {
  const tempPath = filePath + "_temp.jpg";
  await sharp(filePath)
    .resize({ width: 1080, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(tempPath);

  await fs.promises.rename(tempPath, filePath);
}

const WorkLogController = {
  createWorkLog: async (req, res) => {
    const userId = req.user.userId;
    const { object, content } = req.body;

    if (!object || !content || !req.file) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      let filePath = path.join(uploadDir, req.file.filename);

      // Если файл .heic → конвертируем в jpg
      if (filePath.toLowerCase().endsWith(".heic")) {
        filePath = await convertHeicToJpeg(filePath);
      }

      // Сжимаем/изменяем размер
      await optimizeImage(filePath);

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
};

module.exports = WorkLogController;