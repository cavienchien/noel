import { useState, useCallback } from 'react';
import { soundEngine } from '../assets/sounds/soundEngine';

export function useInteraction({ markAreaExplored }) {
  // Interactive Object States
  const [doorOpen, setDoorOpen] = useState(false);
  const [fireplaceOn, setFireplaceOn] = useState(true);
  const [candlesOn, setCandlesOn] = useState(true);
  const [treeLightsOn, setTreeLightsOn] = useState(true);
  const [giftsOpened, setGiftsOpened] = useState(false);
  const [isSittingOnSofa, setIsSittingOnSofa] = useState(false);
  const [inspectingWindow, setInspectingWindow] = useState(false);
  const [windowEveningMode, setWindowEveningMode] = useState(true);
  const [inspectingTable, setInspectingTable] = useState(null); // null | 'coffee' | 'dining'
  const [tvVideoOpen, setTvVideoOpen] = useState(false);

  // Currently hovered / targeted interactive object from Raycaster
  const [hoveredObject, setHoveredObject] = useState(null);
  // Active toast / status message for tactile confirmation alongside 3D animation
  const [activeNotice, setActiveNotice] = useState(null);

  const showNotice = useCallback((title, detail) => {
    setActiveNotice({ title, detail, timestamp: Date.now() });
  }, []);

  const handleObjectInteraction = useCallback(
    (objectId) => {
      switch (objectId) {
        case 'door': {
          setDoorOpen((prev) => {
            const next = !prev;
            soundEngine.playDoorSound(next);
            showNotice(
              next ? 'Đã Mở Cửa Chính' : 'Đã Đóng Cửa Chính',
              next
                ? 'Hơi lạnh mùa đông nhẹ nhàng hòa quyện cùng ánh sáng ấm áp trong phòng.'
                : 'Cánh cửa đã đóng kín, giữ trọn sự ấm cúng cho căn phòng.'
            );
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
            showNotice(
              next ? 'Đã Thắp Lửa Lò Sưởi' : 'Đã Tắt Lửa Lò Sưởi',
              next
                ? 'Ngọn lửa vàng ấm nhảy múa và phản chiếu ánh sáng dịu dàng xuống mặt sàn.'
                : 'Lò sưởi tạm nghỉ với lớp than hồng êm dịu.'
            );
            return next;
          });
          break;
        }
        case 'candles': {
          setCandlesOn((prev) => {
            const next = !prev;
            soundEngine.playInteractSound();
            showNotice(
              next ? 'Đã Thắp Sáng Nến' : 'Đã Tắt Toàn Bộ Nến',
              next
                ? 'Ánh nến lung linh tỏa sáng trên lò sưởi, bàn trà và bàn ăn.'
                : 'Toàn bộ nến trang trí trong phòng đã được tắt.'
            );
            return next;
          });
          break;
        }
        case 'christmas-tree': {
          markAreaExplored('Cây thông Noel');
          setTreeLightsOn((prev) => {
            const next = !prev;
            soundEngine.playBellSound();
            showNotice(
              next ? 'Đã Bật Đèn Cây Thông' : 'Đã Tắt Đèn Cây Thông',
              next
                ? 'Hàng trăm bóng LED vàng và ngôi sao đỉnh cây lấp lánh rực rỡ.'
                : 'Cây thông nghỉ ngơi trong ánh sáng tự nhiên dịu nhẹ.'
            );
            return next;
          });
          break;
        }
        case 'gift-boxes': {
          markAreaExplored('Cây thông Noel');
          setGiftsOpened((prev) => {
            const next = !prev;
            soundEngine.playBellSound();
            showNotice(
              next ? 'Đã Mở Hộp Quà Giáng Sinh!' : 'Đã Đóng Hộp Quà',
              next
                ? 'Nắp hộp quà mở ra để lộ những món quà Giáng Sinh lấp lánh bên trong!'
                : 'Các hộp quà đã được gói gọn gàng trở lại dưới gốc thông.'
            );
            return next;
          });
          break;
        }
        case 'sofa': {
          markAreaExplored('Khu vực Sofa');
          setInspectingWindow(false);
          setInspectingTable(null);
          setIsSittingOnSofa((prev) => {
            const next = !prev;
            soundEngine.playInteractSound();
            showNotice(
              next ? 'Đang Thư Giãn Trên Sofa' : 'Đã Đứng Dậy Khỏi Sofa',
              next
                ? 'Tận hưởng góc nhìn thẳng về phía lò sưởi ấm áp và cây thông Noel. Nhấn WASD hoặc nút Đứng dậy bất cứ lúc nào.'
                : 'Tiếp tục di chuyển tự do để khám phá căn phòng.'
            );
            return next;
          });
          break;
        }
        case 'coffee-table': {
          markAreaExplored('Khu vực Sofa');
          setIsSittingOnSofa(false);
          setInspectingWindow(false);
          soundEngine.playInteractSound();
          setInspectingTable((prev) => (prev === 'coffee' ? null : 'coffee'));
          showNotice(
            'Vật Dụng Trên Bàn Trà',
            'Bình hoa hồng trắng tinh khôi, bộ sách kiến trúc Bắc Âu và nến thơm trang trí.'
          );
          break;
        }
        case 'dining-table': {
          markAreaExplored('Khu vực Bàn ăn');
          setIsSittingOnSofa(false);
          setInspectingWindow(false);
          soundEngine.playInteractSound();
          setInspectingTable((prev) => (prev === 'dining' ? null : 'dining'));
          showNotice(
            'Bàn Ăn Gỗ Sồi Bắc Âu',
            'Bàn ăn gỗ sáng màu dành cho hai người kèm khay gỗ cắm hoa trắng và ba cây nến trụ.'
          );
          break;
        }
        case 'window': {
          markAreaExplored('Khu vực Bàn ăn');
          setIsSittingOnSofa(false);
          setInspectingTable(null);
          soundEngine.playInteractSound();
          setInspectingWindow((prev) => {
            const next = !prev;
            if (next) {
              showNotice(
                'Ngắm Khung Cảnh Ngoài Cửa Sổ',
                'Tuyết rơi nhẹ qua những tán thông mùa đông. Bạn có thể chuyển đổi ánh sáng Ban ngày / Hoàng hôn tuyết.'
              );
            }
            return next;
          });
          break;
        }
        case 'tv': {
          soundEngine.playInteractSound();
          setTvVideoOpen((prev) => !prev);
          break;
        }
        default:
          break;
      }
    },
    [markAreaExplored, showNotice]
  );

  return {
    doorOpen,
    setDoorOpen,
    fireplaceOn,
    candlesOn,
    treeLightsOn,
    giftsOpened,
    isSittingOnSofa,
    setIsSittingOnSofa,
    inspectingWindow,
    setInspectingWindow,
    windowEveningMode,
    setWindowEveningMode,
    inspectingTable,
    setInspectingTable,
    tvVideoOpen,
    setTvVideoOpen,
    hoveredObject,
    setHoveredObject,
    activeNotice,
    setActiveNotice,
    handleObjectInteraction,
  };
}
