import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows } from '@react-three/drei';
import Sidebar from './components/Sidebar';
import TrayOverview from './components/TrayOverview';
import TopBar from './components/TopBar';
import Tray from './components/Tray';
import CanvasControls from './components/CanvasControls';
import ScreenshotHandler from './components/ScreenshotHandler';

function App() {
  const [dimensions, setDimensions] = useState({
    width: 1000,
    depth: 600,
    height: 100,
    rows: 2,
    cols: 3,
    horizontalDividers: [300],
    verticalDividers: [333, 666],
  });

  const [viewMode, setViewMode] = useState('3d');
  const [showOverview, setShowOverview] = useState(false);
  const colors = [
    { name: 'Red', hex: '#ef4444', class: 'bg-red-500' },
    { name: 'Pink', hex: '#ec4899', class: 'bg-pink-500' },
    { name: 'Purple', hex: '#9333ea', class: 'bg-purple-600' },
    { name: 'Indigo', hex: '#4f46e5', class: 'bg-indigo-600' },
    { name: 'Blue', hex: '#2563eb', class: 'bg-blue-600' },
    { name: 'Light Blue', hex: '#60a5fa', class: 'bg-blue-400' },
    { name: 'Cyan', hex: '#06b6d4', class: 'bg-cyan-500' },
    { name: 'Dark Cyan', hex: '#0891b2', class: 'bg-cyan-600' },
    { name: 'Teal', hex: '#14b8a6', class: 'bg-teal-500' },
    { name: 'Green', hex: '#16a34a', class: 'bg-green-600' }
  ];
  const [selectedColor, setSelectedColor] = useState(colors[2]);

  const screenshotHandlerRef = React.useRef(null);

  const handleRequestQuote = () => {
    console.log("Request Quote Clicked");
    if (screenshotHandlerRef.current) {
      console.log("Calling screenshot handler...");
      screenshotHandlerRef.current.capture();
    } else {
      console.error("Screenshot handler ref is null");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#111111] overflow-hidden font-sans text-white">
      <TopBar />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[400px] overflow-y-auto shrink-0 border-r border-white/10 no-scrollbar">
          {showOverview ? (
            <TrayOverview
              setShowOverview={setShowOverview}
              selectedColor={selectedColor}
              onRequestQuote={handleRequestQuote}
            />
          ) : (
            <Sidebar
              dimensions={dimensions}
              setDimensions={setDimensions}
              setShowOverview={setShowOverview}
              colors={colors}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              onRequestQuote={handleRequestQuote}
            />
          )}
        </div>

        <main className="flex-1 relative bg-[#0a0a0a]">
          <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
            <Suspense fallback={null}>
              <PerspectiveCamera
                makeDefault
                position={viewMode === '3d' ? [15, 15, 15] : [0, 20, 0]}
                fov={45}
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minPolarAngle={viewMode === '3d' ? 0 : Math.PI / 2}
                maxPolarAngle={viewMode === '3d' ? Math.PI / 1.5 : Math.PI / 2}
                enableRotate={viewMode === '3d'}
              />

              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={2} castShadow />

              <group position={[0, dimensions.height / 200, 0]}>
                <Tray
                  width={dimensions.width}
                  depth={dimensions.depth}
                  height={dimensions.height}
                  rows={dimensions.rows}
                  cols={dimensions.cols}
                  horizontalDividers={dimensions.horizontalDividers}
                  verticalDividers={dimensions.verticalDividers}
                  color={selectedColor?.hex || '#7E7E7E'}
                />
              </group>

              <Grid
                visible={false}
                fadeDistance={50}
                fadeStrength={5}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#ffffff"
                cellSize={1}
                cellThickness={0.5}
                cellColor="#ffffff"
                position={[0, 0, 0]}
                infiniteGrid={true}
                opacity={0.05}
              />

              <ContactShadows
                position={[0, 0, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={4.5}
              />

              <Environment preset="city" />
              <ScreenshotHandler onRegister={(handler) => (screenshotHandlerRef.current = handler)} />
            </Suspense>
          </Canvas>

          <CanvasControls viewMode={viewMode} setViewMode={setViewMode} />
        </main>
      </div>
    </div >
  );
}

export default App;
