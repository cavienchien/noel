import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TouchControls({ mode, isPaused, touchMoveRef }) {
  if (mode !== 'FREE_EXPLORE' || isPaused) return null;

  const setDir = (dir, active) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (touchMoveRef.current) {
      touchMoveRef.current[dir] = active;
    }
  };

  return (
    <div
      className="touch-dpad-container"
      role="group"
      aria-label="Điều khiển di chuyển cảm ứng"
    >
      <div className="touch-dpad-row">
        <button
          type="button"
          className="touch-dpad-btn"
          aria-label="Đi tới"
          onPointerDown={setDir('forward', true)}
          onPointerUp={setDir('forward', false)}
          onPointerLeave={setDir('forward', false)}
          onPointerCancel={setDir('forward', false)}
        >
          <ChevronUp size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="touch-dpad-row">
        <button
          type="button"
          className="touch-dpad-btn"
          aria-label="Sang trái"
          onPointerDown={setDir('left', true)}
          onPointerUp={setDir('left', false)}
          onPointerLeave={setDir('left', false)}
          onPointerCancel={setDir('left', false)}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="touch-dpad-btn"
          aria-label="Đi lùi"
          onPointerDown={setDir('backward', true)}
          onPointerUp={setDir('backward', false)}
          onPointerLeave={setDir('backward', false)}
          onPointerCancel={setDir('backward', false)}
        >
          <ChevronDown size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="touch-dpad-btn"
          aria-label="Sang phải"
          onPointerDown={setDir('right', true)}
          onPointerUp={setDir('right', false)}
          onPointerLeave={setDir('right', false)}
          onPointerCancel={setDir('right', false)}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
