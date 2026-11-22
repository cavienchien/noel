import React, { useRef, useState } from 'react';

export default function TouchControls({ mode, isPaused, touchMoveRef }) {
  const baseRef = useRef(null);
  const activePointerId = useRef(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  if (mode !== 'FREE_EXPLORE' || isPaused) return null;

  const maxRadius = 34;

  const updateStick = (clientX, clientY) => {
    const base = baseRef.current;
    if (!base || !touchMoveRef.current) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobOffset({ x: dx, y: dy });
    // Normalized analog movement vector: x (-1 left .. +1 right), y (-1 backward .. +1 forward)
    touchMoveRef.current.x = dx / maxRadius;
    touchMoveRef.current.y = -dy / maxRadius;
  };

  const resetStick = () => {
    activePointerId.current = null;
    setIsActive(false);
    setKnobOffset({ x: 0, y: 0 });
    if (touchMoveRef.current) {
      touchMoveRef.current.x = 0;
      touchMoveRef.current.y = 0;
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsActive(true);
    updateStick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateStick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    resetStick();
  };

  return (
    <div
      className="touch-joystick-wrap"
      role="group"
      aria-label="Cần điều khiển di chuyển bằng tay"
    >
      <div
        ref={baseRef}
        className={`touch-joystick-base ${isActive ? 'active' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="touch-joystick-knob"
          style={{
            transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
          }}
        />
      </div>
      <span className="touch-joystick-label" aria-hidden="true">
        Di chuyển
      </span>
    </div>
  );
}
