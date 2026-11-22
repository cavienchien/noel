import React from 'react';
import { Play, Compass } from 'lucide-react';

export default function StartScreen({
  mode,
  onEnterDirectly,
  onStartGuided,
}) {
  if (mode !== 'START') return null;

  return (
    <div className="start-screen-overlay">
      <div className="start-card">
        <h1 className="start-title">NGÔI NHÀ GIÁNG SINH</h1>

        <p className="start-subtitle">
          Nhấn để mở cửa bước vào không gian 3D và tự do khám phá.
        </p>

        <div className="start-actions">
          <button
            type="button"
            className="btn-primary-gold"
            onClick={onEnterDirectly}
            autoFocus
          >
            <Play size={18} aria-hidden="true" />
            <span>CLICK ĐỂ KHÁM PHÁ</span>
          </button>

          <button
            type="button"
            className="btn-secondary-ghost compact"
            onClick={onStartGuided}
          >
            <Compass size={16} aria-hidden="true" />
            <span>Giới thiệu nhanh 4 khu vực</span>
          </button>
        </div>
      </div>
    </div>
  );
}
