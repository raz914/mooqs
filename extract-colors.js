const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function extractColor(imagePath) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    // Get pixel data from center of image
    const centerX = Math.floor(img.width / 2);
    const centerY = Math.floor(img.height / 2);
    const imageData = ctx.getImageData(centerX, centerY, 1, 1);
    const [r, g, b] = imageData.data;

    // Convert to hex
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    return hex;
}

async function extractAllColors() {
    const colorsDir = path.join(__dirname, 'colors');
    const files = fs.readdirSync(colorsDir)
        .filter(f => f.match(/^B\d{2}\.png$/))
        .sort();

    const colors = [];

    for (const file of files) {
        const filePath = path.join(colorsDir, file);
        const hex = await extractColor(filePath);
        const name = file.replace('.png', '');

        colors.push({
            name: name,
            hex: hex,
            image: `/colors/${file}`
        });

        console.log(`${name}: ${hex}`);
    }

    console.log('\n\nColors array for App.jsx:');
    console.log(JSON.stringify(colors, null, 2));
}

extractAllColors().catch(console.error);
