import React from 'react';
import { Sparkles } from 'lucide-react';
import MemoryModals from './MemoryModals';

export default function InteractionPrompt({ mode, interaction }) {
  const { hoveredObject, handleObjectInteraction } = interaction;

  if (mode === 'OPENING_DOOR' || mode === 'ENTERING_ROOM') {
    return (
      <div className="guided-bottom-container">
        <div className="guided-entering-pill">
          <Sparkles size={15} aria-hidden="true" />
          <span>Đang mở cửa bước vào căn phòng ấm áp...</span>
        </div>
      </div>
    );
  }

  if (mode !== 'FREE_EXPLORE') return null;

  const modalOpen =
    interaction.tvVideoOpen ||
    interaction.letterOpen ||
    interaction.activePhotoIndex !== null;

  return (
    <>
      {/* Tâm ngắm nhẹ tối giản */}
      {!modalOpen && (
        <div
          className={`fps-reticle ${hoveredObject ? 'reticle-active' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* Nhãn tương tác nhỏ gọn khi trỏ vào vật thể 3D */}
      {!modalOpen && hoveredObject && (
        <button
          type="button"
          className="compact-hover-pill"
          onClick={() => handleObjectInteraction(hoveredObject.id)}
        >
          <span className="hover-pill-name">{hoveredObject.name}</span>
          <span className="hover-pill-action">{hoveredObject.actionLabel}</span>
        </button>
      )}

      {/* Các khung hiển thị Kỷ Niệm: Tivi Video, Thư Tình Sáp Đỏ, Ảnh Chibi Polaroid */}
      <MemoryModals interaction={interaction} />
    </>
  );
}
