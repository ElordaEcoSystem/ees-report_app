const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
const app = express();



// view engine setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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

module.exports = app;
