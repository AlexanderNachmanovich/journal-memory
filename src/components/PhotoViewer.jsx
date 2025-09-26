import React, { useEffect, useState } from "react";

export default function PhotoViewer({ photos, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const handleNext = () => setIndex((i) => (i + 1) % photos.length);
  const handlePrev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);

  // Навигация по клавишам
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!photos || photos.length === 0) return null;

  return (
      <div className="photo-viewer-overlay" onClick={onClose}>
        <div className="photo-viewer" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>✖</button>

          <img
              src={`photos://${photos[index].filePath}`}
              alt={`Фото ${index + 1}`}
              className="photo-viewer-img"
          />

          {photos.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={handlePrev}>‹</button>
                <button className="nav-btn next" onClick={handleNext}>›</button>
              </>
          )}
        </div>
      </div>

  );
}
