import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

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

    return NextResponse.json({ images }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
