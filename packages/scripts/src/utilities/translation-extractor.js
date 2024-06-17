const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../../../client/src'); // Adjust the path to your source directory
const stringsSet = new Set();

// Regex pattern to match translate("some_string")
const translateRegex = /translate\s*\(\s*["']([^"']+)["']\s*(?:,\s*\{[^}]*\}\s*)?\)/g;

function extractStringsFromFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let match;

  while ((match = translateRegex.exec(code)) !== null) {
    stringsSet.add(match[1]);
  }
}

function getFilesFromDir(dir, fileTypes) {
  const filesToReturn = [];
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (let i in files) {
      const curFile = path.join(currentPath, files[i]);
      if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) !== -1) {
        filesToReturn.push(curFile);
      } else if (fs.statSync(curFile).isDirectory()) {
        walkDir(curFile);
      }
    }
  }
  walkDir(dir);
  return filesToReturn;
}

const files = getFilesFromDir(directoryPath, ['.js', '.jsx', '.ts', '.tsx']);
files.forEach(extractStringsFromFile);

fs.writeFileSync(
  'output.php',
  '<?php\n\nreturn [\n' +
    Array.from(stringsSet)
      .map((str) => `  '${str}' => '${str}',`)
      .join('\n') +
    '\n];'
);
