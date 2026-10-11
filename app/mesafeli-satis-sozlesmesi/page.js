import LegalPage from '../legal/LegalPage';

export const metadata={
  title:'Mesafeli Satış Sözleşmesi | ALYA HOMES',
  description:'ALYA HOMES online mağazası mesafeli satış sözleşmesi: taraflar, ürün ve ödeme, teslimat, 14 günlük cayma hakkı, garanti ve uyuşmazlık çözümü.',
  alternates:{canonical:'/mesafeli-satis-sozlesmesi'},
};

export default function Page(){
  return <LegalPage type="distance"/>;
}
