const sharp = require("sharp")
const fs = require("fs");


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
          .resize({ width: 1080 })
          .jpeg({ quality: 70 }) // можно ещё уменьшить качество
          .toFile(filePath + ".compressed.jpg");

      } else {
        // высота длиннее → уменьшаем высоту до 800
        await image
          .rotate() // ← вот эта строчка фиксит авто-поворот
          .resize({ height: 1080 })
          .jpeg({ quality: 70 })
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

module.exports = {compressImages}