import { useState, useCallback } from 'react';
import { soundEngine } from '../assets/sounds/soundEngine';

export function useInteraction({ markAreaExplored }) {
  const [doorOpen, setDoorOpen] = useState(false);
  const [fireplaceOn, setFireplaceOn] = useState(true);
  const [candlesOn, setCandlesOn] = useState(true);
  const [treeLightsOn, setTreeLightsOn] = useState(true);
  const [giftsOpened, setGiftsOpened] = useState(false);
  const [isSittingOnSofa, setIsSittingOnSofa] = useState(false);
  const [inspectingWindow, setInspectingWindow] = useState(false);
  const [windowEveningMode, setWindowEveningMode] = useState(true);

  // Emotional Interactive Modals
  const [tvVideoOpen, setTvVideoOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Track 4 signature emotional moments discovered: 'gifts' | 'letter' | 'photo' | 'tv'
  const [discoveredMoments, setDiscoveredMoments] = useState([]);

  const [hoveredObject, setHoveredObject] = useState(null);
  const [activeNotice, setActiveNotice] = useState(null);

  const markMoment = useCallback((key) => {
    setDiscoveredMoments((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const showNotice = useCallback((title, detail) => {
    setActiveNotice({ title, detail, timestamp: Date.now() });
  }, []);

  const handleObjectInteraction = useCallback(
    (objectId) => {
      // Specific gift box clicked in 3D: open orbiting boxes + show loved-one Chibi photo!
      if (typeof objectId === 'string' && objectId.startsWith('gift-box:')) {
        const idx = parseInt(objectId.split(':')[1], 10) || 0;
        markAreaExplored('Cây thông Noel');
        markMoment('gifts');
        setGiftsOpened(true);
        soundEngine.playBellSound();
        setActivePhotoIndex(idx);
        return;
      }

      // Specific wall or table photo clicked
      if (typeof objectId === 'string' && objectId.startsWith('photo:')) {
        const idx = parseInt(objectId.split(':')[1], 10) || 0;
        markAreaExplored('Khu vực Sofa');
        markMoment('photo');
        soundEngine.playMemoryChime();
        setActivePhotoIndex(idx);
        return;
      }

      switch (objectId) {
        case 'door': {
          setDoorOpen((prev) => {
            const next = !prev;
            soundEngine.playDoorSound(next);
            return next;
          });
          break;
        }
        case 'fireplace': {
          markAreaExplored('Lò sưởi');
          setFireplaceOn((prev) => {
            const next = !prev;
            soundEngine.setFireAudioActive(next);
            soundEngine.playInteractSound();
            return next;
          });
          break;
        }
        case 'candles': {
          setCandlesOn((prev) => {
            const next = !prev;
            soundEngine.playInteractSound();
            return next;
          });
          break;
        }
        case 'christmas-tree': {
          markAreaExplored('Cây thông Noel');
          setTreeLightsOn((prev) => {
            const next = !prev;
            soundEngine.playBellSound();
            return next;
          });
          break;
        }
        case 'gift-boxes': {
          markAreaExplored('Cây thông Noel');
          markMoment('gifts');
          setGiftsOpened((prev) => {
            const next = !prev;
            soundEngine.playBellSound();
            return next;
          });
          break;
        }
        case 'letter': {
          markAreaExplored('Khu vực Bàn ăn');
          markMoment('letter');
          soundEngine.playMemoryChime();
          setLetterOpen(true);
          break;
        }
        case 'photo-frame': {
          markAreaExplored('Khu vực Sofa');
          markMoment('photo');
          soundEngine.playMemoryChime();
          setActivePhotoIndex(0);
          break;
        }
        case 'sofa': {
          markAreaExplored('Khu vực Sofa');
          setInspectingWindow(false);
          setIsSittingOnSofa((prev) => {
            const next = !prev;
            soundEngine.playInteractSound();
            return next;
          });
          break;
        }
        case 'window': {
          markAreaExplored('Khu vực Bàn ăn');
          setIsSittingOnSofa(false);
          soundEngine.playInteractSound();
          setInspectingWindow((prev) => !prev);
          break;
        }
        case 'tv': {
          markAreaExplored('Lò sưởi');
          markMoment('tv');
          soundEngine.playMemoryChime();
          setTvVideoOpen((prev) => !prev);
          break;
        }
        default:
          break;
      }
    },
    [markAreaExplored, markMoment]
  );

  return {
    doorOpen,
    setDoorOpen,
    fireplaceOn,
    candlesOn,
    treeLightsOn,
    giftsOpened,
    setGiftsOpened,
    isSittingOnSofa,
    setIsSittingOnSofa,
    inspectingWindow,
    setInspectingWindow,
    windowEveningMode,
    setWindowEveningMode,
    tvVideoOpen,
    setTvVideoOpen,
    letterOpen,
    setLetterOpen,
    activePhotoIndex,
    setActivePhotoIndex,
    discoveredMoments,
    hoveredObject,
    setHoveredObject,
    activeNotice,
    setActiveNotice,
    showNotice,
    handleObjectInteraction,
  };
}
