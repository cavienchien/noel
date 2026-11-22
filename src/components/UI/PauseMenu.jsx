import React, { useRef, useEffect } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

export default function PauseMenu({
  isPaused,
  setIsPaused,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  onResetExperience,
  onReturnHome,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isPaused && !dialog.open) {
      dialog.showModal();
    } else if (!isPaused && dialog.open) {
      dialog.close();
    }
  }, [isPaused]);

  const handleClose = () => {
    setIsPaused(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog pause-dialog"
      aria-labelledby="pause-dialog-title"
      onClose={handleClose}
    >
      <div className="dialog-inner">
        <span className="dialog-eyebrow">ĐANG TẠM DỪNG</span>
        <h2 id="pause-dialog-title">Bảng Điều Khiển</h2>
        <p className="dialog-desc">
          Điều chỉnh âm lượng nhạc Giáng Sinh hoặc xem lại phím điều khiển trước
          khi tiếp tục khám phá căn phòng.
        </p>

        <div className="pause-audio-box">
          <div className="pause-audio-row">
            <button
              type="button"
              className="btn-secondary-ghost compact"
              onClick={onToggleMute}
            >
              {isMuted ? (
                <VolumeX size={16} aria-hidden="true" />
              ) : (
                <Volume2 size={16} aria-hidden="true" />
              )}
              <span>{isMuted ? 'Đã Tắt Tiếng' : 'Đang Bật Âm Thanh'}</span>
            </button>
            <label htmlFor="pause-volume-range" className="volume-label">
              Âm lượng: {Math.round((isMuted ? 0 : volume) * 100)}%
            </label>
          </div>
          <input
            id="pause-volume-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>

        <div className="pause-controls-summary">
          <h3>Hướng Dẫn Điều Khiển</h3>
          <div className="controls-grid desktop-only-grid">
            <div>
              <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
              <span>Di Chuyển Trong Phòng</span>
            </div>
            <div>
              <kbd>Chuột</kbd>
              <span>Xoay Góc Nhìn 360°</span>
            </div>
            <div>
              <kbd>Chuột Trái</kbd>
              <span>Tương Tác Với Đồ Vật</span>
            </div>
            <div>
              <kbd>ESC</kbd>
              <span>Tạm Dừng / Tiếp Tục</span>
            </div>
          </div>
          <div className="controls-grid touch-only-grid">
            <div>
              <kbd>Cần Gạt Trái</kbd>
              <span>Di Chuyển Tự Do 360°</span>
            </div>
            <div>
              <kbd>Vuốt 1 Ngón</kbd>
              <span>Xoay Góc Nhìn 360°</span>
            </div>
            <div>
              <kbd>Chạm Đồ Vật</kbd>
              <span>Bật Lửa, Đèn, Mở Quà</span>
            </div>
            <div>
              <kbd>Nút Tạm Dừng</kbd>
              <span>Mở Menu &amp; Âm Lượng</span>
            </div>
          </div>
        </div>

        <div className="dialog-actions-stack">
          <button
            type="button"
            className="btn-primary-gold full-width"
            onClick={() => setIsPaused(false)}
            autoFocus
          >
            <Play size={17} aria-hidden="true" />
            <span>Tiếp Tục Khám Phá</span>
          </button>

          <button
            type="button"
            className="btn-secondary-ghost full-width"
            onClick={onResetExperience}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Khám Phá Lại Từ Đầu</span>
          </button>

          <button
            type="button"
            className="btn-secondary-ghost full-width"
            onClick={onReturnHome}
          >
            <Home size={16} aria-hidden="true" />
            <span>Quay Về Màn Hình Chính</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
