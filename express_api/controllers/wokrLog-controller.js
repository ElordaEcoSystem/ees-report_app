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
    .jpeg({ quality: 50, mozjpeg: true })
    .toFile(tempPath);
  await fs.promises.rename(tempPath, filePath);
}

async function addWatermark(filePath, object,userName) {
  const logoPath = path.join(__dirname, "../assets/logo.png"); // путь к логотипу
  const fontPath = path.join(__dirname, "../assets/fonts/ArialRegular.ttf"); // твой шрифт
  if (!fs.existsSync(logoPath)) {
    console.warn("Логотип не найден:", logoPath);
    return;
  }
    if (!fs.existsSync(fontPath)) {
    console.warn("Шрифт не найден:", fontPath);
    return;
  }

  const fontData = fs.readFileSync(fontPath).toString("base64");

  // Получаем размеры изображения, чтобы подогнать лого и текст
  const metadata = await sharp(filePath).metadata();
  const imgWidth = metadata.width || 1080;

  // Масштабируем лого под ширину картинки (~15% ширины)
  const logoBuffer = await sharp(logoPath)
    .resize(Math.floor(imgWidth * 0.2)) // 15% от ширины фото
    .toBuffer();

  // Генерируем картинку с текстом
  const dateTime = new Date().toLocaleString("ru-RU", {
    timeZone: "Asia/Almaty",
  });

  const svgText = `
    <svg width="${imgWidth}" height="120" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'CustomFont';
          src: url('data:font/ttf;base64,${fontData}') format('truetype');
        }
        .line1 { fill: white; font-size: 26px; font-weight: bold; font-family: 'CustomFont'; }
        .line2 { fill: white; font-size: 21px; font-family: 'CustomFont'; }
      </style>
      <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.6"/>
      <text x="20" y="35%" text-anchor="start" class="line1">${object}</text>
      <text x="20" y="60%" text-anchor="start" class="line2">${userName}</text>
      <text x="20" y="80%" text-anchor="start" class="line2">${dateTime}</text>
    </svg>
  `;

  const textBuffer = Buffer.from(svgText);

  const tempPath = filePath + "_wm.jpg";

  await sharp(filePath)
    .composite([
      { input: logoBuffer, gravity: "northeast", blend: "over" }, // лого внизу справа
      { input: textBuffer, gravity: "southeast", blend: "over" },     // текст снизу по центру
    ])
    .toFile(tempPath);

  await fs.promises.rename(tempPath, filePath);
}


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

      // Если файл .heic → конвертируем в jpg
      if (filePath.toLowerCase().endsWith(".heic")) {
        filePath = await convertHeicToJpeg(filePath);
      }

      // Сжимаем/изменяем размер
      await optimizeImage(filePath);
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