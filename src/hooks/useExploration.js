import { useState, useCallback } from 'react';
import { soundEngine } from '../assets/sounds/soundEngine';

export const GUIDED_STOPS = [
  {
    id: 'fireplace',
    areaKey: 'Lò sưởi',
    title: '1. Lò Sưởi & Bệ Trang Trí Mùa Đông',
    subtitle: 'Lò Sưởi Màu Trắng Kem Phong Cách Bắc Âu',
    description:
      'Khung lò sưởi màu trắng kem cổ điển với viền gạch trắng, tranh phong cảnh ngôi nhà gỗ mùa đông phía trên, dây thông rủ gắn đèn LED, chân nến đồng lung linh và chú người tuyết đáng yêu. Ánh lửa ấm áp phản chiếu nhẹ nhàng lên mặt sàn.',
    cameraPos: [-1.85, 1.62, -0.35],
    lookAt: [-2.15, 1.38, -3.05],
  },
  {
    id: 'tree',
    areaKey: 'Cây thông Noel',
    title: '2. Cây Thông Noel Bắc Âu',
    subtitle: 'Cây Thông Xanh & Hộp Quà Giáng Sinh',
    description:
      'Đặt cạnh khung cửa sổ trên thảm lông trắng mềm mại, cây thông Noel rực rỡ với ánh đèn LED vàng nhấp nháy, chuỗi hạt cườm vàng, quả châu, ngôi sao đỉnh cây phát sáng cùng những hộp quà thắt nơ đặt bên dưới.',
    cameraPos: [0.35, 1.65, 0.25],
    lookAt: [0.45, 1.35, -2.35],
  },
  {
    id: 'sofa',
    areaKey: 'Khu vực Sofa',
    title: '3. Không Gian Tiếp Khách & Sofa',
    subtitle: 'Sofa Kem Hiện Đại & Thảm Họa Tiết Hình Học',
    description:
      'Không gian thư giãn ấm cúng hướng thẳng về phía lò sưởi: chiếc sofa kem tay vịn bo tròn vắt chăn len đan mềm mại, đèn sàn vòng cung đồng thau, thảm họa tiết hình học, bàn trà tròn cắm hoa hồng trắng và chậu cây Monstera xanh mát.',
    cameraPos: [0.85, 1.72, -0.35],
    lookAt: [-1.45, 0.85, 1.35],
  },
  {
    id: 'dining',
    areaKey: 'Khu vực Bàn ăn',
    title: '4. Bàn Ăn Gỗ Sồi & Khung Cửa Sổ',
    subtitle: 'Bàn Ăn Gỗ Sáng Màu & Ánh Sáng Tự Nhiên',
    description:
      'Đón ánh sáng dịu nhẹ từ khung cửa sổ lớn nhìn ra rừng thông tuyết rơi bên ngoài, khu vực bàn ăn gỗ sồi sáng màu và đèn chùm cầu thủy tinh tạo điểm nhấn với khay gỗ cắm hoa trắng cùng nến trang trí ấm áp.',
    cameraPos: [0.45, 1.68, 1.45],
    lookAt: [2.35, 1.15, -0.85],
  },
];

export const EXPLORATION_AREAS = [
  'Lò sưởi',
  'Cây thông Noel',
  'Khu vực Sofa',
  'Khu vực Bàn ăn',
];

export function useExploration() {
  // Modes: 'START' | 'OUTSIDE_DOOR' | 'OPENING_DOOR' | 'ENTERING_ROOM' | 'GUIDED_OVERVIEW' | 'GUIDED_TOUR' | 'GUIDED_COMPLETE' | 'FREE_EXPLORE'
  const [mode, setMode] = useState('START');
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [exploredAreas, setExploredAreas] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const markAreaExplored = useCallback((areaName) => {
    if (!EXPLORATION_AREAS.includes(areaName)) return;
    setExploredAreas((prev) => {
      if (prev.includes(areaName)) return prev;
      const updated = [...prev, areaName];
      soundEngine.playBellSound();
      if (updated.length === EXPLORATION_AREAS.length) {
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 700);
      }
      return updated;
    });
  }, []);

  // Vào thẳng trải nghiệm: mở cửa mượt -> bước vào phòng -> tự do khám phá ngay (không rườm rà)
  const enterDirectly = useCallback(() => {
    soundEngine.init();
    soundEngine.playDoorSound(true);
    soundEngine.startMusic();
    setIsPaused(false);
    setMode('OPENING_DOOR');
    setTimeout(() => {
      setMode('ENTERING_ROOM');
    }, 900);
    setTimeout(() => {
      setMode('FREE_EXPLORE');
    }, 3100);
  }, []);

  // Bước 1 -> Bước 2: Chế độ xem giới thiệu nhanh từ trước cửa
  const startExperience = useCallback(() => {
    soundEngine.init();
    soundEngine.startMusic();
    soundEngine.playInteractSound();
    setMode('OUTSIDE_DOOR');
    setIsPaused(false);
  }, []);

  // Step 2 -> Step 3: User clicks door handle to open door and step inside
  const triggerInitialDoorOpen = useCallback(() => {
    soundEngine.playDoorSound(true);
    soundEngine.startMusic();
    setMode('OPENING_DOOR');
    // After door swings open, camera walks smoothly into room overview
    setTimeout(() => {
      setMode('ENTERING_ROOM');
    }, 1100);
    setTimeout(() => {
      setMode('GUIDED_OVERVIEW');
    }, 3600);
  }, []);

  // Step 3 -> Step 4: Start guided tour of 4 areas
  const beginGuidedTour = useCallback(() => {
    soundEngine.playInteractSound();
    setGuidedIndex(0);
    setMode('GUIDED_TOUR');
  }, []);

  // Advance to next area in Guided Tour
  const nextGuidedStop = useCallback(() => {
    soundEngine.playInteractSound();
    setGuidedIndex((prev) => {
      if (prev + 1 < GUIDED_STOPS.length) {
        return prev + 1;
      } else {
        setMode('GUIDED_COMPLETE');
        soundEngine.playBellSound();
        return prev;
      }
    });
  }, []);

  const prevGuidedStop = useCallback(() => {
    soundEngine.playInteractSound();
    setGuidedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Step 5 -> Phase 2: Enter Free Exploration without reloading scene or resetting camera
  const startFreeExploration = useCallback(() => {
    soundEngine.playInteractSound();
    setMode('FREE_EXPLORE');
    setIsPaused(false);
  }, []);

  // Reset entire journey from beginning
  const resetExperience = useCallback(() => {
    soundEngine.playInteractSound();
    setExploredAreas([]);
    setShowCompletionModal(false);
    setCompletionDismissed(false);
    setGuidedIndex(0);
    setIsPaused(false);
    setMode('OUTSIDE_DOOR');
  }, []);

  const returnToMainScreen = useCallback(() => {
    soundEngine.playInteractSound();
    setIsPaused(false);
    setMode('START');
  }, []);

  return {
    mode,
    setMode,
    guidedIndex,
    currentGuidedStop: GUIDED_STOPS[guidedIndex],
    exploredAreas,
    markAreaExplored,
    showCompletionModal,
    setShowCompletionModal,
    completionDismissed,
    setCompletionDismissed,
    isPaused,
    setIsPaused,
    enterDirectly,
    startExperience,
    triggerInitialDoorOpen,
    beginGuidedTour,
    nextGuidedStop,
    prevGuidedStop,
    startFreeExploration,
    resetExperience,
    returnToMainScreen,
  };
}
