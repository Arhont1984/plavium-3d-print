import sharp from "sharp";

const SRC = "D:/projects/3d_print/Marketplace_Disign_01_2025/OUT";
const OUT = "D:/II/Claude/Sitе_3D_print/public/brand";

// Логотип «ПЛАВИУМ» без фона (no_fon/nofon (3).png) на самом деле экспортирован на сплошном
// чёрном фоне, а не с реальной альфа-прозрачностью (PNG без alpha-канала). Вырезаем буквы
// по яркости: тёмный фон -> прозрачный, золотые буквы -> непрозрачные, с мягким переходом
// на антиалиased-краях.
async function extractLogoAlpha() {
  const src = `${SRC}/no_fon/nofon (3).png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  const loLum = 35;
  const hiLum = 75;

  for (let i = 0, p = 0; i < data.length; i += channels, p += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let alpha = ((lum - loLum) / (hiLum - loLum)) * 255;
    alpha = Math.max(0, Math.min(255, alpha));
    rgba[p] = r;
    rgba[p + 1] = g;
    rgba[p + 2] = b;
    rgba[p + 3] = alpha;
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } });
}

async function buildHeroBanner() {
  const logo = await extractLogoAlpha();
  const trimmed = await logo.png().trim({ threshold: 10 }).toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();

  // небольшой прозрачный отступ вокруг букв, чтобы не были "впритык" к краю баннера
  const padX = Math.round(trimmedMeta.width * 0.06);
  const padY = Math.round(trimmedMeta.height * 0.18);
  const paddedW = trimmedMeta.width + padX * 2;
  const paddedH = trimmedMeta.height + padY * 2;

  const paddedLogo = await sharp(trimmed)
    .extend({ top: padY, bottom: padY, left: padX, right: padX, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // фон-чертёж без текста, обрезаем/растягиваем под пропорции логотипа
  const background = await sharp(`${SRC}/ComfyUI_00004_.png`)
    .resize({ width: paddedW, height: paddedH, fit: "cover", position: "attention" })
    .toBuffer();

  // sharp применяет composite() ПОСЛЕ resize() независимо от порядка вызовов в цепочке,
  // поэтому сначала материализуем композит в буфер в полном размере, а resize/экспорт
  // делаем уже из него отдельными свежими инстансами.
  const compositeBuffer = await sharp(background)
    .composite([{ input: paddedLogo, top: 0, left: 0 }])
    .png()
    .toBuffer();

  await sharp(compositeBuffer)
    .resize({ width: 1400 })
    .webp({ quality: 85 })
    .toFile(`${OUT}/hero-banner.webp`);

  console.log("hero banner done", paddedW, paddedH);
  return trimmed;
}

// OG-обложка 1200x630 — у баннера слишком вытянутое соотношение сторон (4:1), cover-кроп
// в формат OG (1.9:1) обрезал бы большую часть букв, поэтому собираем отдельный композит:
// логотип по центру над фоном, обрезанным ровно под 1200x630.
async function buildOgCover(trimmedLogo) {
  const trimmedMeta = await sharp(trimmedLogo).metadata();
  const targetW = 1200;
  const targetH = 630;

  const logoW = Math.round(targetW * 0.82);
  const logoH = Math.round((logoW / trimmedMeta.width) * trimmedMeta.height);
  const resizedLogo = await sharp(trimmedLogo).resize({ width: logoW }).toBuffer();

  const background = await sharp(`${SRC}/ComfyUI_00004_.png`)
    .resize({ width: targetW, height: targetH, fit: "cover", position: "attention" })
    .toBuffer();

  await sharp(background)
    .composite([{ input: resizedLogo, top: Math.round((targetH - logoH) / 2), left: Math.round((targetW - logoW) / 2) }])
    .jpeg({ quality: 85 })
    .toFile(`${OUT}/../og-cover.jpg`);

  console.log("og cover done", logoW, logoH);
}

async function buildMisc() {
  await sharp(`${SRC}/Плавиум_кв.png`)
    .resize({ width: 800 })
    .webp({ quality: 82 })
    .toFile(`${OUT}/logo-square.webp`);

  await sharp(`${SRC}/ComfyUI_00004_.png`)
    .resize({ width: 1600 })
    .webp({ quality: 78 })
    .toFile(`${OUT}/blueprint-bg.webp`);
}

const trimmedLogo = await buildHeroBanner();
await buildOgCover(trimmedLogo);
await buildMisc();
console.log("done");
