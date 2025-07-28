const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Путь к папке с фото
const uploadPath = path.join(__dirname, "../uploads");

// Создание папки, если её нет
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Настройка хранилища
const storage = multer.diskStorage({
  destination: uploadPath,
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
