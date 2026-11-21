import React from 'react';

export default function InteractionPrompt({ mode, interaction }) {
  const { hoveredObject } = interaction;

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
    </>
  );
}
