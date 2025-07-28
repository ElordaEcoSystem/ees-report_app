const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Путь к папке с фото
const tempPath = path.join(__dirname, "../temp");

// Создание папки, если её нет
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

// Настройка хранилища
const storage = multer.diskStorage({
  destination: tempPath,
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const temp = multer({ storage });

module.exports = temp;
