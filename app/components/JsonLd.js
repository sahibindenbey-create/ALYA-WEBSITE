// Sunucu bileşeni: JSON-LD (schema.org). '<' karakteri kaçışlanarak script enjeksiyonu engellenir.
export default function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
