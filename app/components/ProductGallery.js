'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import ProductVideo from './ProductVideo';

export default function ProductGallery({ product }) {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const folder = useMemo(() => product?.code?.match(/\d{4}$/)?.[0] || '', [product?.code]);

  useEffect(() => {
    let active = true;
    setImages([]);
    setSelectedIndex(0);
    setFailed(false);
    setLightbox(false);

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

  const selectImage = index => {
    setSelectedIndex(index);
    setFailed(false);
  };

  return (
    <div className="alya-gallery">
      <div className="alya-gallery-layout">
        {hasMultiple && (
          <aside className="alya-gallery-thumbnails" aria-label="Ürün fotoğrafları">
            {visibleImages.map((image, index) => (
              <button type="button" key={`${image}-${index}`} className={`alya-gallery-thumb${index === selectedIndex ? ' is-active' : ''}`} onClick={() => selectImage(index)} aria-label={`${product.name} fotoğrafı ${index + 1}`}>
                <img src={image} alt="" />
              </button>
            ))}
          </aside>
        )}

        <div className="alya-gallery-main">
          <button type="button" className="alya-gallery-expand" onClick={() => setLightbox(true)} aria-label="Fotoğrafı büyüt">
            <Maximize2 size={16} strokeWidth={1.6} />
          </button>
          <div className="alya-product-image">
            {!failed && currentImage ? <img src={currentImage} alt={`${product.name} - ALYA HOMES`} onError={() => setFailed(true)} /> : <div className="alya-image-fallback"><span>ALYA HOMES</span><small>{product.name}</small></div>}
            {hasMultiple && <>
              <button type="button" className="alya-gallery-arrow alya-gallery-prev" onClick={() => move(-1)} aria-label="Önceki fotoğraf"><ChevronLeft size={22} strokeWidth={1.5} /></button>
              <button type="button" className="alya-gallery-arrow alya-gallery-next" onClick={() => move(1)} aria-label="Sonraki fotoğraf"><ChevronRight size={22} strokeWidth={1.5} /></button>
              <div className="alya-gallery-counter">{String(selectedIndex + 1).padStart(2, '0')} / {String(visibleImages.length).padStart(2, '0')}</div>
            </>}
          </div>
          <div className="alya-gallery-caption"><span>{product.name}</span><span>{product.code}</span></div>
        </div>
      </div>

      {lightbox && currentImage && <div className="alya-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Büyük ürün fotoğrafı" onClick={() => setLightbox(false)}><button type="button" className="alya-lightbox-close" onClick={() => setLightbox(false)} aria-label="Kapat">×</button><img src={currentImage} alt={`${product.name} - büyük görünüm`} onClick={event => event.stopPropagation()} /></div>}

      <ProductVideo product={product} />

      <style jsx>{`
        .alya-gallery{width:100%;min-width:0}.alya-gallery-layout{display:grid;grid-template-columns:86px minmax(0,1fr);gap:18px;align-items:start}.alya-gallery-thumbnails{display:flex;flex-direction:column;gap:10px;max-height:720px;overflow-y:auto;padding:1px 2px 1px 0}.alya-gallery-thumb{width:84px;height:105px;flex:none;border:1px solid #e4e1dc;background:#f7f6f3;padding:0;overflow:hidden;cursor:pointer;transition:border-color .2s ease}.alya-gallery-thumb.is-active{border:1px solid #171717}.alya-gallery-thumb img{width:100%;height:100%;object-fit:contain;display:block;transition:transform .3s ease}.alya-gallery-thumb:hover img{transform:scale(1.04)}.alya-gallery-main{min-width:0}.alya-product-image{position:relative;background:#f7f6f3;width:100%;aspect-ratio:4/5;min-height:620px;display:grid;place-items:center;overflow:hidden}.alya-product-image img{width:100%;height:100%;object-fit:contain;object-position:center;padding:26px;box-sizing:border-box;display:block;transition:transform .35s ease}.alya-product-image:hover img{transform:scale(1.025)}.alya-gallery-expand{position:absolute;right:16px;top:16px;width:38px;height:38px;border:1px solid #dedbd5;background:rgba(255,255,255,.92);display:grid;place-items:center;z-index:3;cursor:pointer;color:#171717}.alya-gallery-expand:hover{background:#171717;color:#fff;border-color:#171717}.alya-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border:1px solid #dedbd5;background:rgba(255,255,255,.94);display:grid;place-items:center;z-index:3;cursor:pointer;color:#171717}.alya-gallery-arrow:hover{background:#171717;color:#fff;border-color:#171717}.alya-gallery-prev{left:14px}.alya-gallery-next{right:14px}.alya-gallery-counter{position:absolute;right:16px;bottom:16px;background:rgba(255,255,255,.94);padding:7px 10px;font-size:10px;letter-spacing:1px;color:#171717}.alya-gallery-caption{display:flex;justify-content:space-between;gap:16px;padding:11px 0 0;font-size:10px;letter-spacing:.2px;color:#777}.alya-gallery-caption span:last-child{color:#aaa}.alya-image-fallback{display:grid;place-items:center;text-align:center;color:#777;padding:30px}.alya-image-fallback span{font-size:30px;font-weight:800;letter-spacing:-2px}.alya-image-fallback small{margin-top:8px;font-size:11px}.alya-gallery-lightbox{position:fixed;inset:0;background:rgba(20,20,20,.9);display:grid;place-items:center;padding:5vw;z-index:1000;cursor:zoom-out}.alya-gallery-lightbox img{max-width:92vw;max-height:90vh;object-fit:contain;cursor:default}.alya-lightbox-close{position:absolute;right:24px;top:16px;border:0;background:transparent;color:#fff;font-size:38px;font-weight:200;cursor:pointer}@media(max-width:900px){.alya-gallery-layout{display:flex;flex-direction:column;gap:10px}.alya-gallery-main{width:100%;order:1}.alya-gallery-thumbnails{order:2;flex-direction:row;width:100%;max-height:none;overflow-x:auto;overflow-y:hidden;padding:0 0 4px}.alya-gallery-thumb{width:76px;height:92px}.alya-product-image{aspect-ratio:4/5;min-height:0}.alya-product-image img{padding:18px}.alya-gallery-arrow{width:36px;height:36px}.alya-gallery-prev{left:10px}.alya-gallery-next{right:10px}.alya-gallery-caption{font-size:9px}}
      `}</style>
    </div>
  );
}
