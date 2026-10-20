import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const COVERS = { '1401': 'Fuji-Capture One 0334.webp' };

export async function GET(request) {
  const folder = new URL(request.url).searchParams.get('folder')?.replace(/[^0-9]/g, '');
  if (!folder || !/^\d{4}$/.test(folder)) {
    return NextResponse.json({ images: [] }, { status: 400 });
  }

  try {
    const directory = path.join(process.cwd(), 'public', 'products-real', folder);
    const files = await readdir(directory, { withFileTypes: true });
    const images = files
      .filter(file => file.isFile() && /\.(webp|png|jpe?g)$/i.test(file.name))
      .map(file => `/products-real/${folder}/${encodeURIComponent(file.name)}`)
      .sort((a, b) => a.localeCompare(b, 'tr'));

    const cover = COVERS[folder] && `/products-real/${folder}/${encodeURIComponent(COVERS[folder])}`;
    if (cover && images.includes(cover)) images.splice(0, images.length, cover, ...images.filter(i => i !== cover));

    return NextResponse.json({ images }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
