// Temiz (ASCII, tireli) adresler: Google URL yapısı yönergesi boşluk, alt çizgi ve gereksiz kodlanmış karakterlerden kaçınmayı önerir.
export const COLLECTION_SLUGS = { 'kurutmalıklar': 'kurutmaliklar', 'ütü masaları': 'utu-masalari' };
export const COLLECTION_ALIASES = { kurutmaliklar: 'kurutmalıklar', 'utu-masalari': 'ütü masaları' };
// Kategori adından (ör. "Ütü Masaları") temiz koleksiyon adresi üretir
export const collectionHref = (category) => {
  const key = String(category || '').toLocaleLowerCase('tr-TR');
  return key === 'all' ? '/collections/all' : `/collections/${COLLECTION_SLUGS[key] || encodeURIComponent(key)}`;
};
// Adresteki slug'ı iç anahtara çevirir (yeni temiz slug -> eski anahtar)
export const collectionKey = (slug) => {
  const s = decodeURIComponent(slug || 'all').toLocaleLowerCase('tr-TR');
  return COLLECTION_ALIASES[s] || s;
};
// Eski adres -> yeni adres (308). Alt çizgili sayfalar tireli adreslere taşındı.
export const LEGACY_REDIRECTS = {
  '/collections/kurutmalıklar': '/collections/kurutmaliklar',
  '/collections/ütü masaları': '/collections/utu-masalari',
  '/guvenli_alisveris': '/guvenli-alisveris',
  '/kisisel_verilerin_korunmasi': '/kisisel-verilerin-korunmasi',
  '/kullanim_kosullari': '/kullanim-kosullari',
  '/cerez_politikasi': '/cerez-politikasi',
  '/uyelik_sozlesmesi': '/uyelik-sozlesmesi',
  '/iletisim_aydinlatma_metni': '/iletisim-aydinlatma-metni',
};
