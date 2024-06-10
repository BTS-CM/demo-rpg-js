Run the following commands:

`bun install`

To format origninal NFT media into 256x256 & 32x32 format

`bun run format_images.js`

To then generate tilesets from the 32x32 images:

`bun run create_tilesets.js`

Then before running rpg-js run the following commands:

`rm -rf node_modules/ bun.lockb`
