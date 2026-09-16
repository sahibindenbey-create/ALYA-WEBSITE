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
      <div className="alya-product-image">
        {!failed && currentImage ? (
          <img src={currentImage} alt={`${product.name} - ALYA HOMES`} onError={() => setFailed(true)} />
        ) : (
          <div className="alya-image-fallback"><span>ALYA HOMES</span><small>{product.name}</small></div>
        )}
        <span className="alya-code-badge">{product.code}</span>
      </div>
      {visibleImages.length > 1 && (
        <div className="alya-gallery-thumbnails" aria-label="Ürün fotoğrafları">
          {visibleImages.map(image => (
            <button
              type="button"
              key={image}
              className={`alya-gallery-thumb${image === currentImage ? ' is-active' : ''}`}
              onClick={() => { setSelected(image); setFailed(false); }}
              aria-label={`${product.name} fotoğrafını görüntüle`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
