const fs = require('fs');
const path = require('path');
const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];

function sanitizeVariableName(name) {
    let sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
    return '$' + sanitizedName;
}

function createIndexFiles(directoryPath) {
    function traverse(dir) {
        const imageFiles = [];
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                traverse(filePath);
            } else if (stat.isFile()) {
                const ext = path.extname(filePath).slice(1).toLowerCase();
                if (validImageTypes.includes(ext)) {
                    imageFiles.push(filePath);
                }
            }
        });

        if (imageFiles.length > 0) {
            const imports = imageFiles.map(filePath => {
                const sanitizedName = sanitizeVariableName(path.basename(filePath));
                const relativePath = path.relative(dir, filePath);
                return `import { ${sanitizedName} } from './${relativePath}';`;
            }).join('\n');
            const images = imageFiles.map(filePath => {
                const sanitizedName = sanitizeVariableName(path.basename(filePath));
                return sanitizedName;
            }).join(', ');
            const indexJsContent = `${imports}\r\nexport default [${images}];`;
            fs.writeFileSync(path.join(dir, 'index.js'), indexJsContent);
            imageFiles.length = 0;
        }
    }

    traverse(directoryPath);
}

// Call the function
createIndexFiles(process.cwd());