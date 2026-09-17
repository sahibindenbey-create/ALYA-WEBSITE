"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,CreditCard,RefreshCw,Save} from "lucide-react";

const paymentStatuses=["Bekliyor","Ödendi","Başarısız","İade Edildi"];
const money=n=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(Number(n)||0);

export default function AdminPayments(){
 const [orders,setOrders]=useState([]),[busy,setBusy]=useState({}),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const r=await fetch("/api/orders",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Siparişler alınamadı");setOrders(d.orders||[])}catch(e){setError(e?.message||"Siparişler alınamadı")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const changeStatus=async(order,paymentStatus)=>{const key=order.OrderNo||order.id;setBusy(x=>({...x,[key]:true}));try{const r=await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderNo:key,status:order.Status||order.status||"Sipariş alındı",paymentStatus})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Ödeme durumu güncellenemedi");setOrders(xs=>xs.map(x=>(x.OrderNo||x.id)===key?{...x,PaymentStatus:paymentStatus,paymentStatus}:x))}catch(e){alert(e?.message||"Ödeme durumu güncellenemedi")}finally{setBusy(x=>({...x,[key]:false}))}};
 return <main className="admin-page">
  <header><Link href="/admin" className="back-link"><ArrowLeft size={15}/> Yönetim paneline dön</Link><small>ALYA HOMES / ÖDEME YÖNETİMİ</small><div className="admin-sync"><i className="online"></i>Sunucu verisi</div><h1>Ödeme yönetimi</h1></header>
  <section className="admin-table">
   <div className="admin-table-head"><div><h2>Sipariş ödemeleri</h2><span>Ödeme durumunu değiştirdiğinizde müşteri hesabındaki sipariş bilgisi de güncellenir.</span></div><button className="admin-primary" onClick={load} disabled={loading}><RefreshCw size={15}/> Yenile</button></div>
   {error&&<p className="admin-empty">{error}</p>}
   {loading?<p className="admin-empty">Siparişler yükleniyor…</p>:!orders.length?<p className="admin-empty">Henüz sipariş bulunmuyor.</p>:orders.map(o=>{const key=o.OrderNo||o.id;const current=o.PaymentStatus||o.paymentStatus||"Bekliyor";return <article key={key}>
    <div><strong>{key}</strong><span>{o.Email||o.customer?.email||"—"} · {money(o.Total??o.total)}</span><small>Yöntem: {o.PaymentMethod||o.customer?.paymentMethod||o.customer?.payment||"—"} · Sağlayıcı: {o.PaymentProvider||"—"} · Referans: {o.PaymentReference||"—"}</small></div>
    <div className="order-admin-right"><select aria-label={`${key} ödeme durumu`} value={current} disabled={Boolean(busy[key])} onChange={e=>changeStatus(o,e.target.value)}>{paymentStatuses.map(s=><option key={s}>{s}</option>)}</select><strong>{o.Status||o.status||"—"}</strong>{busy[key]&&<Save size={15}/>}</div>
   </article>})}
  </section>
  <section className="admin-panel" style={{marginTop:16}}><div className="admin-table-head"><div><h2><CreditCard size={18}/> Ödeme akışı</h2><span>Admin tarafından yapılan değişiklikler SQL sipariş kaydına işlenir.</span></div></div><p style={{margin:0,lineHeight:1.7,color:"var(--muted,#6b6b6b)"}}>Bekliyor → Ödendi / Başarısız / İade Edildi durumları üzerinden ödeme yaşam döngüsü yönetilebilir. Sipariş detayındaki ödeme alanı ve müşteri hesabındaki sipariş listesi sunucudan güncel veriyi okur.</p></section>
 </main>;
}
