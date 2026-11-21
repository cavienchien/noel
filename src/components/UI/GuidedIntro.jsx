import React from 'react';
import {
  DoorOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Compass,
  Eye,
} from 'lucide-react';
import { GUIDED_STOPS } from '../../hooks/useExploration';

export default function GuidedIntro({
  mode,
  guidedIndex,
  currentGuidedStop,
  onTriggerInitialDoor,
  onBeginGuidedTour,
  onNextStop,
  onPrevStop,
  onStartFreeExploration,
}) {
  // Bước 2: Trước cửa ra vào
  if (mode === 'OUTSIDE_DOOR') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-door-card">
          <div className="door-pulse-icon" aria-hidden="true">
            <DoorOpen size={22} />
          </div>
          <div className="guided-door-text">
            <span className="guided-step-tag">BƯỚC 1 / 2 · TRƯỚC CỬA NHÀ</span>
            <h2>Nhấn vào cửa để mở</h2>
            <p>
              Nhấn trực tiếp vào tay nắm cửa 3D hoặc bấm nút bên cạnh để mở cửa
              bước vào phòng.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-gold"
            onClick={onTriggerInitialDoor}
          >
            <span>Mở Cửa</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Đang mở cửa & bước vào phòng
  if (mode === 'OPENING_DOOR' || mode === 'ENTERING_ROOM') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-entering-pill">
          <Sparkles size={16} aria-hidden="true" />
          <span>Đang bước vào không gian ấm áp của Ngôi Nhà Giáng Sinh...</span>
        </div>
      </div>
    );
  }

  // Bước 3: Lời chào tổng quan sau khi bước vào
  if (mode === 'GUIDED_OVERVIEW') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card">
          <div className="guided-card-header">
            <span className="guided-step-tag">CHÀO MỪNG BƯỚC VÀO · TOÀN CẢNH PHÒNG</span>
            <span className="look-hint">
              <Eye size={14} aria-hidden="true" /> Kéo hoặc di chuột để nhìn quanh
            </span>
          </div>
          <h2>Phòng Khách Giáng Sinh Bắc Âu Ấm Áp</h2>
          <p>
            Chào mừng bạn về nhà. Hãy dành chút thời gian quan sát xung quanh —
            từ lò sưởi đang cháy hồng và cây thông Noel lấp lánh đến bộ sofa kem
            êm ái cùng bàn ăn gỗ sồi bên khung cửa sổ mùa đông.
          </p>
          <div className="guided-card-actions">
            <button
              type="button"
              className="btn-secondary-ghost"
              onClick={onStartFreeExploration}
            >
              Bỏ Qua Hướng Dẫn
            </button>
            <button
              type="button"
              className="btn-primary-gold"
              onClick={onBeginGuidedTour}
            >
              <span>Tham Quan 4 Khu Vực</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bước 4: Giới thiệu 4 khu vực chính
  if (mode === 'GUIDED_TOUR' && currentGuidedStop) {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card">
          <div className="guided-card-header">
            <span className="guided-step-tag">
              KHÁM PHÁ CÓ HƯỚNG DẪN · KHU VỰC {guidedIndex + 1} / {GUIDED_STOPS.length}
            </span>
            <span className="look-hint">
              <Eye size={14} aria-hidden="true" /> Tự do xoay góc nhìn
            </span>
          </div>

          <h2>{currentGuidedStop.title}</h2>
          <p className="guided-subtitle">{currentGuidedStop.subtitle}</p>
          <p>{currentGuidedStop.description}</p>

          <div className="guided-dots" aria-hidden="true">
            {GUIDED_STOPS.map((s, idx) => (
              <span
                key={s.id}
                className={`guided-dot ${idx === guidedIndex ? 'active' : ''} ${
                  idx < guidedIndex ? 'done' : ''
                }`}
              />
            ))}
          </div>

          <div className="guided-card-actions">
            {guidedIndex > 0 ? (
              <button
                type="button"
                className="btn-secondary-ghost"
                onClick={onPrevStop}
              >
                <ChevronLeft size={17} aria-hidden="true" />
                <span>Quay Lại</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary-ghost"
                onClick={onStartFreeExploration}
              >
                Khám Phá Tự Do
              </button>
            )}

            <button
              type="button"
              className="btn-primary-gold"
              onClick={onNextStop}
            >
              <span>TIẾP THEO</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bước 5: Hoàn thành phần giới thiệu
  if (mode === 'GUIDED_COMPLETE') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card guided-complete-card">
          <div className="guided-badge-gold">
            <Sparkles size={16} aria-hidden="true" />
            <span>HOÀN THÀNH PHẦN GIỚI THIỆU</span>
          </div>
          <h2>NGÔI NHÀ GIÁNG SINH CỦA BẠN</h2>
          <p className="guided-lead-text">Toàn bộ căn phòng đã sẵn sàng để bạn khám phá.</p>
          <p>
            Di chuyển tự do bằng các phím <strong>W, A, S, D</strong>, xoay góc
            nhìn bằng <strong>Chuột</strong>, và <strong>Nhấn chuột trái</strong>{' '}
            vào lò sưởi, nến, cây thông Noel, hộp quà, cửa sổ, sofa, bàn trà
            hoặc cửa ra vào để tương tác.
          </p>
          <div className="guided-card-actions centered">
            <button
              type="button"
              className="btn-primary-gold"
              onClick={onStartFreeExploration}
            >
              <Compass size={18} aria-hidden="true" />
              <span>KHÁM PHÁ TỰ DO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
