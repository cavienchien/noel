import React from 'react';
import { Sparkles, DoorOpen } from 'lucide-react';

export default function StartScreen({ mode, onEnterDirectly }) {
  if (mode !== 'START') return null;

  return (
    <div className="start-screen-overlay">
      <div className="start-card romantic-start-card">
        <div className="start-badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>ĐÊM GIÁNG SINH · KHÔNG GIAN KỶ NIỆM</span>
        </div>

        <h1 className="start-title">Gửi Người Thương</h1>

        <p className="start-subtitle">
          Có một căn phòng nhỏ ấm áp ánh nến, những hộp quà ẩn chứa kỷ niệm và
          một bức thư viết riêng đang chờ bạn mở cửa bước vào.
        </p>

        <div className="start-actions">
          <button
            type="button"
            className="btn-primary-gold start-hero-btn"
            onClick={onEnterDirectly}
            autoFocus
          >
            <DoorOpen size={19} aria-hidden="true" />
            <span>MỞ CỬA BƯỚC VÀO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
