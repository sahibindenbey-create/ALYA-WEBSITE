'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ProductGallery({ product }) {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(product?.image || '');
  const [failed, setFailed] = useState(false);

  const folder = useMemo(() => product?.code?.match(/\d{4}$/)?.[0] || '', [product?.code]);

  useEffect(() => {
    let active = true;
    setImages([]);
    setSelected(product?.image || '');
    setFailed(false);

    if (!folder) return () => { active = false; };

    fetch(`/api/product-images?folder=${folder}`)
      .then(response => response.ok ? response.json() : { images: [] })
      .then(data => {
        if (!active) return;
        const discovered = Array.isArray(data.images) ? data.images : [];
        const allImages = discovered.length ? discovered : (product?.image ? [product.image] : []);
        setImages(allImages);
        setSelected(current => current || allImages[0] || '');
      })
      .catch(() => {
        if (active && product?.image) setImages([product.image]);
      });

    return () => { active = false; };
  }, [folder, product?.image]);

  const visibleImages = images.length ? images : (product?.image ? [product.image] : []);
  const currentImage = selected || visibleImages[0] || '';

  return (
    <div className="alya-gallery">
      <div className="alya-gallery-stage">
        {visibleImages.length > 1 && (
          <div className="alya-gallery-thumbnails" aria-label="Ürün fotoğrafları">
            {visibleImages.map((image, index) => (
              <button
                type="button"
                key={image}
                className={`alya-gallery-thumb${image === currentImage ? ' is-active' : ''}`}
                onClick={() => { setSelected(image); setFailed(false); }}
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
          <span className="alya-code-badge">{product.code}</span>
        </div>
      </div>

      <style jsx>{`
        .alya-gallery{width:100%;min-width:0}
        .alya-gallery-stage{display:grid;grid-template-columns:78px minmax(0,1fr);gap:14px;align-items:start}
        .alya-product-image{position:relative;background:#f2f0ec;aspect-ratio:1/1;display:grid;place-items:center;overflow:hidden;min-width:0}
        .alya-product-image img{width:100%;height:100%;object-fit:contain;display:block}
        .alya-code-badge{position:absolute;left:18px;top:18px;background:#fff;padding:8px 10px;font-size:9px;letter-spacing:1px;font-weight:700;z-index:2}
        .alya-image-fallback{display:grid;place-items:center;text-align:center;color:#777;padding:30px}
        .alya-image-fallback span{font-size:30px;font-weight:800;letter-spacing:-2px}
        .alya-image-fallback small{margin-top:8px;font-size:11px}
        .alya-gallery-thumbnails{display:flex;flex-direction:column;gap:9px;max-height:620px;overflow-y:auto;padding-right:2px}
        .alya-gallery-thumb{width:76px;height:76px;flex:none;border:1px solid #ddd;background:#f2f0ec;padding:0;overflow:hidden;cursor:pointer}
        .alya-gallery-thumb.is-active{border:2px solid #f58a1f}
        .alya-gallery-thumb img{width:100%;height:100%;object-fit:contain;display:block}
        @media(max-width:900px){.alya-gallery-stage{grid-template-columns:1fr;gap:10px}.alya-gallery-thumbnails{order:2;flex-direction:row;max-height:none;overflow-x:auto;overflow-y:hidden;padding-bottom:3px}.alya-gallery-thumb{width:70px;height:70px}.alya-product-image{aspect-ratio:1/1}}
      `}</style>
    </div>
  );
}
