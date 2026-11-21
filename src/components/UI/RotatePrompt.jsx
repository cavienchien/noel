import React, { useState } from 'react';
import { RotateCw, X } from 'lucide-react';

export default function RotatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [hintText, setHintText] = useState('Xoay ngang để xem 3D đẹp hơn');

  if (dismissed) return null;

  const handleRequestLandscape = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen && !document.fullscreenElement) {
        await docEl.requestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
        return;
      }
    } catch {
      // iOS Safari hoặc trình duyệt không hỗ trợ tự khóa xoay màn hình
    }
    setHintText('Hãy xoay ngang điện thoại của bạn');
  };

  return (
    <div
      className="rotate-landscape-prompt"
      role="region"
      aria-label="Đề xuất xoay ngang màn hình"
    >
      <button
        type="button"
        className="rotate-prompt-btn"
        onClick={handleRequestLandscape}
      >
        <RotateCw size={15} className="rotate-icon-anim" aria-hidden="true" />
        <span>{hintText}</span>
      </button>
      <button
        type="button"
        className="rotate-dismiss-btn"
        aria-label="Ẩn đề xuất xoay ngang"
        onClick={() => setDismissed(true)}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
