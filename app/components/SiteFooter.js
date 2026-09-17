import Link from 'next/link';
import {ArrowRight, ShieldCheck, LockKeyhole} from 'lucide-react';

const customerLinks=[
 ['Yardım Merkezi','/yardim'],['İletişim','/iletisim'],['Güvenli Alışveriş','/guvenli_alisveris'],['Kampanyalar','/kampanyalar']
];
const legalLinks=[
 ['KVKK / Kişisel Verilerin Korunması','/kisisel_verilerin_korunmasi'],['Çerez Politikası','/cerez_politikasi'],['Üyelik Sözleşmesi','/uyelik_sozlesmesi'],['Kullanım Koşulları','/kullanim_kosullari']
];
const communicationLinks=[
 ['İletişim Aydınlatma Metni','/iletisim_aydinlatma_metni'],['Ticari İletişim Bilgilendirme Metni','/ticari-iletisim-bilgilendirme-metni'],['Güvenlik Sertifikaları','/guvenlik-sertifikalari']
];
export default function SiteFooter(){
 return <footer className="alya-footer">
  <div className="alya-footer-inner">
   <div className="alya-footer-brand">
    <Link href="/" className="footer-brand"><img src="/alya-homes-logo.png" alt="ALYA HOMES"/></Link>
    <p>Ev yaşam ürünlerinde işlevsellik, dayanıklılık ve zamansız tasarım.</p>
    <Link href="/collections/all" className="footer-shop-link">Ürünleri keşfet <ArrowRight size={14}/></Link>
   </div>
   <div className="alya-footer-grid">
    <div><h4>Müşteri Hizmetleri</h4>{customerLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
    <div><h4>Yasal Bilgiler</h4>{legalLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
    <div><h4>Bilgilendirme</h4>{communicationLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
   </div>
  </div>
  <div className="alya-footer-security">
   <div><ShieldCheck size={18}/><span><b>Güvenli alışveriş</b><small>SSL/TLS ile şifreli bağlantı</small></span></div>
   <div><LockKeyhole size={18}/><span><b>Güvenli ödeme</b><small>Ödeme bilgileriniz güvenli kanallarda işlenir</small></span></div>
   <div><span><b>ALYA HOMES</b><small>Türkiye / TRY</small></span></div>
  </div>
  <div className="alya-footer-bottom"><span>© {new Date().getFullYear()} ALYA HOMES. Tüm hakları saklıdır.</span><span>Resmî şirket ve hukuki bilgiler, doğrulama tamamlandığında güncellenecektir.</span></div>
 </footer>;
}
