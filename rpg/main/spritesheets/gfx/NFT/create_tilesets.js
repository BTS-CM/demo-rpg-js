const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const filesAndFolders = fs.readdirSync(__dirname);

const directories = filesAndFolders.filter((file) =>
  fs.statSync(path.join(__dirname, file)).isDirectory()
);

const newImageWidth = 512;

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
