import Link from 'next/link';
export const metadata = { title: 'Sayfa bulunamadı | ALYA HOMES', robots: { index: false, follow: true } };
export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Aradığınız sayfa bulunamadı</h1>
      <p style={{ marginBottom: 24 }}>Adres değişmiş ya da sayfa kaldırılmış olabilir. Ürünlerimize buradan ulaşabilirsiniz.</p>
      <p><Link href="/">Ana sayfa</Link> · <Link href="/collections/all">Tüm ürünler</Link> · <Link href="/iletisim">İletişim</Link></p>
    </main>
  );
}
