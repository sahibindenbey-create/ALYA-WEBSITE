'use client';
import { getInstallments } from '../installments';
const tl = (n) => `${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n))} TL`;

// Taksit seçenekleri: kart başına tablo (Taksit | Aylık tutar | Toplam tutar)
export default function InstallmentTable({ code }) {
  const groups = getInstallments(code);
  if (!groups) return null;
  return (
    <div className="installments">
      <div className="installments-grid">
        {groups.map((g) => (
          <table key={g.kart} className="installment-card">
            <caption>{g.kart}</caption>
            <thead><tr><th scope="col">Taksit</th><th scope="col">Aylık tutar</th><th scope="col">Toplam tutar</th></tr></thead>
            <tbody>
              {g.satirlar.map((r) => (
                <tr key={r.taksit}><td>{r.taksit === 1 ? 'Tek çekim' : `${r.taksit} taksit`}</td><td>{r.aylik == null ? '-' : tl(r.aylik)}</td><td>{r.toplam == null ? '-' : tl(r.toplam)}</td></tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <p className="installments-note">Taksit seçenekleri bilgilendirme amaçlıdır; geçerli taksit ve tutarlar ödeme adımında kartınıza göre gösterilir.</p>
    </div>
  );
}
