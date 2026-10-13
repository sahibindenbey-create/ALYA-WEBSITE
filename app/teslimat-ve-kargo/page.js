import LegalPage from '../legal/LegalPage';

export const metadata={
  title:'Teslimat ve Kargo Koşulları | ALYA HOMES',
  description:'ALYA HOMES siparişlerinin teslimat bölgesi, süresi, kargo ücreti, takip ve teslim alma koşulları.',
  alternates:{canonical:'/teslimat-ve-kargo'},
};

export default function Page(){
  return <LegalPage type="shipping"/>;
}
