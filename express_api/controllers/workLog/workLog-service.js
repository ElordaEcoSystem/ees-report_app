const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("@napi-rs/canvas");

async function addWatermark(filePath, objectType,object,userName) {
  const logoPath = path.join(__dirname, "../../assets/logo.png");
  if (!fs.existsSync(logoPath)) {
    console.warn("Логотип не найден:", logoPath);
    return;
  }
  const stats = await fs.promises.stat(filePath);
  const createdAt = stats.birthtime;
  const formattedDate = createdAt.toLocaleDateString("ru-RU");
  const metadata = await sharp(filePath).metadata();
  const { width, height } = metadata;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");


  ctx.clearRect(0, 0, width, height);

  const base = Math.min(height, width);
  const fontSize = height > width ? base * 0.03 : base * 0.05;
  const normalFont = Math.floor(fontSize);
  const headerFont = Math.floor(fontSize * 1.5);

  const overlayHeight = normalFont * 6;
  const overlayY = height - overlayHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, overlayY, width, overlayHeight);

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const paddingX = Math.floor(normalFont * 2);
  let currentY = overlayY + normalFont;

  ctx.font = `${headerFont}px Arial`;
  ctx.fillText(`${objectType} ${object}`, paddingX, currentY);
  currentY += headerFont * 1.2;

  ctx.font = `${normalFont}px Arial`;
  ctx.fillText(userName, paddingX, currentY);
  currentY += normalFont * 1.2;

  ctx.fillText(formattedDate, paddingX, currentY);

  const textBuffer = canvas.toBuffer("image/png");

  const logoBuffer = await sharp(logoPath)
    .resize(Math.floor(width * 0.2))
    .toBuffer();

  const tempPath = filePath + "_wm.jpg";

  await sharp(filePath)
    .composite([
      { input: logoBuffer, gravity: "northeast", blend: "over" }, // лого внизу справа
      { input: textBuffer, top: 0, left: 0 }     // текст снизу по центру
    ])
    .toFile(tempPath);

  await fs.promises.rename(tempPath, filePath);
}

module.exports = {addWatermark};