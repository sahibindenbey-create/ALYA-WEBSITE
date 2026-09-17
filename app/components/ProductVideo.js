'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play } from 'lucide-react';

export default function ProductVideo({ product }) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef(null);

  const folder = useMemo(() => product?.code?.match(/\d{4}$/)?.[0] || '', [product?.code]);

  useEffect(() => {
    let active = true;
    setIndex(0);
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

  useEffect(() => {
    if (!playing || images.length < 2 || fullscreen) return undefined;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 3600);
    return () => window.clearInterval(timer);
  }, [playing, images.length, fullscreen]);

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') setFullscreen(false);
      if (event.key === 'ArrowRight' && images.length > 1) setIndex(current => (current + 1) % images.length);
      if (event.key === 'ArrowLeft' && images.length > 1) setIndex(current => (current - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  if (images.length < 2) return null;

  const move = direction => setIndex(current => (current + direction + images.length) % images.length);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    try {
      if (!document.fullscreenElement) await stageRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
    setFullscreen(value => !value);
  };

  return (
    <section className={`alya-product-video${fullscreen ? ' is-fullscreen' : ''}`} aria-label={`${product.name} ürün sunumu`}>
      <div className="alya-showcase-heading">
        <div>
          <span>ALYA HOMES / PRODUCT STORY</span>
          <h2>Ürünü keşfet</h2>
        </div>
        <p>Her açıdan inceleyin. Görseller otomatik olarak sinematik bir ürün sunumuna dönüşür.</p>
      </div>

      <div className="alya-video-stage" ref={stageRef}>
        {images.map((image, imageIndex) => (
          <img
            key={image}
            src={image}
            alt={imageIndex === index ? `${product.name} ürün sunumu` : ''}
            aria-hidden={imageIndex !== index}
            className={`alya-video-frame${imageIndex === index ? ' is-active' : ''}`}
          />
        ))}
        <div className="alya-video-shade" />
        <div className="alya-video-topline"><span>ALYA HOMES</span><span>{product.code}</span></div>

        <div className="alya-video-copy">
          <small>PRODUCT {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</small>
          <strong>{product.name}</strong>
          <span>{product.category || 'ALYA HOMES koleksiyonu'}</span>
        </div>

        <button type="button" className="alya-video-nav alya-video-prev" onClick={() => move(-1)} aria-label="Önceki görsel"><ChevronLeft size={20} /></button>
        <button type="button" className="alya-video-nav alya-video-next" onClick={() => move(1)} aria-label="Sonraki görsel"><ChevronRight size={20} /></button>

        <div className="alya-video-controls">
          <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Sunumu duraklat' : 'Sunumu oynat'}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label="Tam ekran">
            <Maximize2 size={14} />
          </button>
        </div>

        <div className="alya-video-progress" aria-hidden="true">
          {images.map((_, imageIndex) => <span key={imageIndex} className={imageIndex === index ? 'is-active' : ''} />)}
        </div>
      </div>

      <div className="alya-showcase-strip" aria-label="Ürün sunumu görselleri">
        {images.map((image, imageIndex) => (
          <button type="button" key={`${image}-${imageIndex}`} className={imageIndex === index ? 'is-active' : ''} onClick={() => { setIndex(imageIndex); setPlaying(false); }} aria-label={`${product.name} görsel ${imageIndex + 1}`}>
            <img src={image} alt="" />
            <span>{String(imageIndex + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      <div className="alya-showcase-note">
        <span>FOTOĞRAF GALERİSİ</span>
        <span>•</span>
        <span>SİNEMATİK ÜRÜN SUNUMU</span>
        <span>•</span>
        <span>{images.length} GÖRSEL</span>
      </div>

      <style jsx>{`
        .alya-product-video{margin-top:68px}.alya-showcase-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:22px}.alya-showcase-heading span{display:block;font-size:9px;letter-spacing:2.5px;color:#9b9b9b;font-weight:700}.alya-showcase-heading h2{margin:8px 0 0;font-size:clamp(28px,4vw,48px);font-weight:500;letter-spacing:-2px;color:#171717}.alya-showcase-heading p{max-width:330px;margin:0 0 2px;font-size:11px;line-height:1.7;color:#777}.alya-video-stage{position:relative;aspect-ratio:16/9;min-height:420px;overflow:hidden;background:#ece9e4}.alya-video-stage:fullscreen{width:100vw;height:100vh;aspect-ratio:auto;background:#111}.alya-video-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.085);transition:opacity .9s cubic-bezier(.2,.65,.25,1),transform 4.4s cubic-bezier(.2,.65,.25,1)}.alya-video-frame.is-active{opacity:1;transform:scale(1)}.alya-video-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.02) 32%,rgba(0,0,0,.66) 100%);pointer-events:none}.alya-video-topline{position:absolute;left:28px;right:28px;top:24px;display:flex;justify-content:space-between;color:rgba(255,255,255,.9);font-size:9px;letter-spacing:2.2px;font-weight:700}.alya-video-copy{position:absolute;left:34px;bottom:46px;color:#fff;display:flex;flex-direction:column;gap:6px}.alya-video-copy small{font-size:9px;letter-spacing:2px;opacity:.72}.alya-video-copy strong{font-size:clamp(28px,4vw,56px);font-weight:500;letter-spacing:-2px;line-height:1.05}.alya-video-copy span{font-size:10px;letter-spacing:1.2px;opacity:.72;text-transform:uppercase}.alya-video-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border:1px solid rgba(255,255,255,.45);background:rgba(15,15,15,.12);backdrop-filter:blur(8px);color:#fff;display:grid;place-items:center;cursor:pointer;opacity:0;transition:opacity .2s,background .2s}.alya-video-stage:hover .alya-video-nav,.alya-video-stage:focus-within .alya-video-nav{opacity:1}.alya-video-nav:hover{background:#fff;color:#171717}.alya-video-prev{left:20px}.alya-video-next{right:20px}.alya-video-controls{position:absolute;right:25px;bottom:35px;display:flex;gap:7px}.alya-video-controls button{width:38px;height:38px;border:1px solid rgba(255,255,255,.55);background:rgba(10,10,10,.18);backdrop-filter:blur(8px);color:#fff;display:grid;place-items:center;cursor:pointer}.alya-video-controls button:hover{background:#fff;color:#171717}.alya-video-progress{position:absolute;left:0;right:0;bottom:0;height:3px;display:flex;gap:2px;background:rgba(255,255,255,.22)}.alya-video-progress span{flex:1;background:rgba(255,255,255,.4);transform-origin:left;transition:background .2s}.alya-video-progress span.is-active{background:#f58a1f}.alya-showcase-strip{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:8px;margin-top:10px}.alya-showcase-strip button{position:relative;padding:0;border:1px solid #e2dfda;background:#f4f2ee;aspect-ratio:1/1;overflow:hidden;cursor:pointer;opacity:.68;transition:opacity .2s,border-color .2s}.alya-showcase-strip button.is-active{opacity:1;border-color:#171717}.alya-showcase-strip img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}.alya-showcase-strip button:hover img{transform:scale(1.04)}.alya-showcase-strip span{position:absolute;left:7px;bottom:6px;color:#fff;font-size:8px;letter-spacing:1px;text-shadow:0 1px 5px #000}.alya-showcase-note{display:flex;justify-content:center;gap:9px;margin-top:14px;color:#aaa;font-size:8px;letter-spacing:1.7px}.alya-showcase-note span:nth-child(2n){color:#ddd}.alya-product-video.is-fullscreen .alya-showcase-heading,.alya-product-video.is-fullscreen .alya-showcase-strip,.alya-product-video.is-fullscreen .alya-showcase-note{display:none}@media(max-width:900px){.alya-product-video{margin-top:42px}.alya-showcase-heading{display:block;margin-bottom:15px}.alya-showcase-heading h2{letter-spacing:-1.2px}.alya-showcase-heading p{margin-top:10px;max-width:none}.alya-video-stage{aspect-ratio:4/5;min-height:0}.alya-video-topline{left:18px;right:18px;top:18px}.alya-video-copy{left:20px;bottom:42px}.alya-video-copy strong{font-size:31px}.alya-video-controls{right:17px;bottom:29px}.alya-video-nav{opacity:1;width:36px;height:36px}.alya-video-prev{left:10px}.alya-video-next{right:10px}.alya-showcase-strip{grid-template-columns:repeat(9,72px);overflow-x:auto;padding-bottom:4px}.alya-showcase-strip button{width:72px}.alya-showcase-note{font-size:7px;letter-spacing:1px;gap:6px}}
      `}</style>
    </section>
  );
}
