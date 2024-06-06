const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Get all files and folders in the current directory
const filesAndFolders = fs.readdirSync(__dirname);

// Filter out the directories
const directories = filesAndFolders.filter(file => fs.statSync(path.join(__dirname, file)).isDirectory());

directories.forEach(directory => {
  // Get all files in the directory
  const files = fs.readdirSync(path.join(__dirname, directory));

  const imageFiles = files.filter(file => file.endsWith('.webp') && !file.includes('_256x256') && !file.includes('_32x32'));

  imageFiles.forEach(file => {
    const filePath = path.join(__dirname, directory, file);
    const fileName = path.parse(file).name;

    // Resize the image to 256x256 and save it with a new name
    sharp(filePath)
      .resize(256, 256)
      .toFile(path.join(__dirname, directory, `${fileName}_256x256.webp`));

    // Resize the image to 32x32 and save it with a new name
    sharp(filePath)
      .resize(32, 32)
      .toFile(path.join(__dirname, directory, `${fileName}_32x32.webp`));
  });
});