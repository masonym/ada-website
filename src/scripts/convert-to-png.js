const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = './input';  // input folder with .webp images
const outputFolder = './output'; // output folder for .png images

// create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// read files in input folder
fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // filter out non-webp files
  const webpFiles = files.filter(file => path.extname(file).toLowerCase() === '.webp');

  webpFiles.forEach(file => {
    const inputPath = path.join(inputFolder, file);
    const outputPath = path.join(outputFolder, path.basename(file, '.webp') + '.png');

    // convert webp to png
    sharp(inputPath)
      .png()
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error('Error converting file:', file, err);
        } else {
          console.log(`Converted ${file} to ${outputPath}`);
        }
      });
  });
});
