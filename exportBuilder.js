const fs = require('fs');
const path = require('path');

const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg']; // Add more if needed

// Sanitize variable names by replacing invalid characters with underscores and keeping track of used names
function sanitizeVariableName(name, usedNames) {
  let sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
  let counter = 1;
  while (usedNames.has(sanitizedName)) {
    sanitizedName = `${sanitizedName}_${counter++}`;
  }
  usedNames.add(sanitizedName);
  return sanitizedName;
}

// Function to create or update the index.js file in each subdirectory with images
function createIndexFiles(directoryPath) {
  const imageFiles = [];
  const usedNames = new Set(); // Set to track used variable names

  // Recursively traverse the directory and subdirectories
  function traverse(dir) {
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

    // Create the index.js file in the current subdirectory if there are images
    if (imageFiles.length > 0) {
      const indexJsContent = `
${imageFiles.map(filePath => {
        const sanitizedName = sanitizeVariableName(path.basename(filePath), usedNames);
        const relativePath = path.relative(directoryPath, filePath).replace('\\','/'); // Calculate relative path from the root directory
        return `import { ${sanitizedName} } from './${relativePath}';`;
      }).join('\n').replace('\\','/')}

export default [${imageFiles.map(filePath => {
        const sanitizedName = sanitizeVariableName(path.basename(filePath), usedNames);
        return sanitizedName;
      }).join(', ')}];
`;

      fs.writeFileSync(path.join(dir, 'index.js'), indexJsContent);
      imageFiles.length = 0; // Clear the array for the next subdirectory
      usedNames.clear(); // Clear used names for the next subdirectory
    }
  }

  traverse(directoryPath);
}

// Call the function
createIndexFiles(process.cwd());