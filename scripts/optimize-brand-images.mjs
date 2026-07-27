import sharp from "sharp";

const SRC = "D:/projects/3d_print/Marketplace_Disign_01_2025/OUT";
const OUT = "D:/II/Claude/Sitе_3D_print/public/brand";

// Логотип «ПЛАВИУМ» без фона (no_fon/nofon (3).png) на самом деле экспортирован на сплошном
// чёрном фоне, а не с реальной альфа-прозрачностью (PNG без alpha-канала). Вырезаем буквы
// по яркости: тёмный фон -> прозрачный, золотые буквы -> непрозрачные, с мягким переходом
// на антиалиased-краях. (nofon (1)/(2) сделаны на шахматном фоне прозрачности — из него
// буквы так же вырезать можно, но реальную мягкую тень на нём надёжно не восстановить,
// т.к. тень на шахматке — это тот же серый узор, просто темнее; поэтому тень рисуем сами.)
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

// Собирает буквы + мягкую тень под ними (по мотивам nofon (2).png — там на шахматном фоне
// хорошо видно, что у оригинального рендера есть тень вниз-вправо от букв) на общем
// прозрачном холсте с запасом по краям под растекание blur.
async function buildShadowedLogo(trimmedLogo) {
  const meta = await sharp(trimmedLogo).metadata();
  const blurSigma = Math.max(2, Math.round(meta.height * 0.03));
  const dx = Math.round(meta.height * 0.05);
  const dy = Math.round(meta.height * 0.11);
  const pad = blurSigma * 3 + Math.max(dx, dy) + 10;

  const canvasW = meta.width + pad * 2;
  const canvasH = meta.height + pad * 2;

  // чёрный силуэт букв (по альфе) с уменьшенной непрозрачностью — заготовка тени
  const alphaChannel = await sharp(trimmedLogo).ensureAlpha().extractChannel(3).raw().toBuffer();
  const shadowSilhouette = Buffer.alloc(meta.width * meta.height * 4);
  for (let i = 0, p = 0; i < alphaChannel.length; i++, p += 4) {
    shadowSilhouette[p + 3] = Math.round(alphaChannel[i] * 0.5);
  }
  const shadowSrc = sharp(shadowSilhouette, {
    raw: { width: meta.width, height: meta.height, channels: 4 },
  }).png();

  const shadowLayer = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await shadowSrc.toBuffer(), top: pad + dy, left: pad + dx }])
    .blur(blurSigma)
    .png()
    .toBuffer();

  const combined = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: shadowLayer, top: 0, left: 0 },
      { input: trimmedLogo, top: pad, left: pad },
    ])
    .png()
    .trim({ threshold: 10 })
    .toBuffer();

  return combined;
}

async function buildHeroBanner(shadowedLogo) {
  const meta = await sharp(shadowedLogo).metadata();

  // небольшой прозрачный отступ вокруг букв, чтобы не были "впритык" к краю баннера
  const padX = Math.round(meta.width * 0.05);
  const padY = Math.round(meta.height * 0.12);
  const paddedW = meta.width + padX * 2;
  const paddedH = meta.height + padY * 2;

  const paddedLogo = await sharp(shadowedLogo)
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
}

// OG-обложка 1200x630 — у баннера слишком вытянутое соотношение сторон (4:1), cover-кроп
// в формат OG (1.9:1) обрезал бы большую часть букв, поэтому собираем отдельный композит:
// логотип по центру над фоном, обрезанным ровно под 1200x630.
async function buildOgCover(shadowedLogo) {
  const meta = await sharp(shadowedLogo).metadata();
  const targetW = 1200;
  const targetH = 630;

  const logoW = Math.round(targetW * 0.82);
  const logoH = Math.round((logoW / meta.width) * meta.height);
  const resizedLogo = await sharp(shadowedLogo).resize({ width: logoW }).toBuffer();

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

const logo = await extractLogoAlpha();
const trimmed = await logo.png().trim({ threshold: 10 }).toBuffer();
const shadowedLogo = await buildShadowedLogo(trimmed);

await buildHeroBanner(shadowedLogo);
await buildOgCover(shadowedLogo);
await buildMisc();
console.log("done");
