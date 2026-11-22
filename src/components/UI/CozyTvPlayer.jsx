import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TV_CHAPTERS } from '../../data/memoriesData';

// Trình phát Video Kỷ Niệm Giáng Sinh trực tiếp trên Tivi (chạy 60 FPS mượt mà cả offline & GitHub Pages)
export default function CozyTvPlayer() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timeRef = useRef(0);
  const playingRef = useRef(true);
  const totalDuration = 24; // 24 giây vòng lặp 4 chương kỷ niệm

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Tải trước 4 ảnh chibi
    const imgs = TV_CHAPTERS.map((ch) => {
      const img = new Image();
      img.src = ch.image;
      return img;
    });

    // Hạt tuyết & bokeh ấm áp
    const flakes = Array.from({ length: 55 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 540,
      r: 1.5 + Math.random() * 3.2,
      vy: 18 + Math.random() * 32,
      vx: -10 + Math.random() * 20,
      a: 0.35 + Math.random() * 0.5,
    }));

    let rafId = 0;
    let lastTs = performance.now();
    let uiSyncAccum = 0;

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      if (playingRef.current) {
        timeRef.current = (timeRef.current + dt) % totalDuration;
      }

      const t = timeRef.current;
      uiSyncAccum += dt;
      if (uiSyncAccum >= 0.12) {
        uiSyncAccum = 0;
        setProgress(t / totalDuration);
      }

      const chapterLen = totalDuration / TV_CHAPTERS.length;
      const idx = Math.floor(t / chapterLen) % TV_CHAPTERS.length;
      const localT = (t % chapterLen) / chapterLen; // 0..1
      const ch = TV_CHAPTERS[idx];
      const img = imgs[idx];

      // Nền tối ấm điện ảnh
      ctx.fillStyle = '#14100D';
      ctx.fillRect(0, 0, 960, 540);

      // Hiệu ứng Ken Burns pan/zoom mượt mà trên ảnh Chibi
      if (img && img.complete && img.naturalWidth > 0) {
        const scale = 1.04 + localT * 0.1;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = 960 / 540;
        let drawW = 960;
        let drawH = 540;
        if (imgAspect > canvasAspect) {
          drawW = 540 * imgAspect;
        } else {
          drawH = 960 / imgAspect;
        }
        drawW *= scale;
        drawH *= scale;
        const panX = (960 - drawW) / 2 + (localT - 0.5) * 24;
        const panY = (540 - drawH) / 2 + (0.5 - localT) * 14;

        // Fade mượt giữa các chương
        let alpha = 1;
        if (localT < 0.12) alpha = localT / 0.12;
        else if (localT > 0.88) alpha = (1 - localT) / 0.12;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(img, panX, panY, drawW, drawH);
        ctx.restore();
      }

      // Vignette ấm áp điện ảnh
      const vig = ctx.createRadialGradient(480, 270, 140, 480, 270, 560);
      vig.addColorStop(0, 'rgba(20, 14, 10, 0)');
      vig.addColorStop(1, 'rgba(14, 10, 8, 0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, 960, 540);

      // Tuyết rơi nhẹ trên màn hình Tivi
      flakes.forEach((f) => {
        if (playingRef.current) {
          f.y += f.vy * dt;
          f.x += (f.vx + Math.sin(t * 2 + f.r) * 12) * dt;
          if (f.y > 548) {
            f.y = -8;
            f.x = Math.random() * 960;
          }
          if (f.x < -10) f.x = 970;
          if (f.x > 970) f.x = -10;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 246, 224, ${f.a})`;
        ctx.fill();
      });

      // Dải tối chân màn hình cho phụ đề tình cảm
      const subGrad = ctx.createLinearGradient(0, 390, 0, 540);
      subGrad.addColorStop(0, 'rgba(15, 11, 8, 0)');
      subGrad.addColorStop(1, 'rgba(15, 11, 8, 0.88)');
      ctx.fillStyle = subGrad;
      ctx.fillRect(0, 390, 960, 150);

      // Nhãn chương & Phụ đề tiếng Việt
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E9C879';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(ch.title.toUpperCase(), 480, 456);

      ctx.fillStyle = '#F9F6F0';
      ctx.font = 'italic 600 26px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(ch.subtitle, 480, 494);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    timeRef.current = val * totalDuration;
    setProgress(val);
  };

  return (
    <div className="cozy-tv-player">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="cozy-tv-canvas"
      />
      <div className="cozy-tv-controls">
        <button
          type="button"
          className="tv-ctrl-btn"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
        >
          {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={progress}
          onChange={handleSeek}
          aria-label="Thanh thời gian video"
          className="tv-seek-slider"
        />
        <button
          type="button"
          className="tv-ctrl-btn"
          onClick={() => {
            timeRef.current = 0;
            setProgress(0);
            setIsPlaying(true);
          }}
          aria-label="Phát lại từ đầu"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
