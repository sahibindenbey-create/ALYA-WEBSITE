import Link from 'next/link';
import { headers } from 'next/headers';
import { COMPANY } from '../company-info';
import { products } from '../products';
import { siteModeFromHost, originForMode, absoluteUrl, serializeJsonLd } from '../seo';
export async function generateMetadata() {
  return {
    title: 'Hakkımızda | ALYA HOMES',
    description: 'ALYA HOMES; katlanabilir kurutmalık ve ütü masası gibi işlevsel, dayanıklı ev yaşam ürünleri sunar. Şirket bilgileri ve iletişim.',
    alternates: { canonical: '/hakkimizda' },
  };
}
export default async function AboutPage() {
  const host = (await headers()).get('host') || '';
  const mode = siteModeFromHost(host); const origin = originForMode(mode);
  const dry = products.filter((p) => p.category === 'Kurutmalıklar').length;
  const iron = products.filter((p) => p.category === 'Ütü Masaları').length;
  const schema = { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Hakkımızda', url: absoluteUrl(origin, '/hakkimizda'), mainEntity: { '@type': 'Organization', '@id': absoluteUrl(origin, '/#organization'), name: 'ALYA HOMES', legalName: COMPANY.name, email: COMPANY.email, telephone: COMPANY.phone, address: COMPANY.address } };
  return (
    <main className="guide-page">
      <article>
        <header><small>ALYA HOMES</small><h1>Hakkımızda</h1><p>ALYA HOMES, günlük hayatı kolaylaştıran işlevsel, dayanıklı ve sade tasarımlı ev yaşam ürünleri sunar.</p></header>
        <div className="guide-body">
          <section><h2>Ne yapıyoruz?</h2><p>Ürün yelpazemiz iki kategoriden oluşur: katlanabilir kurutmalıklar ve ütü masaları. Şu an koleksiyonumuzda {dry} kurutmalık ve {iron} ütü masası modeli bulunur. Her ürün sayfasında model kodu, ölçüler, ağırlık ve malzeme bilgileri yayımlanır.</p></section>
          <section><h2>Ürünlerimizi nasıl seçmelisiniz?</h2><p>Doğru modeli seçmenize yardımcı olmak için <Link href="/rehberler">seçim ve bakım rehberlerimizi</Link> ve model karşılaştırma tablolarımızı hazırladık: <Link href="/rehberler/kurutmalik-modelleri-karsilastirma">kurutmalık karşılaştırması</Link> ve <Link href="/rehberler/utu-masasi-modelleri-karsilastirma">ütü masası karşılaştırması</Link>.</p></section>
          <section><h2>Şirket bilgileri</h2>
            <p><strong>Ticari unvan:</strong> {COMPANY.name}</p>
            <p><strong>Adres:</strong> {COMPANY.address}</p>
            <p><strong>Telefon:</strong> {COMPANY.phone}</p>
            <p><strong>E-posta:</strong> {COMPANY.email}</p>
            <p><strong>Vergi dairesi / no:</strong> {COMPANY.taxOffice} / {COMPANY.taxNumber} · <strong>MERSİS:</strong> {COMPANY.mersisNumber}</p>
          </section>
          <section><h2>Bize ulaşın</h2><p>Sipariş, ürün veya iade konularında <Link href="/iletisim">iletişim sayfamızdan</Link> bize yazabilir ya da <Link href="/yardim">yardım merkezine</Link> göz atabilirsiniz.</p></section>
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    </main>
  );
}
