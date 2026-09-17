"use client";
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole, AlertTriangle, Check } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from '../store';

const money = n => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

export default function Checkout() {
  const { cart, total, createOrder, ready, validateCart } = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customerType, setCustomerType] = useState("Bireysel");
  const [sameAddress, setSameAddress] = useState(true);

  if (!ready) return <main className="checkout-page"><div className="checkout-head"><small>ALYA HOMES</small><h1>Ödeme</h1></div><div className="checkout-empty"><h2>Sepetiniz yükleniyor…</h2></div></main>;

  const shipping = total >= 1000 ? 0 : 99;
  const finalTotal = total + shipping;
  const invalid = validateCart().some(i => !i.valid);

  if (!cart.length) return <main className="checkout-page"><div className="checkout-head"><small>ALYA HOMES</small><h1>Ödeme</h1></div><div className="checkout-empty"><h2>Ödeme için sepetinizde ürün olmalı.</h2><Link href="/collections/all" className="button dark">Ürünlere git <ArrowRight size={17} /></Link></div></main>;

  return <main className="checkout-page">
    <div className="checkout-head">
      <small>ALYA HOMES / SİPARİŞ</small>
      <h1>Siparişi tamamla</h1>
      <p>Bilgilerinizi girin, teslimat adresinizi seçin ve siparişinizi oluşturun.</p>
    </div>

    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={async e => {
        e.preventDefault();
        if (busy || invalid) return;
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        const billing = {
          title: f.get("billingTitle"), addressLine: f.get("billingAddress"), neighborhood: f.get("billingNeighborhood"),
          city: f.get("billingCity"), district: f.get("billingDistrict"), postalCode: f.get("billingPostalCode")
        };
        const shippingAddress = sameAddress ? { ...billing } : {
          title: f.get("shippingTitle"), recipientName: f.get("shippingRecipientName"), phone: f.get("shippingPhone"),
          addressLine: f.get("shippingAddress"), neighborhood: f.get("shippingNeighborhood"), city: f.get("shippingCity"),
          district: f.get("shippingDistrict"), postalCode: f.get("shippingPostalCode"), note: f.get("shippingNote")
        };
        const details = {
          customerType,
          name: customerType === "Bireysel" ? `${f.get("firstName")} ${f.get("lastName")}`.trim() : f.get("companyName"),
          firstName: f.get("firstName"), lastName: f.get("lastName"), companyName: f.get("companyName"),
          taxNumber: f.get("taxNumber"), taxOffice: f.get("taxOffice"), identityNumber: f.get("identityNumber"),
          email: f.get("email"), phone: f.get("phone"), billingAddress: billing, shippingAddress, sameAddress,
          payment: f.get("payment")
        };
        const order = await createOrder(details);
        if (order?.error) { setError(order.error); setBusy(false); return; }
        router.push(`/order-success?order=${encodeURIComponent(order.id)}`);
      }}>
        <div className="checkout-step">
          <span className="step-number">01</span>
          <div className="step-content">
            <div className="step-heading"><div><small>ADIM 1</small><h2>Müşteri bilgileri</h2></div><Check size={18} /></div>
            <div className="checkout-choice" role="radiogroup" aria-label="Müşteri tipi">
              <label className={customerType === "Bireysel" ? "active" : ""}><input type="radio" name="customerType" value="Bireysel" checked={customerType === "Bireysel"} onChange={() => setCustomerType("Bireysel")} /> Bireysel</label>
              <label className={customerType === "Kurumsal" ? "active" : ""}><input type="radio" name="customerType" value="Kurumsal" checked={customerType === "Kurumsal"} onChange={() => setCustomerType("Kurumsal")} /> Kurumsal</label>
            </div>
            {customerType === "Bireysel" ? <>
              <div className="two"><input name="firstName" required autoComplete="given-name" placeholder="Ad *" /><input name="lastName" required autoComplete="family-name" placeholder="Soyad *" /></div>
              <input name="identityNumber" placeholder="T.C. Kimlik No (opsiyonel)" inputMode="numeric" autoComplete="off" />
            </> : <>
              <input name="companyName" required placeholder="Firma unvanı *" />
              <div className="two"><input name="taxNumber" required placeholder="Vergi numarası *" inputMode="numeric" /><input name="taxOffice" required placeholder="Vergi dairesi *" /></div>
              <div className="two"><input name="firstName" placeholder="Yetkili adı" autoComplete="given-name" /><input name="lastName" placeholder="Yetkili soyadı" autoComplete="family-name" /></div>
            </>}
            <div className="two"><input name="email" required type="email" autoComplete="email" placeholder="E-posta *" /><input name="phone" required type="tel" autoComplete="tel" placeholder="Telefon *" /></div>
          </div>
        </div>

        <div className="checkout-step">
          <span className="step-number">02</span>
          <div className="step-content">
            <div className="step-heading"><div><small>ADIM 2</small><h2>Fatura adresi</h2></div><Check size={18} /></div>
            <input name="billingTitle" placeholder="Adres başlığı (Ev, Ofis vb.)" />
            <textarea name="billingAddress" required autoComplete="street-address" placeholder="Açık adres *" rows="3" />
            <div className="two"><input name="billingNeighborhood" required placeholder="Mahalle *" /><input name="billingDistrict" required placeholder="İlçe *" /></div>
            <div className="two"><input name="billingCity" required placeholder="İl *" /><input name="billingPostalCode" inputMode="numeric" placeholder="Posta kodu" /></div>
          </div>
        </div>

        <div className="checkout-step">
          <span className="step-number">03</span>
          <div className="step-content">
            <div className="step-heading"><div><small>ADIM 3</small><h2>Teslimat / sevk adresi</h2></div><Check size={18} /></div>
            <label className="checkout-check"><input type="checkbox" checked={sameAddress} onChange={e => setSameAddress(e.target.checked)} /> <span>Fatura adresim ile teslimat adresim aynı</span></label>
            {!sameAddress && <div className="shipping-fields">
              <input name="shippingTitle" required placeholder="Adres başlığı *" />
              <div className="two"><input name="shippingRecipientName" required placeholder="Teslim alacak kişi *" /><input name="shippingPhone" required type="tel" placeholder="Teslimat telefonu *" /></div>
              <textarea name="shippingAddress" required placeholder="Açık adres *" rows="3" />
              <div className="two"><input name="shippingNeighborhood" required placeholder="Mahalle *" /><input name="shippingDistrict" required placeholder="İlçe *" /></div>
              <div className="two"><input name="shippingCity" required placeholder="İl *" /><input name="shippingPostalCode" inputMode="numeric" placeholder="Posta kodu" /></div>
              <textarea name="shippingNote" placeholder="Teslimat notu (opsiyonel)" rows="2" />
            </div>}
          </div>
        </div>

        <div className="checkout-step">
          <span className="step-number">04</span>
          <div className="step-content">
            <div className="step-heading"><div><small>ADIM 4</small><h2>Ödeme yöntemi</h2></div><LockKeyhole size={18} /></div>
            <div className="payment-options">
              <label className="pay-option"><input type="radio" name="payment" value="Kart" defaultChecked /><span><b>Kredi / banka kartı</b><small>Ödeme sağlayıcısı entegrasyonu sonraki aşamada eklenecek.</small></span></label>
              <label className="pay-option"><input type="radio" name="payment" value="Havale/EFT" /><span><b>Havale / EFT</b><small>Sipariş oluşturulduktan sonra ödeme bilgileri gösterilir.</small></span></label>
            </div>
            <div className="secure"><LockKeyhole size={15} /> Bilgileriniz güvenli bağlantı üzerinden iletilir.</div>
          </div>
        </div>

        {invalid && <div className="checkout-error stock-error" role="alert"><AlertTriangle size={17} /> Sepetinizde stok miktarını aşan ürün var. <Link href="/cart">Sepete dönüp düzeltin.</Link></div>}
        {error && <div className="checkout-error" role="alert">{error}</div>}

        <button className="place-order" type="submit" disabled={busy || invalid}>
          {busy ? "Sipariş oluşturuluyor…" : invalid ? "Stok miktarını kontrol edin" : <>Siparişi oluştur <ArrowRight size={17} /></>}
        </button>
        <p className="checkout-demo-note">Bu sürümde ödeme ekranı demo olarak çalışır. Gerçek ödeme sağlayıcısı bağlantısı sonraki entegrasyonda yapılacaktır.</p>
      </form>

      <aside className="checkout-summary">
        <div className="summary-top"><div><small>SİPARİŞİNİZ</small><h2>Sipariş özeti</h2></div><span>{cart.reduce((sum, item) => sum + item.qty, 0)} ürün</span></div>
        <div className="summary-products">
          {cart.map(i => <div className="checkout-line" key={i.slug}><span>{i.name}<small>{i.qty} adet</small></span><strong>{money((Number(i.price) || 0) * i.qty)}</strong></div>)}
        </div>
        <div className="summary-costs">
          <div className="checkout-line"><span>Ara toplam</span><strong>{money(total)}</strong></div>
          <div className="checkout-line"><span>Kargo</span><strong>{shipping === 0 ? "Ücretsiz" : money(shipping)}</strong></div>
        </div>
        <div className="checkout-total"><span>Toplam</span><strong>{money(finalTotal)}</strong></div>
        <div className={`shipping-message ${shipping === 0 ? "free" : ""}`}>
          <span>{shipping === 0 ? "✓" : "Kargo ücreti"}</span>
          <p>{shipping === 0 ? "1.000 TL üzeri siparişinizde kargo ücretsiz." : `${money(1000 - total)} daha ekleyin, kargonuz ücretsiz olsun.`}</p>
        </div>
      </aside>
    </div>

    <Link href="/cart" className="back-link"><ArrowLeft size={15} /> Sepete dön</Link>
    <style jsx>{`
      .checkout-page{max-width:1280px;margin:0 auto;padding:48px 5% 110px;color:#171717}
      .checkout-head{border-bottom:1px solid #ddd;padding-bottom:34px;margin-bottom:36px}
      .checkout-head small{font-size:10px;letter-spacing:1.8px;font-weight:700;color:#777}
      .checkout-head h1{font-size:clamp(38px,5vw,58px);font-weight:500;letter-spacing:-2.4px;line-height:1.02;margin:13px 0 12px}
      .checkout-head p{margin:0;color:#777;font-size:13px;line-height:1.6;max-width:600px}
      .checkout-layout{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:70px;align-items:start}
      .checkout-form{min-width:0}
      .checkout-step{display:grid;grid-template-columns:44px minmax(0,1fr);gap:20px;padding:0 0 34px;margin-bottom:34px;border-bottom:1px solid #ddd}
      .step-number{font-size:11px;color:#888;padding-top:5px;letter-spacing:1px}
      .step-content{min-width:0}
      .step-heading{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:22px}
      .step-heading small{font-size:9px;letter-spacing:1.5px;color:#888;font-weight:700}
      .step-heading h2{font-size:22px;font-weight:500;letter-spacing:-.5px;margin:5px 0 0}
      .step-heading>svg{color:#aaa;margin-top:4px}
      .checkout-form input:not([type=radio]):not([type=checkbox]),.checkout-form textarea{width:100%;border:1px solid #d5d5d5;background:#fff;padding:14px 14px;font-size:13px;outline:none;border-radius:0;margin-bottom:10px;transition:border-color .15s,box-shadow .15s}
      .checkout-form input:not([type=radio]):not([type=checkbox]):focus,.checkout-form textarea:focus{border-color:#171717;box-shadow:0 0 0 2px rgba(245,138,31,.12)}
      .checkout-form textarea{resize:vertical;min-height:84px}
      .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .checkout-choice{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:17px}
      .checkout-choice label{border:1px solid #d5d5d5;padding:13px 14px;font-size:12px;display:flex;align-items:center;gap:9px;cursor:pointer}
      .checkout-choice label.active{border-color:#171717;box-shadow:inset 0 -2px 0 #f58a1f}
      .checkout-choice input{accent-color:#f58a1f}
      .checkout-check{display:flex;align-items:flex-start;gap:10px;padding:14px;background:#f7f6f3;font-size:12px;line-height:1.45;cursor:pointer;margin-bottom:10px}
      .checkout-check input{margin-top:1px;accent-color:#f58a1f}
      .shipping-fields{margin-top:10px}
      .payment-options{display:grid;gap:9px}
      .pay-option{display:flex;align-items:flex-start;gap:12px;border:1px solid #d5d5d5;padding:16px;cursor:pointer}
      .pay-option:has(input:checked){border-color:#171717;box-shadow:inset 0 -2px 0 #f58a1f}
      .pay-option input{margin-top:3px;accent-color:#f58a1f}
      .pay-option span{display:flex;flex-direction:column;gap:5px}
      .pay-option b{font-size:12px;font-weight:600}.pay-option small{font-size:10px;color:#777;line-height:1.45}
      .secure{display:flex;align-items:center;gap:8px;color:#777;font-size:10px;margin-top:14px}
      .checkout-error{display:flex;align-items:center;gap:8px;background:#fff1eb;border:1px solid #e9b9a5;padding:13px 14px;font-size:11px;margin:0 0 12px;line-height:1.45}
      .checkout-error a{text-decoration:underline;font-weight:600}
      .place-order{width:100%;min-height:54px;background:#f58a1f;color:#fff;display:flex;align-items:center;justify-content:center;gap:9px;padding:15px;font-size:12px;font-weight:700;cursor:pointer}
      .place-order:hover:not(:disabled){filter:brightness(.96)}.place-order:disabled{opacity:.45;cursor:not-allowed}
      .checkout-demo-note{font-size:10px;color:#888;line-height:1.55;text-align:center;margin:13px auto 0;max-width:560px}
      .checkout-summary{position:sticky;top:24px;background:#f5f3ef;padding:27px}
      .summary-top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #d9d6d0;padding-bottom:19px}
      .summary-top small{font-size:9px;letter-spacing:1.5px;color:#777;font-weight:700}.summary-top h2{font-size:21px;font-weight:500;margin:5px 0 0}.summary-top>span{font-size:10px;color:#777;padding-top:4px}
      .summary-products{max-height:330px;overflow:auto}.checkout-line{display:flex;justify-content:space-between;gap:15px;padding:15px 0;border-bottom:1px solid #ddd;font-size:11px}.checkout-line span{min-width:0}.checkout-line span small{display:block;color:#888;margin-top:4px;font-size:9px}.checkout-line strong{font-weight:500;white-space:nowrap}.summary-costs{border-bottom:1px solid #d9d6d0}.summary-costs .checkout-line{border:0;padding:10px 0}.checkout-total{display:flex;justify-content:space-between;align-items:baseline;padding:20px 0 17px}.checkout-total span{font-size:12px}.checkout-total strong{font-size:25px;font-weight:500}.shipping-message{display:flex;gap:10px;align-items:flex-start;background:#fff;padding:12px;font-size:10px}.shipping-message>span{font-weight:700;color:#f58a1f}.shipping-message p{margin:0;color:#666;line-height:1.5}.shipping-message.free>span{color:#2c7a55}
      .back-link{display:flex;align-items:center;gap:7px;font-size:11px;width:max-content;border-bottom:1px solid #171717;padding-bottom:4px;margin-top:35px}
      .checkout-empty{padding:90px 0;text-align:center}.checkout-empty h2{font-weight:500;margin-bottom:25px}.button.dark{display:inline-flex;align-items:center;gap:8px;background:#171717;color:#fff;padding:14px 18px;font-size:12px}
      @media(max-width:900px){.checkout-layout{grid-template-columns:1fr;gap:30px}.checkout-summary{position:static;order:-1}.summary-products{max-height:220px}}
      @media(max-width:600px){.checkout-page{padding:28px 18px 100px}.checkout-head{padding-bottom:25px;margin-bottom:27px}.checkout-head h1{font-size:39px;letter-spacing:-1.7px}.checkout-step{grid-template-columns:30px minmax(0,1fr);gap:12px;padding-bottom:27px;margin-bottom:27px}.step-heading h2{font-size:20px}.two{grid-template-columns:1fr;gap:0}.checkout-form input:not([type=radio]):not([type=checkbox]),.checkout-form textarea{font-size:16px;min-height:50px;padding:14px}.checkout-form textarea{min-height:92px}.checkout-choice label{min-height:50px}.checkout-check{padding:15px 12px}.pay-option{min-height:72px;padding:15px 12px}.place-order{min-height:58px;font-size:13px}.checkout-summary{padding:20px}.summary-top h2{font-size:19px}.checkout-total strong{font-size:23px}.checkout-demo-note{font-size:9px}.back-link{margin-top:27px}}
    `}</style>
  </main>;
}
