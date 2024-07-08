const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const filesAndFolders = fs.readdirSync(__dirname);

const directories = filesAndFolders.filter((file) =>
  fs.statSync(path.join(__dirname, file)).isDirectory()
);

const newImageWidth = 512;
let largeImageWidth = 9984;

directories.forEach(async (directory) => {
  const files = fs.readdirSync(path.join(__dirname, directory));
  const imageFiles = files.filter((file) => file.includes("_32x32"));

  // Sort the files by number
  imageFiles.sort((a, b) => {
    const numberA = parseInt(a.split("_")[0]);
    const numberB = parseInt(b.split("_")[0]);
    return numberA - numberB;
  });

  const numRows = Math.ceil(imageFiles.length / (newImageWidth / 32));
  let newImageHeight = numRows * 64;
  newImageHeight = Math.max(newImageHeight, 1);

  const images = await Promise.all(
    imageFiles.map((file) =>
      sharp(path.join(__dirname, directory, file))
        .extend({
          top: 16,
          bottom: 16,
          left: 0,
          right: 0,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer()
    )
  );

  sharp({
    create: {
      width: newImageWidth,
      height: newImageHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      images.map((image, i) => ({
        input: image,
        top: Math.floor(i / (newImageWidth / 32)) * 64,
        left: (i % (newImageWidth / 32)) * 32,
      }))
    )
    // Save the tileset in the respective folder
    .toFile(path.join(__dirname, directory, `${directory}.png`), (err, info) => {
      if (err) throw err;
      console.log(info);
    });
});

directories.forEach(async (directory) => {
  if (directory.includes("node_modules")) {
    return;
  }
  const files = fs.readdirSync(path.join(__dirname, directory));
  const imageFiles = files.filter((file) => file.endsWith(".webp") && file.includes("_256x256"));

  console.log({imageFiles, directory})

  // Sort the files by number
  imageFiles.sort((a, b) => {
    const numberA = parseInt(a.split("_")[0]);
    const numberB = parseInt(b.split("_")[0]);
    return numberA - numberB;
  });

  const numRows = (imageFiles.length * 256) < largeImageWidth
                    ? 1
                    : Math.ceil(imageFiles.length / (largeImageWidth / 256));
  let newImageHeight = numRows * 256;
  newImageHeight = Math.max(newImageHeight, 1);

  const images = await Promise.all(
    imageFiles.map((file) =>
      sharp(path.join(__dirname, directory, file)).toBuffer()
    )
  );

  const finalWidth = numRows === 1 ? imageFiles.length * 256 : largeImageWidth;
  console.log(`finalWidth: ${finalWidth}, newImageHeight: ${newImageHeight}, numRows: ${numRows}, imageFiles.length: ${imageFiles.length}`);
  sharp({
    create: {
      width: finalWidth,
      height: newImageHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      images.map((image, i) => ({
        input: image,
        top: Math.floor(i / (finalWidth / 256)) * 256,
        left: (i % (finalWidth / 256)) * 256,
      }))
    )
    .jpeg({ quality: 80 })
    .toFile(path.join(__dirname, directory, `${directory}_256.jpeg`), (err, info) => {
      if (err) throw err;
      console.log(info);
    });
});