import LegalPage from '../legal/LegalPage';

export const metadata={
  title:'İade ve Değişim Politikası | ALYA HOMES',
  description:'ALYA HOMES online mağazası için 14 günlük iade, değişim, iade kargo ücreti ve geri ödeme koşulları.',
  alternates:{canonical:'/iade-politikasi'},
};

export default function Page(){
  return <LegalPage type="returns"/>;
}