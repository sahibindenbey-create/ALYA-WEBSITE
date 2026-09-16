'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ product }) {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const folder = useMemo(() => product?.code?.match(/\d{4}$/)?.[0] || '', [product?.code]);

  useEffect(() => {
    let active = true;
    setImages([]);
    setSelectedIndex(0);
    setFailed(false);

    if (!folder) return () => { active = false; };

    fetch(`/api/product-images?folder=${folder}`)
      .then(response => response.ok ? response.json() : { images: [] })
      .then(data => {
        if (!active) return;
        const discovered = Array.isArray(data.images) ? data.images : [];
        setImages(discovered.length ? discovered : (product?.image ? [product.image] : []));
      })
      .catch(() => {
        if (active && product?.image) setImages([product.image]);
      });

    return () => { active = false; };
  }, [folder, product?.image]);

  const visibleImages = images.length ? images : (product?.image ? [product.image] : []);
  const currentImage = visibleImages[selectedIndex] || visibleImages[0] || '';
  const hasMultiple = visibleImages.length > 1;

  const move = direction => {
    if (!hasMultiple) return;
    setFailed(false);
    setSelectedIndex(current => (current + direction + visibleImages.length) % visibleImages.length);
  };

  return (
    <div className="alya-gallery">
      <div className="alya-gallery-stage">
        {hasMultiple && (
          <div className="alya-gallery-thumbnails" aria-label="Ürün fotoğrafları">
            {visibleImages.map((image, index) => (
              <button
                type="button"
                key={image}
                className={`alya-gallery-thumb${index === selectedIndex ? ' is-active' : ''}`}
                onClick={() => { setSelectedIndex(index); setFailed(false); }}
                aria-label={`${product.name} fotoğrafı ${index + 1}`}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="alya-product-image">
          {!failed && currentImage ? (
            <img src={currentImage} alt={`${product.name} - ALYA HOMES`} onError={() => setFailed(true)} />
          ) : (
            <div className="alya-image-fallback"><span>ALYA HOMES</span><small>{product.name}</small></div>
          )}

          {hasMultiple && (
            <>
              <button type="button" className="alya-gallery-arrow alya-gallery-prev" onClick={() => move(-1)} aria-label="Önceki fotoğraf">
                <ChevronLeft size={22} strokeWidth={1.8} />
              </button>
              <button type="button" className="alya-gallery-arrow alya-gallery-next" onClick={() => move(1)} aria-label="Sonraki fotoğraf">
                <ChevronRight size={22} strokeWidth={1.8} />
              </button>
              <div className="alya-gallery-counter">{selectedIndex + 1} / {visibleImages.length}</div>
            </>
          )}

          <span className="alya-code-badge">{product.code}</span>
        </div>
      </div>

      <style jsx>{`
        .alya-gallery{width:100%;min-width:0}
        .alya-gallery-stage{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;align-items:start}
        .alya-product-image{position:relative;background:#f4f2ee;aspect-ratio:1/1;display:grid;place-items:center;overflow:hidden;min-width:0}
        .alya-product-image img{width:100%;height:100%;object-fit:contain;display:block;padding:18px;box-sizing:border-box}
        .alya-code-badge{position:absolute;left:18px;top:18px;background:#fff;padding:8px 10px;font-size:9px;letter-spacing:1px;font-weight:700;z-index:3}
        .alya-image-fallback{display:grid;place-items:center;text-align:center;color:#777;padding:30px}
        .alya-image-fallback span{font-size:30px;font-weight:800;letter-spacing:-2px}
        .alya-image-fallback small{margin-top:8px;font-size:11px}
        .alya-gallery-thumbnails{display:flex;flex-direction:column;gap:9px;max-height:620px;overflow-y:auto;padding-right:2px}
        .alya-gallery-thumb{width:74px;height:74px;flex:none;border:1px solid #ddd;background:#f4f2ee;padding:3px;overflow:hidden;cursor:pointer}
        .alya-gallery-thumb.is-active{border:2px solid #f58a1f;padding:2px}
        .alya-gallery-thumb img{width:100%;height:100%;object-fit:contain;display:block}
        .alya-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border:1px solid rgba(23,23,23,.16);background:rgba(255,255,255,.94);display:grid;place-items:center;z-index:3;cursor:pointer;transition:all .18s ease}
        .alya-gallery-arrow:hover{background:#171717;color:#fff;border-color:#171717}
        .alya-gallery-prev{left:14px}
        .alya-gallery-next{right:14px}
        .alya-gallery-counter{position:absolute;right:16px;bottom:16px;background:rgba(255,255,255,.92);padding:7px 9px;font-size:10px;letter-spacing:1px;z-index:3}
        @media(max-width:900px){
          .alya-gallery-stage{grid-template-columns:1fr;gap:10px}
          .alya-gallery-thumbnails{order:2;flex-direction:row;max-height:none;overflow-x:auto;overflow-y:hidden;padding-bottom:3px}
          .alya-gallery-thumb{width:68px;height:68px}
          .alya-product-image{aspect-ratio:1/1}
          .alya-gallery-arrow{width:38px;height:38px}
          .alya-gallery-prev{left:10px}
          .alya-gallery-next{right:10px}
        }
      `}</style>
    </div>
  );
}
