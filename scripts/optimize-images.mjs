import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = path.resolve('REAL_URUN_GORSELLERI');
const outputDir = path.resolve('public/products-real');
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

async function collectImages(dir, relativeDir = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      images.push(...await collectImages(fullPath, relativePath));
    } else if (
      entry.isFile() &&
      extensions.has(path.extname(entry.name).toLowerCase())
    ) {
      images.push({ fullPath, relativePath });
    }
  }

  return images;
}

async function main() {
  try {
    await fs.access(inputDir);
  } catch {
    console.error(`Klasör bulunamadı: ${inputDir}`);
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const images = await collectImages(inputDir);

  if (!images.length) {
    console.log('İşlenecek fotoğraf bulunamadı.');
    process.exit(0);
  }

  console.log(`${images.length} gerçek ürün fotoğrafı işleniyor...\n`);

  for (const image of images) {
    const parsed = path.parse(image.relativePath);
    const outputDirRelative = parsed.dir;
    const outputName = `${parsed.name}.webp`;
    const output = path.join(
      outputDir,
      outputDirRelative,
      outputName
    );

    await fs.mkdir(path.dirname(output), { recursive: true });

    await sharp(image.fullPath)
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 86,
        effort: 5
      })
      .toFile(output);

    console.log(
      `✓ ${image.relativePath} -> products-real/${path.join(
        outputDirRelative,
        outputName
      )}`
    );
  }

  console.log('\n================================');
  console.log('GERÇEK ÜRÜN GÖRSELLERİ HAZIR.');
  console.log(`Toplam: ${images.length}`);
  console.log('Orijinal fotoğraflara dokunulmadı.');
  console.log('================================');
}

main().catch((error) => {
  console.error('\nGörsel işleme hatası:', error.message);
  process.exit(1);
});
