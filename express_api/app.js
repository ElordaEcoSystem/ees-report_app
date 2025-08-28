const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
const app = express();

const sharp = require("sharp")


// view engine setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.set("view engine", "jade");
//раздавать статические файлы из папки 'uploads'

app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use("/temp", express.static("temp"));
app.use("/api", require("./routes"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// Обработка ошибок в API
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Если запрос был к API, отдаём JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: err.message });
  }
  // Для обычных страниц можно рендерить HTML
  res.status(500).send('Internal Server Error');
});
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
async function compressImages() {
  const files = fs.readdirSync(UPLOADS_DIR);

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);

    // Проверяем, что это файл изображения
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

    const stats = fs.statSync(filePath);
    if (stats.size <= 2 * 1024 * 1024) continue; // меньше 2мб — пропускаем

    console.log(`Сжимаю: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Определяем длинную сторону
      let width = metadata.width;
      let height = metadata.height;

      if (!width || !height) continue;

      if (width > height) {
        // ширина длиннее → уменьшаем ширину до 800
        await image
          .rotate() // ← вот эта строчка фиксит авто-поворот  
          .resize({ width: 800 })
          .jpeg({ quality: 80 }) // можно ещё уменьшить качество
          .toFile(filePath + ".compressed.jpg");

      } else {
        // высота длиннее → уменьшаем высоту до 800
        await image
          .rotate() // ← вот эта строчка фиксит авто-поворот
          .resize({ height: 800 })
          .jpeg({ quality: 80 })
          .toFile(filePath + ".compressed.jpg");
      }

      // Перезаписываем оригинал
      fs.renameSync(filePath + ".compressed.jpg", filePath);
      console.log(`✅ Готово: ${file}`);
    } catch (err) {
      console.error(`Ошибка при обработке ${file}:`, err);
    }
  }
}

compressImages();

module.exports = app;
