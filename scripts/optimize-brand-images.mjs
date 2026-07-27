import sharp from "sharp";

const SRC = "D:/projects/3d_print/Marketplace_Disign_01_2025/OUT";
const OUT = "D:/II/Claude/Sitе_3D_print/public/brand";

await sharp(`${SRC}/crop.png`)
  .resize({ width: 1400 })
  .webp({ quality: 82 })
  .toFile(`${OUT}/hero-banner.webp`);

await sharp(`${SRC}/3200_2048.png`)
  .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
  .jpeg({ quality: 84 })
  .toFile(`${OUT}/../og-cover.jpg`);

await sharp(`${SRC}/Плавиум_кв.png`)
  .resize({ width: 800 })
  .webp({ quality: 82 })
  .toFile(`${OUT}/logo-square.webp`);

await sharp(`${SRC}/ComfyUI_00004_.png`)
  .resize({ width: 1600 })
  .webp({ quality: 78 })
  .toFile(`${OUT}/blueprint-bg.webp`);

console.log("done");
