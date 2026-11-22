// Phát hiện thiết bị cảm ứng / di động & iPad để tối ưu điều khiển và hiệu năng WebGL
export function detectMobileOrTablet() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isCoarsePointer =
    window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return isIPadOS || isMobileUA || isCoarsePointer;
}
