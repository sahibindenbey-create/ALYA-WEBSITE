// TAKSİT TABLOSU VERİSİ (yalnızca shop.alyahomes.com ürün sayfasında gösterilir)
// Bir ürün için veri yoksa taksit bölümü hiç görünmez.
//
// Biçim: ürün modeli kodu -> kart grupları. Her grup bir banka/kart adı ve taksit satırları içerir.
//   taksit: taksit sayısı, aylik: aylık tutar (TL), toplam: toplam tutar (TL)
// Tüm kartlarda aynıysa tek bir grup ve "Tüm kartlar" adı kullanılabilir.
//
// Örnek (ÖRNEK, gerçek değildir):
//   AHDRY1401: [
//     { kart: 'Tüm kartlar', satirlar: [
//       { taksit: 2, aylik: 1500, toplam: 3000 },
//       { taksit: 3, aylik: 1000, toplam: 3000 },
//     ] },
//   ],
export const INSTALLMENTS = {
};

export function getInstallments(code) {
  const groups = INSTALLMENTS[String(code || '').toUpperCase()];
  return Array.isArray(groups) && groups.length ? groups : null;
}
