const fs = require('fs');
const sharp = require('sharp');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Clean dark background capsule -->
  <rect x="2" y="2" width="124" height="124" rx="32" fill="#0d0d0d" stroke="#f7931e" stroke-width="4"/>

  <!-- High-contrast terminal symbol '>' in orange -->
  <path d="M 34 34 L 74 64 L 34 94" fill="none" stroke="#f7931e" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Glowing/crisp cursor '_' in white -->
  <line x1="86" y1="92" x2="108" y2="92" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
</svg>`;

const outSvgPath = 'public/favicon.svg';
const outPngPath = 'public/favicon.png';
const outIcoPath = 'public/favicon.ico';

async function buildFavicons() {
  try {
    // 1. Write the SVG file
    fs.writeFileSync(outSvgPath, svgContent, 'utf8');
    console.log('SVG Favicon written to public/favicon.svg');

    // 2. Convert SVG to high-res PNG (64x64)
    await sharp(Buffer.from(svgContent))
      .resize(64, 64)
      .png()
      .toFile(outPngPath);
    console.log('PNG Favicon written to public/favicon.png');

    // 3. Convert SVG to ICO (32x32)
    await sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toFile(outIcoPath);
    console.log('ICO Favicon written to public/favicon.ico');

    console.log('All favicons successfully generated!');
  } catch (err) {
    console.error('Error generating favicons:', err);
  }
}

buildFavicons();
