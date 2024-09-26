const fs = require('fs');
const path = require('path');
const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];

function generateImageUrls(directoryPath, baseUrl) {
    const imageUrls = {};

    function traverse(dir, relativeDir = '') {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                traverse(filePath, path.join(relativeDir, file));
            } else if (stat.isFile()) {
                const ext = path.extname(filePath).slice(1);
                if (validImageTypes.includes(ext)) {
                    const relativePath = path.join(relativeDir, file).replace(/\\/g, '/'); // for Windows compatibility
                    const url = `${baseUrl}/${relativePath}`;
                    if (!imageUrls[relativeDir]) {
                        imageUrls[relativeDir] = [];
                    }
                    imageUrls[relativeDir].push(url);
                }
            }
        });
    }

    traverse(directoryPath);
    return imageUrls;
}

const baseUrl = 'https://raw.githubusercontent.com/zekenaulty/sacred-geometry/refs/heads/main'; // Base URL for GitHub Pages
const directoryPath = process.cwd(); // Or specify your images directory
const imageUrls = generateImageUrls(directoryPath, baseUrl);

fs.writeFileSync(path.join(directoryPath, 'imageData.json'), JSON.stringify(imageUrls, null, 2));
