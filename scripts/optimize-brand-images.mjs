import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Исходники бренд-макета лежат внутри репозитория (brand-source/), не во внешней папке —
// см. brand-source/README.md. Раньше скрипт указывал на D:/projects/3d_print/... вне проекта.
const SRC = path.resolve(__dirname, "../brand-source");
const OUT = path.resolve(__dirname, "../public/brand");

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
