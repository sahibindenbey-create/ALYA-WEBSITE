'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

export default function ProductVideo({ product }) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

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
    if (!playing || images.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 2600);
    return () => window.clearInterval(timer);
  }, [playing, images.length]);

  if (images.length < 2) return null;

  return (
    <section className="alya-product-video" aria-label={`${product.name} ürün videosu`}>
      <div className="alya-video-stage">
        {images.map((image, imageIndex) => (
          <img
            key={image}
            src={image}
            alt={imageIndex === index ? `${product.name} ürün tanıtımı` : ''}
            aria-hidden={imageIndex !== index}
            className={`alya-video-frame${imageIndex === index ? ' is-active' : ''}`}
          />
        ))}
        <div className="alya-video-shade" />
        <div className="alya-video-copy">
          <span>ALYA HOMES</span>
          <strong>{product.name}</strong>
          <small>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</small>
        </div>
        <div className="alya-video-controls">
          <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Videoyu duraklat' : 'Videoyu oynat'}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
        <div className="alya-video-progress"><span style={{ width: `${((index + 1) / images.length) * 100}%` }} /></div>
      </div>
      <p>Ürün görsellerinden oluşturulan kısa tanıtım sunumu.</p>
      <style jsx>{`
        .alya-product-video{margin-top:42px}.alya-video-stage{position:relative;aspect-ratio:16/9;min-height:360px;overflow:hidden;background:#f3f1ed}.alya-video-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.04);transition:opacity .7s ease,transform 3.2s ease}.alya-video-frame.is-active{opacity:1;transform:scale(1)}.alya-video-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.58));pointer-events:none}.alya-video-copy{position:absolute;left:28px;bottom:30px;color:#fff;display:flex;flex-direction:column;gap:5px}.alya-video-copy span{font-size:10px;letter-spacing:2.5px;font-weight:700}.alya-video-copy strong{font-size:clamp(24px,3vw,42px);font-weight:500;letter-spacing:-1.2px}.alya-video-copy small{font-size:9px;letter-spacing:1.5px;opacity:.8}.alya-video-controls{position:absolute;right:20px;bottom:25px;display:flex;gap:7px}.alya-video-controls button{width:38px;height:38px;border:1px solid rgba(255,255,255,.6);background:rgba(0,0,0,.2);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(5px)}.alya-video-controls button:hover{background:#fff;color:#171717}.alya-video-progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.25)}.alya-video-progress span{display:block;height:100%;background:#f58a1f;transition:width .5s ease}.alya-product-video>p{font-size:10px;color:#888;margin:9px 0 0}@media(max-width:900px){.alya-product-video{margin-top:28px}.alya-video-stage{aspect-ratio:4/5;min-height:0}.alya-video-copy{left:18px;bottom:24px}.alya-video-controls{right:14px;bottom:18px}}
      `}</style>
    </section>
  );
}
