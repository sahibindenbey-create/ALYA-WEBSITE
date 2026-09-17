'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import ProductVideo from './ProductVideo';

export default function ProductGallery({ product }) {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [imageOrientation, setImageOrientation] = useState('unknown');
  const touchStart = useRef(null);
  const folder = useMemo(() => product?.code?.match(/\d{4}$/)?.[0] || '', [product?.code]);

  useEffect(() => {
    let active = true;
    setImages([]); setSelectedIndex(0); setFailed(false); setLightbox(false); setImageOrientation('unknown');
    if (!folder) return () => { active = false; };
    fetch(`/api/product-images?folder=${folder}`)
      .then(response => response.ok ? response.json() : { images: [] })
      .then(data => { if (!active) return; const discovered = Array.isArray(data.images) ? data.images : []; setImages(discovered.length ? discovered : (product?.image ? [product.image] : [])); })
      .catch(() => { if (active && product?.image) setImages([product.image]); });
    return () => { active = false; };
  }, [folder, product?.image]);

  const visibleImages = images.length ? images : (product?.image ? [product.image] : []);
  const currentImage = visibleImages[selectedIndex] || visibleImages[0] || '';
  const hasMultiple = visibleImages.length > 1;
  const move = direction => { if (!hasMultiple) return; setFailed(false); setImageOrientation('unknown'); setSelectedIndex(current => (current + direction + visibleImages.length) % visibleImages.length); };
  const selectImage = index => { setSelectedIndex(index); setFailed(false); setImageOrientation('unknown'); };
  const openLightbox = () => { if (currentImage) setLightbox(true); };
  const handleTouchStart = event => { if (!hasMultiple) return; const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; };
  const handleTouchEnd = event => { if (!hasMultiple || !touchStart.current) return; const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.current.x; const dy = touch.clientY - touchStart.current.y; touchStart.current = null; if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy) * 1.15) return; move(dx < 0 ? 1 : -1); };

  useEffect(() => {
    const onKey = event => { if (!lightbox) return; if (event.key === 'Escape') setLightbox(false); if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, images.length]);
  useEffect(() => { if (!lightbox) return undefined; const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previousOverflow; }; }, [lightbox]);

  return (
    <div className="alya-gallery">
      <div className="alya-gallery-layout">
        {hasMultiple && <aside className="alya-gallery-thumbnails" aria-label="Ürün fotoğrafları">{visibleImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={`alya-gallery-thumb${index === selectedIndex ? ' is-active' : ''}`} onClick={() => selectImage(index)} aria-label={`${product.name} fotoğrafı ${index + 1}`}><img src={image} alt="" loading="lazy" /></button>)}</aside>}
        <div className="alya-gallery-main">
          <button type="button" className="alya-gallery-expand" onClick={openLightbox} aria-label="Fotoğrafı tam ekran büyüt"><Maximize2 size={16} strokeWidth={1.6} /></button>
          <div className={`alya-product-image is-${imageOrientation}`} onClick={openLightbox} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); } }} aria-label="Fotoğrafı tam ekran aç">
            {!failed && currentImage ? <img src={currentImage} alt={`${product.name} - ALYA HOMES`} onLoad={event => { const { naturalWidth, naturalHeight } = event.currentTarget; setImageOrientation(naturalWidth >= naturalHeight ? 'landscape' : 'portrait'); }} onError={() => setFailed(true)} /> : <div className="alya-image-fallback"><span>ALYA HOMES</span><small>{product.name}</small></div>}
            {hasMultiple && <><button type="button" className="alya-gallery-arrow alya-gallery-prev" onClick={event => { event.stopPropagation(); move(-1); }} aria-label="Önceki fotoğraf"><ChevronLeft size={22} strokeWidth={1.5} /></button><button type="button" className="alya-gallery-arrow alya-gallery-next" onClick={event => { event.stopPropagation(); move(1); }} aria-label="Sonraki fotoğraf"><ChevronRight size={22} strokeWidth={1.5} /></button><div className="alya-gallery-counter" aria-live="polite">{selectedIndex + 1} / {visibleImages.length}</div></>}
          </div>
          <div className="alya-gallery-caption"><span>{product.name}</span><span>{product.code}</span></div>
        </div>
      </div>
      {lightbox && currentImage && <div className="alya-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Büyük ürün fotoğrafı" onClick={() => setLightbox(false)}><button type="button" className="alya-lightbox-close" onClick={event => { event.stopPropagation(); setLightbox(false); }} aria-label="Kapat"><X size={25} strokeWidth={1.5} /></button>{hasMultiple && <><button type="button" className="alya-lightbox-arrow alya-lightbox-prev" onClick={event => { event.stopPropagation(); move(-1); }} aria-label="Önceki fotoğraf"><ChevronLeft size={34} strokeWidth={1.2} /></button><button type="button" className="alya-lightbox-arrow alya-lightbox-next" onClick={event => { event.stopPropagation(); move(1); }} aria-label="Sonraki fotoğraf"><ChevronRight size={34} strokeWidth={1.2} /></button><div className="alya-lightbox-counter" aria-live="polite">{selectedIndex + 1} / {visibleImages.length}</div></>}{<img src={currentImage} alt={`${product.name} - büyük görünüm`} onClick={event => event.stopPropagation()} />}</div>}
      <ProductVideo product={product} />
      <style jsx>{`
        .alya-gallery{width:100%;min-width:0;overflow:visible}.alya-gallery-layout{display:grid;grid-template-columns:72px minmax(0,1fr);gap:0;align-items:start;width:100%;min-width:0}.alya-gallery-thumbnails{position:static;display:flex;flex-direction:column;gap:8px;width:72px;max-height:calc(100vh - 180px);overflow:auto;padding:0;scrollbar-width:none}.alya-gallery-thumbnails::-webkit-scrollbar{display:none}.alya-gallery-thumb{width:72px;height:86px;flex:none;border:0;background:transparent;padding:0;overflow:hidden;cursor:pointer;transition:opacity .2s ease}.alya-gallery-thumb.is-active{opacity:1;outline:1px solid rgba(0,0,0,.22);outline-offset:-1px}.alya-gallery-thumb:not(.is-active){opacity:.58}.alya-gallery-thumb:hover{opacity:1}.alya-gallery-thumb img{width:100%;height:100%;object-fit:contain;display:block}.alya-gallery-main{min-width:0;width:100%;padding:0}.alya-product-image{position:relative;background:transparent;width:100%;height:520px;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:pan-y;cursor:zoom-in;outline:none}.alya-product-image img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;object-position:center;padding:0;box-sizing:border-box;transition:transform .35s ease}.alya-product-image.is-landscape img,.alya-product-image.is-portrait img{width:auto;max-width:100%;height:auto;max-height:100%}.alya-product-image:hover img{transform:scale(1.012)}.alya-gallery-expand{position:absolute;right:10px;top:10px;width:38px;height:38px;border:0;background:rgba(255,255,255,.88);display:grid;place-items:center;z-index:6;cursor:pointer;color:#171717}.alya-gallery-expand:hover{background:#171717;color:#fff}.alya-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border:0;background:rgba(255,255,255,.9);display:grid;place-items:center;z-index:6;cursor:pointer;color:#171717}.alya-gallery-arrow:hover{background:#171717;color:#fff}.alya-gallery-prev{left:10px}.alya-gallery-next{right:10px}.alya-gallery-counter{position:absolute;right:10px;bottom:10px;background:rgba(255,255,255,.9);padding:7px 10px;font-size:10px;letter-spacing:1px;color:#171717;z-index:6}.alya-gallery-caption{display:flex;justify-content:space-between;gap:16px;padding:11px 0 0;font-size:10px;letter-spacing:.2px;color:#777}.alya-gallery-caption span:last-child{color:#aaa}.alya-image-fallback{display:grid;place-items:center;text-align:center;color:#777;padding:30px}.alya-image-fallback span{font-size:30px;font-weight:800;letter-spacing:-2px}.alya-image-fallback small{margin-top:8px;font-size:11px}.alya-gallery-lightbox{position:fixed;inset:0;background:rgba(15,15,15,.96);display:flex;align-items:center;justify-content:center;padding:24px;z-index:9999;cursor:zoom-out}.alya-gallery-lightbox img{display:block;max-width:96vw;max-height:92vh;width:auto;height:auto;object-fit:contain;cursor:default}.alya-lightbox-close{position:absolute;right:24px;top:18px;width:44px;height:44px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.18);color:#fff;display:grid;place-items:center;cursor:pointer;z-index:4}.alya-lightbox-arrow{position:absolute;top:50%;transform:translateY(-50%);width:58px;height:58px;border:0;background:rgba(0,0,0,.2);color:#fff;display:grid;place-items:center;cursor:pointer;z-index:4}.alya-lightbox-prev{left:28px}.alya-lightbox-next{right:28px}.alya-lightbox-counter{position:absolute;left:50%;bottom:25px;transform:translateX(-50%);color:#fff;font-size:11px;letter-spacing:2px;background:rgba(0,0,0,.25);padding:8px 12px;z-index:4}@media(max-width:900px){.alya-gallery-layout{display:flex;flex-direction:column;gap:10px}.alya-gallery-main{width:100%;order:1}.alya-gallery-thumbnails{position:static;order:2;flex-direction:row;width:100%;max-height:none;overflow-x:auto;overflow-y:hidden;padding:0 0 4px}.alya-gallery-thumb{width:76px;height:92px}.alya-product-image{height:auto;min-height:0;overflow:visible}.alya-product-image.is-portrait img,.alya-product-image.is-landscape img{width:100%;height:auto;max-height:none}.alya-gallery-arrow{width:44px;height:44px}.alya-lightbox-prev{left:8px}.alya-lightbox-next{right:8px}.alya-lightbox-close{right:12px;top:12px}.alya-gallery-lightbox{padding:12px}.alya-gallery-lightbox img{max-width:96vw;max-height:86vh}}
      `}</style>
    </div>
  );
}
