import React, { Suspense, useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import Room from './components/Scene/Room';
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
  const touchMoveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

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

  const handleSkipToFreeExplore = useCallback(() => {
    soundEngine.init();
    soundEngine.startMusic();
    interaction.setDoorOpen(true);
    exploration.startFreeExploration();
  }, [exploration, interaction]);

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
              shadows="soft"
              dpr={[1, 2]}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.06,
              }}
              camera={{ position: [0.4, 1.56, 5.15], fov: 55, near: 0.1, far: 45 }}
            >
              <color attach="background" args={['#1F1C19']} />
              <fog attach="fog" args={['#F3ECE1', 12, 28]} />

              {/* Offline Procedural Studio Environment Reflections for Brass, Glass & Ornaments */}
              <Environment resolution={256} frames={1}>
                <Lightformer
                  form="rect"
                  intensity={2.2}
                  color="#FFF4DF"
                  position={[0, 6, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[10, 8, 1]}
                />
                <Lightformer
                  form="rect"
                  intensity={1.8}
                  color="#FFE2B0"
                  position={[-4, 2, -4]}
                  rotation={[0, Math.PI / 4, 0]}
                  scale={[5, 4, 1]}
                />
                <Lightformer
                  form="rect"
                  intensity={1.6}
                  color="#DDEBF5"
                  position={[4, 3, -4]}
                  rotation={[0, -Math.PI / 4, 0]}
                  scale={[5, 4, 1]}
                />
              </Environment>

              <ContactShadows
                position={[0, 0.004, 0.2]}
                opacity={0.32}
                scale={11}
                blur={2.2}
                far={2.6}
                color="#4A3A2B"
              />

              <FirstPersonCamera
                mode={exploration.mode}
                currentGuidedStop={exploration.currentGuidedStop}
                isPaused={exploration.isPaused}
                setIsPaused={exploration.setIsPaused}
                interaction={interaction}
                touchMoveRef={touchMoveRef}
              />

              <InteractionManager
                mode={exploration.mode}
                isPaused={exploration.isPaused}
                interaction={interaction}
                onAreaProximityChange={setCurrentProximityZone}
              />

              <Room
                mode={exploration.mode}
                currentGuidedStop={exploration.currentGuidedStop}
                interaction={interaction}
                onTriggerInitialDoor={exploration.triggerInitialDoorOpen}
              />
            </Canvas>
          </Suspense>
        </SceneErrorBoundary>

        {/* Start Screen Overlay */}
        <StartScreen
          mode={exploration.mode}
          onStartExperience={exploration.startExperience}
          onSkipToFreeExplore={handleSkipToFreeExplore}
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

        {/* Thanh hướng dẫn điều khiển & nút tương tác nhanh */}
        {exploration.mode === 'FREE_EXPLORE' && (
          <div className="free-explore-bottom-bar">
            <div className="controls-legend-pill desktop-only-legend">
              <span>
                <kbd>WASD</kbd> Di chuyển
              </span>
              <span>
                <kbd>Chuột</kbd> Xoay góc nhìn
              </span>
              <span>
                <kbd>Chuột trái</kbd> Tương tác
              </span>
              <span>
                <kbd>ESC</kbd> Tạm dừng
              </span>
            </div>
            <div className="controls-legend-pill touch-only-legend">
              <span>Vuốt 1 ngón: Xoay 360°</span>
              <span>·</span>
              <span>Chạm đồ vật: Tương tác</span>
            </div>

            <div className="quick-interact-dock" role="group" aria-label="Tương tác nhanh trong phòng">
              <button
                type="button"
                className={`dock-chip ${interaction.doorOpen ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('door')}
              >
                <DoorOpen size={14} aria-hidden="true" />
                <span>Cửa</span>
              </button>
              <button
                type="button"
                className={`dock-chip ${interaction.fireplaceOn ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('fireplace')}
              >
                <Flame size={14} aria-hidden="true" />
                <span>Lò Sưởi</span>
              </button>
              <button
                type="button"
                className={`dock-chip ${interaction.candlesOn ? 'active' : ''}`}
                onClick={() => interaction.handleObjectInteraction('candles')}
              >
                <Flame size={14} aria-hidden="true" />
                <span>Nến</span>
              </button>
              <button
                type="button"
                className={`dock-chip ${interaction.treeLightsOn ? 'active' : ''}`}
                onClick={() =>
                  interaction.handleObjectInteraction('christmas-tree')
                }
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>Đèn Cây Thông</span>
              </button>
              <button
                type="button"
                className={`dock-chip ${interaction.giftsOpened ? 'active' : ''}`}
                onClick={() =>
                  interaction.handleObjectInteraction('gift-boxes')
                }
              >
                <Gift size={14} aria-hidden="true" />
                <span>Hộp Quà</span>
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
