const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const supportedExtensions = [".jpg", ".jpeg", ".png"];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const excludedDirs = [
  path.resolve(__dirname, "../../public/speakers/png"),
  path.resolve(__dirname, "../../public/events/2025NMCPC/photos/originals"),
  path.resolve(__dirname, "../../public/events/2026DTAPC/photos/originals"),
  path.resolve(__dirname, "../../public/events/2026NMCPC/photos/originals"),
  path.resolve(__dirname, "../../public/events/2026AFSFPC/photos/originals"),
];

function isExcluded(filePath) {
  const absPath = path.resolve(filePath);
  return excludedDirs.some((excludedDir) => absPath.startsWith(excludedDir));
}

async function convertToWebP(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.includes(ext)) return;

    const webpPath = filePath.replace(ext, ".webp");

    // Skip if WebP version already exists
    try {
      await fs.access(webpPath);
      console.log(`WebP already exists for ${filePath}, skipping...`);
      return;
    } catch (err) {
      // File doesn't exist, proceed with conversion
    }

    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);

    // Verify the WebP file was created successfully
    try {
      await fs.access(webpPath);
      // Delete the original file
      await delay(200);
      await fs.rm(filePath);
      console.log(`Converted ${filePath} to WebP and deleted original file`);
    } catch (err) {
      console.error(`Error verifying WebP file ${webpPath}:`, err);
    }
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error);
  }
}

async function processDirectory(directory) {
  try {
    if (isExcluded(directory)) {
      console.log(`Skipping excluded directory: ${directory}`);
      return;
    }
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else {
        await convertToWebP(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Start the conversion process
const imagesDir = path.join(__dirname, "../../public/");
processDirectory(imagesDir)
  .then(() => console.log("Conversion process completed"))
  .catch((error) => console.error("Error:", error));
