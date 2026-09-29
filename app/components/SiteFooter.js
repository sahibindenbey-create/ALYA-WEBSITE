import Link from 'next/link';
import {ArrowRight, ShieldCheck, LockKeyhole, MapPin, Phone, Mail} from 'lucide-react';
import {COMPANY} from '../company-info';
import {isCatalogMode, SHOP_URL} from '../site-config';

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
 const visibleCustomerLinks=isCatalogMode?customerLinks.filter(([,href])=>!['/guvenli_alisveris','/kampanyalar'].includes(href)):customerLinks;
 const visibleLegalLinks=isCatalogMode?legalLinks.filter(([,href])=>href!=='/uyelik_sozlesmesi'):legalLinks;
 return <footer className="alya-footer">
  <div className="alya-footer-inner">
   <div className="alya-footer-brand">
    <Link href="/" className="footer-brand"><img src="/alya-homes-logo-footer.png" alt="ALYA HOMES"/></Link>
    <p>Ev yaşam ürünlerinde işlevsellik, dayanıklılık ve zamansız tasarım.</p>
    <div className="footer-company">
      <strong>{COMPANY.name}</strong>
      <span><MapPin size={13}/><b>Adres</b>{COMPANY.address}</span>
      <span><Phone size={13}/><b>Tel</b>{COMPANY.phone}</span>
      <span><Mail size={13}/><b>E-posta</b>{COMPANY.email}</span>
    </div>
    {isCatalogMode?<a href={SHOP_URL} className="footer-shop-link">Online mağazaya git <ArrowRight size={14}/></a>:<Link href="/collections/all" className="footer-shop-link">Ürünleri keşfet <ArrowRight size={14}/></Link>}
   </div>
   <div className="alya-footer-grid">
    <div><h4>{isCatalogMode?'Kurumsal':'Müşteri Hizmetleri'}</h4>{visibleCustomerLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
    <div><h4>Yasal Bilgiler</h4>{visibleLegalLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
    <div><h4>Bilgilendirme</h4>{communicationLinks.map(([t,h])=><Link key={h} href={h}>{t}</Link>)}</div>
   </div>
  </div>
  <div className="alya-footer-security">
   <div><ShieldCheck size={18}/><span><b>{isCatalogMode?'Güvenli bağlantı':'Güvenli alışveriş'}</b><small>SSL/TLS ile şifreli bağlantı</small></span></div>
   {isCatalogMode?<div><ArrowRight size={18}/><span><b>Online mağaza</b><small>Alışveriş için shop.alyahomes.com.tr</small></span></div>:<div><LockKeyhole size={18}/><span><b>Güvenli ödeme</b><small>Ödeme bilgileriniz güvenli kanallarda işlenir</small></span></div>}
   <div><span><b>Vergi Dairesi</b><small>{COMPANY.taxOffice} · VKN {COMPANY.taxNumber}</small></span></div>
   <div><span><b>MERSİS</b><small>{COMPANY.mersisNumber}</small></span></div>
  </div>
  <div className="alya-footer-bottom"><span>© {new Date().getFullYear()} {COMPANY.shortName}. Tüm hakları saklıdır.</span><span>{COMPANY.address}</span></div>
 </footer>;
}
