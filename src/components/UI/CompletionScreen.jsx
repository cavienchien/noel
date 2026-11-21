import React, { useRef, useEffect } from 'react';
import { Award, RotateCcw, Compass } from 'lucide-react';

export default function CompletionScreen({
  showCompletionModal,
  completionDismissed,
  onContinueExploring,
  onRestartFromBeginning,
}) {
  const dialogRef = useRef(null);
  const isOpen = showCompletionModal && !completionDismissed;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog completion-dialog"
      aria-labelledby="completion-dialog-title"
      onClose={onContinueExploring}
    >
      <div className="dialog-inner centered">
        <div className="completion-medal" aria-hidden="true">
          <Award size={32} />
        </div>

        <span className="dialog-eyebrow">ĐÃ KHÁM PHÁ 4 / 4 KHU VỰC</span>
        <h2 id="completion-dialog-title">CHÚC MỪNG BẠN!</h2>
        <p className="completion-lead">
          Bạn đã khám phá trọn vẹn toàn bộ Ngôi Nhà Giáng Sinh.
        </p>
        <p className="dialog-desc">
          Từ lò sưởi ấm áp, cây thông Noel lấp lánh cho đến góc sofa thư giãn và
          bàn ăn gỗ sồi cạnh cửa sổ tuyết rơi, bạn đã trải nghiệm mọi không gian
          của ngôi nhà.
        </p>

        <div className="dialog-actions-row">
          <button
            type="button"
            className="btn-secondary-ghost"
            onClick={onRestartFromBeginning}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Khám Phá Lại Từ Đầu</span>
          </button>

          <button
            type="button"
            className="btn-primary-gold"
            onClick={onContinueExploring}
            autoFocus
          >
            <Compass size={17} aria-hidden="true" />
            <span>Tiếp Tục Tự Do Dạo Quanh</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
