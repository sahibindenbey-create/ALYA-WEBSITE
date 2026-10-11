import LegalPage from '../legal/LegalPage';

export const metadata={
  title:'Ön Bilgilendirme Formu | ALYA HOMES',
  description:'Sipariş öncesi tüketiciye sunulan ön bilgilendirme: satıcı bilgileri, ürün nitelikleri, fiyat, teslimat, cayma hakkı ve başvuru yolları.',
  alternates:{canonical:'/on-bilgilendirme-formu'},
};

export default function Page(){
  return <LegalPage type="preinfo"/>;
}
