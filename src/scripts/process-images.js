// scripts/process-images.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const MEDIUM_SIZE = 1280; // Medium size width in pixels

async function processImages(inputDir, outputDir) {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get all images from input directory
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const { name } = path.parse(file);
      
      // Create medium WebP version
      const outputName = `${name}.webp`;
      const outputPath = path.join(outputDir, outputName);

      await sharp(inputPath)
        .resize(MEDIUM_SIZE, null, {
          withoutEnlargement: true, // Don't upscale smaller images
          fit: 'inside'
        })
        .webp({ 
          quality: 80,
          effort: 6 // Higher compression effort for better results
        })
        .toFile(outputPath);

      console.log(`Processed: ${file} -> ${outputName}`);
    }

    console.log('Image processing complete!');
  } catch (error) {
    console.error('Error processing images:', error);
    throw error; // Re-throw to see full error stack
  }
}

const inputDir = './public/events/2025DIF/photos';
const outputDir = './public/processed-photos/';

processImages(inputDir, outputDir);