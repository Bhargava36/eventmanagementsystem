// Patch html2canvas to safely handle modern CSS colors (oklab, oklch) without throwing
const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../node_modules/html2canvas/dist/html2canvas.esm.js'),
  path.join(__dirname, '../node_modules/html2canvas/dist/html2canvas.js'),
  path.join(__dirname, '../node_modules/html2canvas/dist/lib/css/types/color.js'),
  path.join(__dirname, '../node_modules/.vite/deps/html2canvas.js')
];

targetFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const isEsm = file.includes('esm.js') || file.endsWith('html2canvas.js');
    const safeReplacement = isEsm ? 'return COLORS.TRANSPARENT;' : 'return exports.COLORS.TRANSPARENT;';

    // Matches both standard and minified variants
    const regex = /throw new Error\(["']Attempting to parse an unsupported color function [^"']+["']\);?/g;

    if (regex.test(content)) {
      content = content.replace(regex, safeReplacement);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[patch-html2canvas] Patched: ${file}`);
    } else {
      console.log(`[patch-html2canvas] Already patched or clean: ${file}`);
    }
  }
});
