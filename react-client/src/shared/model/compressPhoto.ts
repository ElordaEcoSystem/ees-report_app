import Resizer from "react-image-file-resizer";
// import Heic from "heic-convert"; 

export const resizeImageFile = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1080,   // ширина (px)
      1080,   // высота (px)
      "JPEG", // формат
      70,    // качество
      0,     // поворот
      (uri) => {
        // Преобразуем base64 обратно в File
        if (typeof uri === "string") {
          const byteString = atob(uri.split(",")[1]);
          const mimeString = uri.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const resizedFile = new File([blob], file.name, { type: mimeString });
          resolve(resizedFile);
        }
      },
      "base64"
    );
  });
};


// async function convertHeicToJpeg(inputPath) {
//   // Если файл .heic → конвертируем в jpg
//   const inputBuffer = fs.readFileSync(inputPath);
//   const outputBuffer = await convert({
//     buffer: inputBuffer,
//     format: "JPEG",
//     quality: 0.8,
//   });
//   const jpegPath = inputPath.replace(/\.[^/.]+$/, ".jpg");
//   fs.writeFileSync(jpegPath, outputBuffer);
//   // удаляем оригинальный HEIC
//   fs.unlinkSync(inputPath);
//   return jpegPath;
// }