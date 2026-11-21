import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EXPLORATION_AREAS } from '../../hooks/useExploration';

export default function ExplorationProgress({
  mode,
  exploredAreas,
  currentProximityZone,
  onQuickInteractArea,
}) {
  // Thu gọn mặc định trên màn hình điện thoại nhỏ để ưu tiên không gian 3D
  const [isCollapsed, setIsCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (mode === 'START' || mode === 'FREE_EXPLORE') return null;

  const count = exploredAreas.length;
  const total = EXPLORATION_AREAS.length;
  const percent = Math.round((count / total) * 100);

  return (
    <aside
      className={`exploration-progress-panel ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Tiến Trình Khám Phá"
    >
      <button
        type="button"
        className="progress-toggle-header"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
      >
        <span className="progress-title">TIẾN TRÌNH</span>
        <span className="progress-counter-wrap">
          <span className="progress-counter">
            {count}/{total}
          </span>
          {isCollapsed ? (
            <ChevronDown size={15} aria-hidden="true" />
          ) : (
            <ChevronUp size={15} aria-hidden="true" />
          )}
        </span>
      </button>

      <div className="progress-bar-track" aria-hidden="true">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      {!isCollapsed && (
        <>
          {currentProximityZone && mode === 'FREE_EXPLORE' && (
            <div className="current-zone-pill">
              <MapPin size={13} aria-hidden="true" />
              <span>Gần: {currentProximityZone}</span>
            </div>
          )}

          <ul className="progress-area-list">
            {EXPLORATION_AREAS.map((area) => {
              const isDone = exploredAreas.includes(area);
              return (
                <li
                  key={area}
                  className={`progress-area-item ${isDone ? 'explored' : ''}`}
                >
                  <button
                    type="button"
                    className="progress-area-btn"
                    onClick={() => onQuickInteractArea(area)}
                    disabled={mode !== 'FREE_EXPLORE'}
                  >
                    {isDone ? (
                      <CheckCircle2
                        size={15}
                        className="icon-done"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        size={15}
                        className="icon-pending"
                        aria-hidden="true"
                      />
                    )}
                    <span>{area}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}
