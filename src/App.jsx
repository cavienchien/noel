import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import {
  Volume2,
  VolumeX,
  Pause,
  Home,
  Flame,
  Sparkles,
  Gift,
  DoorOpen,
  User,
  Eye,
} from 'lucide-react';
import Room from './components/Scene/Room';
import Chibi from './components/Character/Chibi';
import FirstPersonCamera from './components/Camera/FirstPersonCamera';
import InteractionManager from './components/Interaction/InteractionManager';
import StartScreen from './components/UI/StartScreen';
import GuidedIntro from './components/UI/GuidedIntro';
import InteractionPrompt from './components/UI/InteractionPrompt';
import ExplorationProgress from './components/UI/ExplorationProgress';
import PauseMenu from './components/UI/PauseMenu';
import CompletionScreen from './components/UI/CompletionScreen';
import TouchControls from './components/UI/TouchControls';
import RotatePrompt from './components/UI/RotatePrompt';
import { useExploration } from './hooks/useExploration';
import { useInteraction } from './hooks/useInteraction';
import { soundEngine } from './assets/sounds/soundEngine';
import { detectMobileOrTablet } from './utils/devicePerformance';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="scene-fallback-box" role="alert">
          <h2>Thông Báo Đồ Họa 3D WebGL</h2>
          <p>
            Không thể khởi tạo đồ họa 3D WebGL trên trình duyệt. Vui lòng kiểm
            tra và bật tăng tốc phần cứng WebGL.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const exploration = useExploration();
  const interaction = useInteraction({
    markAreaExplored: exploration.markAreaExplored,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [currentProximityZone, setCurrentProximityZone] = useState(null);
  const [isMobileDevice] = useState(() => detectMobileOrTablet());
  const touchMoveRef = useRef({ x: 0, y: 0 });
  // Góc nhìn: 'third' (thứ 3 với nhân vật Chibi) hoặc 'first' (thứ nhất)
  const [viewMode, setViewMode] = useState('third');
  const playerRef = useRef({
    pos: new THREE.Vector3(0.4, 0, 2.4),
    yaw: Math.PI,
    moving: false,
    speed: 0,
    sitting: false,
    hidden: false,
  });

  const toggleViewMode = useCallback(() => {
    soundEngine.playInteractSound();
    setViewMode((prev) => (prev === 'third' ? 'first' : 'third'));
  }, []);

  // Phím V để đổi góc nhìn nhanh
  useEffect(() => {
    if (exploration.mode !== 'FREE_EXPLORE') return;
    const onKey = (e) => {
      if (e.code === 'KeyV' && !exploration.isPaused) toggleViewMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exploration.mode, exploration.isPaused, toggleViewMode]);

  const handleToggleMute = useCallback(() => {
    soundEngine.init();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleVolumeChange = useCallback((val) => {
    soundEngine.init();
    soundEngine.setVolume(val);
    setVolume(val);
    if (val > 0 && soundEngine.isMuted) {
      soundEngine.toggleMute();
      setIsMuted(false);
    }
  }, []);

  const handleQuickInteractArea = useCallback(
    (areaName) => {
      if (exploration.mode !== 'FREE_EXPLORE') return;
      if (areaName === 'Lò sưởi')
        interaction.handleObjectInteraction('fireplace');
      if (areaName === 'Cây thông Noel')
        interaction.handleObjectInteraction('christmas-tree');
      if (areaName === 'Khu vực Sofa')
        interaction.handleObjectInteraction('sofa');
      if (areaName === 'Khu vực Bàn ăn')
        interaction.handleObjectInteraction('dining-table');
    },
    [exploration.mode, interaction]
  );

  const handleResetAll = useCallback(() => {
    interaction.setDoorOpen(false);
    interaction.setIsSittingOnSofa(false);
    interaction.setInspectingWindow(false);
    interaction.setInspectingTable(null);
    exploration.resetExperience();
  }, [exploration, interaction]);

  // Xác định tên khu vực hiện tại trên thanh trên cùng
  const activeAreaLabel =
    exploration.mode === 'GUIDED_TOUR' && exploration.currentGuidedStop
      ? exploration.currentGuidedStop.areaKey
      : exploration.mode === 'OUTSIDE_DOOR'
      ? 'Trước Cửa Ra Vào'
      : currentProximityZone || 'Phòng Khách & Phòng Ăn';

  return (
    <div className="app-shell">
      {/* Thanh tiêu đề tối giản trên cùng */}
      {exploration.mode !== 'START' && (
        <header className="hud-top-bar">
          <div className="hud-brand-pill">
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-title">NGÔI NHÀ GIÁNG SINH</span>
            <span className="brand-divider" aria-hidden="true">
              ·
            </span>
            <span className="brand-area-tag">{activeAreaLabel}</span>
          </div>

          <div className="hud-top-controls">
            {/* Bật/tắt âm thanh & chỉnh âm lượng */}
            <div className="hud-audio-group">
              <button
                type="button"
                className="hud-icon-btn"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? (
                  <VolumeX size={17} aria-hidden="true" />
                ) : (
                  <Volume2 size={17} aria-hidden="true" />
                )}
              </button>
              <label htmlFor="hud-volume" className="visually-hidden">
                Âm lượng
              </label>
              <input
                id="hud-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="hud-volume-slider"
              />
            </div>

            {/* Nút đổi góc nhìn thứ 1 / thứ 3 */}
            {exploration.mode === 'FREE_EXPLORE' && (
              <button
                type="button"
                className="hud-icon-btn view-toggle-btn"
                onClick={toggleViewMode}
                aria-label={
                  viewMode === 'third'
                    ? 'Chuyển sang góc nhìn thứ nhất'
                    : 'Chuyển sang góc nhìn thứ ba'
                }
              >
                {viewMode === 'third' ? (
                  <Eye size={17} aria-hidden="true" />
                ) : (
                  <User size={17} aria-hidden="true" />
                )}
                <span className="hud-btn-label">
                  {viewMode === 'third' ? 'Góc nhìn 1' : 'Góc nhìn 3'}
                </span>
              </button>
            )}

            {/* Nút Tạm Dừng */}
            <button
              type="button"
              className="hud-icon-btn"
              onClick={() => exploration.setIsPaused(true)}
              aria-label="Mở Menu Tạm Dừng"
            >
              <Pause size={17} aria-hidden="true" />
              <span className="hud-btn-label">Tạm Dừng</span>
            </button>

            {/* Nút Quay Lại Màn Hình Chính */}
            <button
              type="button"
              className="hud-icon-btn"
              onClick={exploration.returnToMainScreen}
              aria-label="Quay Lại Màn Hình Chính"
            >
              <Home size={17} aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      {/* Khung hiển thị không gian 3D toàn màn hình */}
      <main className="canvas-viewport">
        <SceneErrorBoundary>
          <Suspense
            fallback={
              <div className="loading-screen">
                <div className="loading-spinner" aria-hidden="true" />
                <p>Đang tải không gian 3D Ngôi Nhà Giáng Sinh...</p>
              </div>
            }
          >
            <Canvas
              shadows={isMobileDevice ? true : 'soft'}
              dpr={isMobileDevice ? [1, 1.25] : [1, 2]}
              gl={{
                antialias: !isMobileDevice,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 0.88,
              }}
              camera={{ position: [0.4, 1.56, 5.15], fov: 55, near: 0.1, far: 45 }}
            >
              <color attach="background" args={['#14110E']} />
              <fog attach="fog" args={['#261E18', 11, 26]} />

              {/* Offline Procedural Studio Environment Reflections (128px on mobile for zero lag) */}
              <Environment resolution={isMobileDevice ? 128 : 256} frames={1}>
                <Lightformer
                  form="rect"
                  intensity={0.55}
                  color="#FFD8A8"
                  position={[0, 6, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[10, 8, 1]}
                />
                <Lightformer
                  form="rect"
                  intensity={0.48}
                  color="#FFC078"
                  position={[-4, 2, -4]}
                  rotation={[0, Math.PI / 4, 0]}
                  scale={[5, 4, 1]}
                />
                <Lightformer
                  form="rect"
                  intensity={0.35}
                  color="#7A94B0"
                  position={[4, 3, -4]}
                  rotation={[0, -Math.PI / 4, 0]}
                  scale={[5, 4, 1]}
                />
              </Environment>

              {/* Bake ContactShadows once (frames={1}) on desktop and disable on mobile GPUs for smooth 60 FPS */}
              {!isMobileDevice && (
                <ContactShadows
                  position={[0, 0.004, 0.2]}
                  frames={1}
                  opacity={0.32}
                  scale={11}
                  blur={2.2}
                  far={2.6}
                  color="#4A3A2B"
                />
              )}

              <FirstPersonCamera
                mode={exploration.mode}
                currentGuidedStop={exploration.currentGuidedStop}
                isPaused={exploration.isPaused}
                setIsPaused={exploration.setIsPaused}
                interaction={interaction}
                touchMoveRef={touchMoveRef}
                viewMode={viewMode}
                playerRef={playerRef}
              />

              <InteractionManager
                mode={exploration.mode}
                isPaused={exploration.isPaused}
                interaction={interaction}
                onAreaProximityChange={setCurrentProximityZone}
                playerRef={playerRef}
              />

              <Chibi
                mode={exploration.mode}
                viewMode={viewMode}
                playerRef={playerRef}
              />

              <Room
                mode={exploration.mode}
                currentGuidedStop={exploration.currentGuidedStop}
                interaction={interaction}
                onTriggerInitialDoor={exploration.triggerInitialDoorOpen}
                isMobileDevice={isMobileDevice}
              />
            </Canvas>
          </Suspense>
        </SceneErrorBoundary>

        {/* Start Screen Overlay */}
        <StartScreen
          mode={exploration.mode}
          onEnterDirectly={exploration.enterDirectly}
          onStartGuided={exploration.startExperience}
        />

        {/* Phase 1: Guided Exploration Overlays */}
        <GuidedIntro
          mode={exploration.mode}
          guidedIndex={exploration.guidedIndex}
          currentGuidedStop={exploration.currentGuidedStop}
          onTriggerInitialDoor={exploration.triggerInitialDoorOpen}
          onBeginGuidedTour={exploration.beginGuidedTour}
          onNextStop={exploration.nextGuidedStop}
          onPrevStop={exploration.prevGuidedStop}
          onStartFreeExploration={exploration.startFreeExploration}
        />

        {/* Phase 2: Free Exploration Interaction Prompts & Sub-states */}
        <InteractionPrompt
          mode={exploration.mode}
          interaction={interaction}
        />

        {/* Exploration Progress Tracker (Top-Right / Side) */}
        <ExplorationProgress
          mode={exploration.mode}
          exploredAreas={exploration.exploredAreas}
          currentProximityZone={currentProximityZone}
          onQuickInteractArea={handleQuickInteractArea}
        />

        {/* Đề xuất xoay ngang màn hình trên điện thoại dọc */}
        <RotatePrompt />

        {/* Điều khiển cảm ứng cho Smartphone / iPad */}
        <TouchControls
          mode={exploration.mode}
          isPaused={exploration.isPaused}
          touchMoveRef={touchMoveRef}
        />

        {/* 1 khung điều khiển ánh sáng & tương tác nhỏ gọn */}
        {exploration.mode === 'FREE_EXPLORE' && (
          <div className="free-explore-bottom-bar minimal-dock-only">
            <div
              className="compact-light-frame"
              role="group"
              aria-label="Điều khiển ánh sáng và đồ vật"
            >
              <button
                type="button"
                className={`mini-ctrl-btn ${interaction.fireplaceOn ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('fireplace')}
                aria-label="Bật hoặc tắt lửa lò sưởi"
                title="Lò sưởi"
              >
                <Flame size={15} aria-hidden="true" />
                <span className="mini-ctrl-text">Lò sưởi</span>
              </button>
              <button
                type="button"
                className={`mini-ctrl-btn ${interaction.candlesOn ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('candles')}
                aria-label="Bật hoặc tắt nến"
                title="Nến"
              >
                <Flame size={15} aria-hidden="true" />
                <span className="mini-ctrl-text">Nến</span>
              </button>
              <button
                type="button"
                className={`mini-ctrl-btn ${interaction.treeLightsOn ? 'active' : ''}`}
                onClick={() =>
                  interaction.handleObjectInteraction('christmas-tree')
                }
                aria-label="Bật hoặc tắt đèn cây thông"
                title="Đèn cây thông"
              >
                <Sparkles size={15} aria-hidden="true" />
                <span className="mini-ctrl-text">Đèn cây</span>
              </button>
              <span className="mini-ctrl-sep" aria-hidden="true" />
              <button
                type="button"
                className={`mini-ctrl-btn ${interaction.giftsOpened ? 'active' : ''}`}
                onClick={() =>
                  interaction.handleObjectInteraction('gift-boxes')
                }
                aria-label="Mở hoặc đóng hộp quà"
                title="Hộp quà"
              >
                <Gift size={15} aria-hidden="true" />
                <span className="mini-ctrl-text">Quà</span>
              </button>
              <button
                type="button"
                className={`mini-ctrl-btn ${interaction.doorOpen ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('door')}
                aria-label="Mở hoặc đóng cửa chính"
                title="Cửa"
              >
                <DoorOpen size={15} aria-hidden="true" />
                <span className="mini-ctrl-text">Cửa</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Native Accessible Modal Dialogs */}
      <PauseMenu
        isPaused={exploration.isPaused}
        setIsPaused={exploration.setIsPaused}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        onResetExperience={handleResetAll}
        onReturnHome={exploration.returnToMainScreen}
      />

      <CompletionScreen
        showCompletionModal={exploration.showCompletionModal}
        completionDismissed={exploration.completionDismissed}
        onContinueExploring={() => exploration.setCompletionDismissed(true)}
        onRestartFromBeginning={handleResetAll}
      />
    </div>
  );
}
