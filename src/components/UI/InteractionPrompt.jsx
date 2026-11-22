import React from 'react';
import { X, Play } from 'lucide-react';

export default function InteractionPrompt({ mode, interaction }) {
  const { hoveredObject, tvVideoOpen, setTvVideoOpen } = interaction;

  if (mode !== 'FREE_EXPLORE' && mode !== 'OUTSIDE_DOOR') return null;

  return (
    <>
      {/* Tâm ngắm góc nhìn thứ nhất */}
      {mode === 'FREE_EXPLORE' && (
        <div
          className={`fps-reticle ${hoveredObject ? 'reticle-active' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* Khung phát Video khi bấm vào Tivi */}
      {tvVideoOpen && (
        <div
          className="tv-video-modal-overlay"
          onClick={() => setTvVideoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Màn hình Tivi"
        >
          <div
            className="tv-video-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="tv-video-close-btn"
              onClick={() => setTvVideoOpen(false)}
              aria-label="Đóng Tivi"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="tv-video-stage">
              <div className="tv-video-placeholder">
                <div className="tv-video-play-circle">
                  <Play size={28} aria-hidden="true" />
                </div>
                <p>Khung phát Video Tivi (Sẵn sàng chèn video khi bạn yêu cầu)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
