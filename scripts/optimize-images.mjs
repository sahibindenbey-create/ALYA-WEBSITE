import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = path.resolve('REAL_URUN_GORSELLERI');
const outputDir = path.resolve('public/products-real');
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

async function main() {
  try {
    await fs.access(inputDir);
  } catch {
    console.error(`Klasör bulunamadı: ${inputDir}`);
    console.error('Gerçek ürün fotoğraflarını bu klasöre koy ve komutu tekrar çalıştır.');
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });
  const files = await fs.readdir(inputDir, { withFileTypes: true });
  const images = files
    .filter((entry) => entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name);

  if (!images.length) {
    console.log('İşlenecek fotoğraf bulunamadı.');
    process.exit(0);
  }

  console.log(`${images.length} gerçek ürün fotoğrafı işleniyor...`);

  for (const file of images) {
    const input = path.join(inputDir, file);
    const outputName = `${path.parse(file).name}.webp`;
    const output = path.join(outputDir, outputName);

    await sharp(input)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 })
      .toFile(output);

    console.log(`✓ ${file} -> products-real/${outputName}`);
  }

  console.log('\nTamamlandı.');
  console.log('Orijinal fotoğraflara dokunulmadı.');
  console.log('Mevcut PDF katalog görselleri de henüz silinmedi.');
}

main().catch((error) => {
  console.error('\nGörsel işleme hatası:', error.message);
  process.exit(1);
});
