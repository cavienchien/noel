import React from 'react';
import { Play, Compass } from 'lucide-react';

export default function StartScreen({
  mode,
  onStartExperience,
  onSkipToFreeExplore,
}) {
  if (mode !== 'START') return null;

  return (
    <div className="start-screen-overlay">
      <div className="start-card">
        <h1 className="start-title">MERRY CHRISTMAS  MÓN QUÀ NHỎ GỬI ĐẾN EM/ANH</h1>

        <p className="start-subtitle">
          Lại một mùa giáng sinh lại tới, đây là mùa thứ n tôi và em/anh ( chúng ta ở bên nhau ). .....................
        </p>

        <div className="start-actions">
          <button
            type="button"
            className="btn-primary-gold"
            onClick={onStartExperience}
            autoFocus
          >
            <Play size={18} aria-hidden="true" />
            <span>TRẢI NGHIỆM THEO HƯỚNG DẪN</span>
          </button>

          <button
            type="button"
            className="btn-secondary-ghost"
            onClick={onSkipToFreeExplore}
          >
            <Compass size={17} aria-hidden="true" />
            <span>TỰ KHÁM PHÁ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
