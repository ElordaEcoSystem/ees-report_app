const sharp = require("sharp");
const convert = require("heic-convert");
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

async function convertHeicToJpeg(inputPath) {
  // Если файл .heic → конвертируем в jpg
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

  if (filePath.toLowerCase().endsWith(".heic")) {
    filePath = await convertHeicToJpeg(filePath);
  }
  
  const tempPath = filePath + "_temp.jpg";
  await sharp(filePath)
    .resize({ width: 1080, withoutEnlargement: true })
    .jpeg({ quality: 50, mozjpeg: true })
    .toFile(tempPath);
  await fs.promises.rename(tempPath, filePath);
  return filePath; // <-- вернули новый путь!
}

async function addWatermark(filePath, object,userName) {
  const logoPath = path.join(__dirname, "../../assets/logo.png"); // путь к логотипу
  // const fontPath = path.join(__dirname, "../../assets/fonts/ArialRegular.ttf"); // твой шрифт
  if (!fs.existsSync(logoPath)) {
    console.warn("Логотип не найден:", logoPath);
    return;
  }
  //   if (!fs.existsSync(fontPath)) {
  //   console.warn("Шрифт не найден:", fontPath);
  //   return;
  // }
  // Получаем размеры изображения, чтобы подогнать лого и текст
  const metadata = await sharp(filePath).metadata();
  const { width, height } = metadata;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");


  ctx.clearRect(0, 0, width, height);

  // базовый размер = минимальная сторона (чтобы и на вертикальных, и на горизонтальных выглядело норм)
  let base = Math.min(height,width);
  let fontSize = base * 0.02;
  if(height>width){
    fontSize = base * 0.03;
  }else{
    fontSize = base * 0.05;
  }
  const normalFont = Math.floor(fontSize); // 4% от base
  const headerFont = Math.floor(fontSize*1.5); // 7% от base

  // высота подложки ~ 15% от base
  const overlayHeight = normalFont*7;
  const overlayY = height - overlayHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // чёрная с прозрачностью
  ctx.fillRect(0, overlayY, width, overlayHeight);

    // шрифты


  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const paddingX = Math.floor(normalFont*2);
  let currentY = overlayY + normalFont;

  // Заголовок (больше)
  ctx.font = `${headerFont}px Arial`;
  ctx.fillText("Object", paddingX, currentY);

  currentY += headerFont*1.2 ;

  // Остальные строки
  ctx.font = `${normalFont}px Arial`;
  ctx.fillText("Name", paddingX, currentY);
  currentY += normalFont*1.2 ;

  ctx.fillText("Date", paddingX, currentY);

  const textBuffer = canvas.toBuffer("image/png");


  // Масштабируем лого под ширину картинки (~15% ширины)
  const logoBuffer = await sharp(logoPath)
    .resize(Math.floor(width * 0.2)) // 15% от ширины фото
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

module.exports = {optimizeImage,addWatermark};