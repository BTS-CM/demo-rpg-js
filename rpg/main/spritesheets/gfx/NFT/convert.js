const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const filesAndFolders = fs.readdirSync(__dirname);
const directories = filesAndFolders.filter((file) =>
  fs.statSync(path.join(__dirname, file)).isDirectory()
);

directories.forEach((directory) => {
  const files = fs.readdirSync(path.join(__dirname, directory));
  const imageFiles = files.filter(
    (file) => file.endsWith(".webp") && file.includes("_256x256")
  );

  imageFiles.forEach((file) => {
    const filePath = path.join(__dirname, directory, file);
    const fileName = path.parse(file).name.split("_")[0];

    sharp(filePath)
      .resize(256, 256)
      .toFile(path.join(__dirname, directory, `${fileName}_256x256.jpeg`));
  });
});
