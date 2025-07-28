const { prisma } = require("../prisma/prisma-client");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const uploadDir = path.join(__dirname, "../uploads");
const assetsDir = path.join(__dirname, "../assets");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function moveFile(oldPath, newPath) {
  try {
    await fsp.rename(oldPath, newPath);
    console.log("Файл перемещён успешно");
  } catch (err) {
    console.error("Ошибка при перемещении файла:", err);
  }
}

async function formatDate(date) {
  const formattedDate = await date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
  });
  return formattedDate;
}

async function imageHandler({
  tempImagePath,
  imageName,
  targetWidth = 1080,
  object,
  userName,
  date,
}) {
  const image = await loadImage(tempImagePath);
  const logo = await loadImage(path.join(assetsDir, "/logo.png"));

  const aspectRatio = image.height / image.width;
  const targetHeight = Math.round(targetWidth * aspectRatio);

  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const bannerHeight = 200;
  const bannerHeightStart = targetHeight - bannerHeight;
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, bannerHeightStart, targetWidth, bannerHeight);
  ctx.font = " 40px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(`Объект: ${object}`, 30, bannerHeightStart + 60);
  ctx.fillText(`Исполнитель: ${userName}`, 30, bannerHeightStart + 110);
  ctx.fillText(`Дата: ${date}`, 30, bannerHeightStart + 160);

  const logoWidth = 200;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  ctx.drawImage(logo, 0, 0, logoWidth, logoHeight);

  // 5. Сохранить результат
  const newImagePath = path.join(uploadDir, imageName);
  await moveFile(tempImagePath, newImagePath);
  const out = fs.createWriteStream(newImagePath);
  const stream = canvas.createJPEGStream({ quality: 0.5 });
  stream.pipe(out);
  out.on("finish", () => console.log("✅ Готово: photo_final.jpg"));
}

// addLogoAndText().catch(console.error);

const WorkLogController = {
  // createWorkLog: async (req, res) => {
  //   const userId = req.user.userId;
  //   const { object, content } = req.body;

  //   if (!object || !content) {
  //     return res.status(400).json({ error: "Все поля обязательны" });
  //   }

  //   let photoUrl = null;
  //   if (req.file) {
  //     photoUrl = `/uploads/${req.file.filename}`; // Путь, по которому фронт может его получить
  //   } else {
  //     return res.status(400).json({ error: "Все поля обязательны" });
  //   }

  //   try {
  //     console.log("USER", req.user);

  //     const workLog = await prisma.workLog.create({
  //       data: {
  //         object,
  //         content,
  //         photoUrl,
  //         authorId: userId,
  //       },
  //     });
  //     res.json(workLog);
  //   } catch (error) {
  //     console.error("Create WorkLog error:", error); // <-- теперь ты увидишь реальную ошибку
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // },
  createWorkLog: async (req, res) => {
    const userId = req.user.userId;
    const userName = req.user.fullName;
    const { object, content } = req.body;

    if (!object || !content) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    await imageHandler({
      tempImagePath: req.file.path,
      imageName: req.file.filename,
      object,
      userName,
      date: await formatDate(new Date()),
    });

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`; // Путь, по которому фронт может его получить
    } else {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    // const tempPath = req.file.path;

    try {
      const workLog = await prisma.workLog.create({
        data: {
          object,
          content,
          photoUrl,
          authorId: userId,
        },
      });
      res.json(workLog);
    } catch (error) {
      console.error("Create WorkLog error:", error); // <-- теперь ты увидишь реальную ошибку
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
      console.error("get all WorkLog error:", error); // <-- теперь ты увидишь реальную ошибку
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  // deleteWorkLog: async (req, res) => {
  //   res.send("getAllWorkLog");
  // },
};
//  return res.status(400).json({ error: "Все поля обязательны" });

module.exports = WorkLogController;

// async function imageHandler({ object, content, userName, tempPath }) {
//   // const logoPath = path.join(__dirname, "assets/logo.png");

//   const imagePath = tempPath;

//   const image = await loadImage(imagePath);
//   // const logo = await loadImage(logoPath);

//   const canvas = createCanvas(image.width, image.height);
//   const ctx = canvas.getContext("2d");

//   // 1. Нарисовать исходное изображение
//   ctx.drawImage(image, 0, 0);

//   // 2. Добавить полупрозрачную плашку сверху
//   const bannerHeight = 100;
//   ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
//   ctx.fillRect(0, 0, image.width, bannerHeight);

//   // 3. Добавить текст на плашку
//   ctx.font = "bold 40px sans-serif";
//   ctx.fillStyle = "white";
//   ctx.fillText("Отчёт: Установка шкафа", 30, 30);

//   // 4. Добавить логотип в правый нижний угол
//   // const logoWidth = 100;
//   // const logoHeight = (logo.height / logo.width) * logoWidth;
//   // const logoX = image.width - logoWidth - 20;
//   // const logoY = image.height - logoHeight - 20;
//   // ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

//   // 5. Сохранить результат
//   const outPath = path.join(__dirname, "../temp/photo_final.jpg");
//   const out = fs.createWriteStream(outPath);
//   const stream = canvas.createJPEGStream({ quality: 0.95 });
//   stream.pipe(out);
//   out.on("finish", () => console.log("✅ Готово: photo_final.jpg"));
// }
