export default function manifest() {
  return {
    name: "ALYA HOMES",
    short_name: "ALYA HOMES",
    description:
      "İşlevsel, dayanıklı ve yer kazandıran ev yaşam ürünleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f28a22",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}