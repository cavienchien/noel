import React from 'react';
import {
  DoorOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Compass,
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
  if (mode === 'OUTSIDE_DOOR') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-door-card">
          <div className="door-pulse-icon" aria-hidden="true">
            <DoorOpen size={20} />
          </div>
          <div className="guided-door-text">
            <h2>Nhấn vào cửa để mở</h2>
          </div>
          <button
            type="button"
            className="btn-primary-gold compact"
            onClick={onTriggerInitialDoor}
          >
            <span>Mở Cửa</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'OPENING_DOOR' || mode === 'ENTERING_ROOM') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-entering-pill">
          <Sparkles size={15} aria-hidden="true" />
          <span>Đang mở cửa bước vào phòng...</span>
        </div>
      </div>
    );
  }

  if (mode === 'GUIDED_OVERVIEW') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card">
          <h2>Phòng Khách Giáng Sinh</h2>
          <p>Chọn tham quan 4 khu vực hoặc tự do di chuyển ngay.</p>
          <div className="guided-card-actions">
            <button
              type="button"
              className="btn-secondary-ghost compact"
              onClick={onStartFreeExploration}
            >
              Khám Phá Tự Do
            </button>
            <button
              type="button"
              className="btn-primary-gold compact"
              onClick={onBeginGuidedTour}
            >
              <span>Xem 4 Khu Vực</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'GUIDED_TOUR' && currentGuidedStop) {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card">
          <span className="guided-step-tag">
            KHU VỰC {guidedIndex + 1} / {GUIDED_STOPS.length}
          </span>
          <h2>{currentGuidedStop.title}</h2>
          <p>{currentGuidedStop.subtitle}</p>

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
                className="btn-secondary-ghost compact"
                onClick={onPrevStop}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>Trước</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary-ghost compact"
                onClick={onStartFreeExploration}
              >
                Tự Do Ngay
              </button>
            )}

            <button
              type="button"
              className="btn-primary-gold compact"
              onClick={onNextStop}
            >
              <span>Tiếp</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'GUIDED_COMPLETE') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-card guided-complete-card">
          <h2>NGÔI NHÀ GIÁNG SINH CỦA BẠN</h2>
          <div className="guided-card-actions centered">
            <button
              type="button"
              className="btn-primary-gold"
              onClick={onStartFreeExploration}
            >
              <Compass size={17} aria-hidden="true" />
              <span>KHÁM PHÁ TỰ DO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
