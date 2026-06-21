const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const srcPath = 'C:/Users/Sai kiran/.gemini/antigravity-ide/brain/a425b2a3-ff10-4c6c-b3ab-76581dea4b75/media__1782013021854.png';
const outPngPath = 'public/favicon.png';
const outIcoPath = 'public/favicon.ico';

async function generateFavicon() {
  try {
    // 1. Load the raw pixel data from the cropped circle bounding box (x: 11..25, y: 13..27)
    // Width and height are 15 pixels.
    const { data, info } = await sharp(srcPath)
      .extract({ left: 11, top: 13, width: 15, height: 15 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const center = (width - 1) / 2; // 7.0
    const maxRadius = 7.2;

    // Create a new buffer with transparent background
    const processedData = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Calculate distance from center of the circle
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxRadius) {
          // Outside the circle, make it completely transparent
          processedData[idx] = 0;
          processedData[idx + 1] = 0;
          processedData[idx + 2] = 0;
          processedData[idx + 3] = 0;
        } else {
          // Inside the circle, retain the pixel, but let's clean up dark backgrounds
          // The background in the original image is dark grey, around RGB [15,15,15] to [30,30,30]
          // If the pixel is dark grey, we can make it transparent to blend with the browser/page background
          const brightness = (r + g + b) / 3;
          if (brightness < 35 && distance > 5.0) {
            processedData[idx] = 0;
            processedData[idx + 1] = 0;
            processedData[idx + 2] = 0;
            processedData[idx + 3] = 0;
          } else {
            processedData[idx] = r;
            processedData[idx + 1] = g;
            processedData[idx + 2] = b;
            processedData[idx + 3] = a;
          }
        }
      }
    }

    // Create a high-quality 64x64 PNG favicon from the processed pixels
    await sharp(processedData, { raw: { width, height, channels: 4 } })
      .resize(64, 64, { kernel: 'lanczos3' })
      .png()
      .toFile(outPngPath);

    // Also write to favicon.ico (most browsers support standard PNG headers inside favicon.ico)
    await sharp(processedData, { raw: { width, height, channels: 4 } })
      .resize(32, 32, { kernel: 'lanczos3' })
      .png()
      .toFile(outIcoPath);

    console.log('Favicon successfully created at public/favicon.png and public/favicon.ico!');
  } catch (err) {
    console.error('Error generating favicon:', err);
  }
}

generateFavicon();
