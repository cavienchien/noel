import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Gift, Mail } from 'lucide-react';
import { MEMORY_PHOTOS, LOVE_LETTER_DEMO } from '../../data/memoriesData';
import CozyTvPlayer from './CozyTvPlayer';

export default function MemoryModals({ interaction }) {
  const {
    tvVideoOpen,
    setTvVideoOpen,
    letterOpen,
    setLetterOpen,
    activePhotoIndex,
    setActivePhotoIndex,
  } = interaction;

  const tvDialogRef = useRef(null);
  const letterDialogRef = useRef(null);
  const photoDialogRef = useRef(null);

  useEffect(() => {
    const d = tvDialogRef.current;
    if (!d) return;
    if (tvVideoOpen && !d.open) d.showModal();
    else if (!tvVideoOpen && d.open) d.close();
  }, [tvVideoOpen]);

  useEffect(() => {
    const d = letterDialogRef.current;
    if (!d) return;
    if (letterOpen && !d.open) d.showModal();
    else if (!letterOpen && d.open) d.close();
  }, [letterOpen]);

  useEffect(() => {
    const d = photoDialogRef.current;
    if (!d) return;
    if (activePhotoIndex !== null && !d.open) d.showModal();
    else if (activePhotoIndex === null && d.open) d.close();
  }, [activePhotoIndex]);

  const currentPhoto =
    activePhotoIndex !== null
      ? MEMORY_PHOTOS[activePhotoIndex % MEMORY_PHOTOS.length]
      : null;

  return (
    <>
      {/* 1. MÀN HÌNH VIDEO TIVI KỶ NIỆM */}
      <dialog
        ref={tvDialogRef}
        className="modal-dialog tv-cinema-dialog"
        aria-labelledby="tv-dialog-title"
        onClose={() => setTvVideoOpen(false)}
      >
        <div className="memory-modal-header">
          <div className="memory-modal-title-wrap">
            <span className="memory-eyebrow">THƯỚC PHIM GIÁNG SINH</span>
            <h2 id="tv-dialog-title">Kỷ Niệm Đêm Đông</h2>
          </div>
          <button
            type="button"
            className="memory-close-btn"
            onClick={() => setTvVideoOpen(false)}
            aria-label="Đóng Tivi"
            autoFocus
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {tvVideoOpen && <CozyTvPlayer />}
      </dialog>

      {/* 2. BỨC THƯ TÌNH GIÁNG SINH (SÁP ĐỎ BÀN ĂN) */}
      <dialog
        ref={letterDialogRef}
        className="modal-dialog love-letter-dialog"
        aria-labelledby="letter-dialog-title"
        onClose={() => setLetterOpen(false)}
      >
        <div className="love-letter-paper">
          <button
            type="button"
            className="letter-close-btn"
            onClick={() => setLetterOpen(false)}
            aria-label="Đóng bức thư"
            autoFocus
          >
            <X size={18} aria-hidden="true" />
          </button>

          <div className="letter-seal-badge" aria-hidden="true">
            <Mail size={18} />
          </div>
          <span className="letter-eyebrow">{LOVE_LETTER_DEMO.eyebrow}</span>
          <h2 id="letter-dialog-title" className="letter-heading">
            {LOVE_LETTER_DEMO.title}
          </h2>
          <span className="letter-date">{LOVE_LETTER_DEMO.date}</span>

          <div className="letter-body">
            {LOVE_LETTER_DEMO.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="letter-footer">
            <p className="letter-closing">{LOVE_LETTER_DEMO.closing}</p>
            <p className="letter-signature">{LOVE_LETTER_DEMO.signature}</p>
          </div>
        </div>
      </dialog>

      {/* 3. KHUNG ẢNH CHIBI NGƯỜI THƯƠNG (HỘP QUÀ & KHUNG ẢNH BÀN TRÀ / TƯỜNG) */}
      <dialog
        ref={photoDialogRef}
        className="modal-dialog polaroid-dialog"
        aria-labelledby="polaroid-dialog-title"
        onClose={() => setActivePhotoIndex(null)}
      >
        {currentPhoto && (
          <div className="polaroid-modal-card">
            <button
              type="button"
              className="memory-close-btn polaroid-close"
              onClick={() => setActivePhotoIndex(null)}
              aria-label="Đóng khung ảnh"
              autoFocus
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="polaroid-frame-sheet">
              <div className="polaroid-img-wrap">
                <img
                  src={currentPhoto.image}
                  alt={currentPhoto.title}
                  className="polaroid-img"
                />
              </div>

              <div className="polaroid-caption-area">
                <div className="polaroid-meta">
                  <span className="polaroid-tag">
                    <Gift size={13} aria-hidden="true" />
                    <span>Kỷ niệm {activePhotoIndex + 1} / {MEMORY_PHOTOS.length}</span>
                  </span>
                  <span className="polaroid-date">{currentPhoto.date}</span>
                </div>
                <h2 id="polaroid-dialog-title" className="polaroid-title">
                  {currentPhoto.title}
                </h2>
                <p className="polaroid-text">{currentPhoto.caption}</p>
              </div>
            </div>

            <div className="polaroid-nav-bar">
              <button
                type="button"
                className="btn-secondary-ghost compact"
                onClick={() =>
                  setActivePhotoIndex(
                    (prev) =>
                      (prev - 1 + MEMORY_PHOTOS.length) % MEMORY_PHOTOS.length
                  )
                }
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>Ảnh trước</span>
              </button>

              <span className="polaroid-heart-pill" aria-hidden="true">
                <Heart size={14} />
              </span>

              <button
                type="button"
                className="btn-primary-gold compact"
                onClick={() =>
                  setActivePhotoIndex((prev) => (prev + 1) % MEMORY_PHOTOS.length)
                }
              >
                <span>Ảnh tiếp</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
