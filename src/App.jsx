import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows } from '@react-three/drei';
import Sidebar from './components/Sidebar';
import TrayOverview from './components/TrayOverview';
import TopBar from './components/TopBar';
import Tray from './components/Tray';
import CanvasControls from './components/CanvasControls';
import ScreenshotHandler from './components/ScreenshotHandler';
import ModuleSelector from './components/ModuleSelector';
import WelcomePage from './components/WelcomePage';
import NewDesignModal from './components/NewDesignModal';
import Dashboard from './components/Dashboard';
import TrayDropHandler from './components/TrayDropHandler';
import { useDragDrop } from './hooks/useDragDrop';

function App() {
  // Load initial state from localStorage if available
  const savedConfig = JSON.parse(localStorage.getItem('mooqs_tray_config') || '{}');

  const [dimensions, setDimensions] = useState(savedConfig.dimensions || {
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
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [finish, setFinish] = useState(savedConfig.finish || 'leather'); // 'leather' | 'velvet'
  const [showWelcome, setShowWelcome] = useState(savedConfig.hasStarted ? false : true);
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('templates');
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState(savedConfig.projectName || '');
  const [designHistory, setDesignHistory] = useState(() => {
    const savedHistory = localStorage.getItem('mooqs_design_history');
    return savedHistory ? JSON.parse(savedHistory) : [
      { id: '#08635', name: 'Watch Pad', date: '20 Aug, 25', status: 'Draft', amount: '--' },
      { id: '#08634', name: 'Drawer Module', date: '20 Aug, 25', status: 'Pending', amount: '--' },
      { id: '#08633', name: 'Deep Tray 12x8', date: '20 Aug, 25', status: 'Processing', amount: '$500.00' },
      { id: '#08635', name: 'Watch Pad', date: '20 Aug, 25', status: 'Draft', amount: '--' },
      { id: '#08632', name: 'Watch Pad', date: '20 Aug, 25', status: 'Complete', amount: '$763.00' },
      { id: '#08634', name: 'Drawer Module', date: '20 Aug, 25', status: 'Pending', amount: '--' },
      { id: '#08633', name: 'Deep Tray 12x8', date: '20 Aug, 25', status: 'Pending', amount: '$500.00' },
      { id: '#08632', name: 'Watch Pad', date: '20 Aug, 25', status: 'Complete', amount: '$763.00' },
    ];
  });

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
  const [selectedColor, setSelectedColor] = useState(savedConfig.selectedColor || colors[2]);

  const screenshotHandlerRef = useRef(null);

  // Use the drag/drop hook
  const {
    draggedModule,
    placedModules,
    getCells,
    moduleFitsInCell,
    isCellOccupied,
    placeModuleInCell,
    handleDragStart,
    handleDragEnd,
    setPlacedModules,
  } = useDragDrop({
    dimensions,
    onModulePlaced: (mod) => {
      console.log('Module placed:', mod.name, 'in cell', mod.cellKey);
      setShowModuleSelector(false);
    },
    initialPlacedModules: savedConfig.placedModules || []
  });

  // Autosave effect
  useEffect(() => {
    const saveState = () => {
      setIsSaving(true);
      const config = {
        dimensions,
        placedModules,
        selectedColor,
        finish,
        projectName,
        hasStarted: true
      };
      localStorage.setItem('mooqs_tray_config', JSON.stringify(config));
      // Simulate/Show saving state for a brief moment
      setTimeout(() => setIsSaving(false), 500);
    };

    saveState();
  }, [dimensions, placedModules, selectedColor, finish, projectName]);

  // Persist design history
  useEffect(() => {
    localStorage.setItem('mooqs_design_history', JSON.stringify(designHistory));
  }, [designHistory]);

  const handleDeleteDesign = (id) => {
    setDesignHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleEditDesign = (design) => {
    // If it's a draft, we "resume" it
    if (design.status === 'Draft') {
      // In a real app we'd load configuration here
      // For now we just close dashboard to show current editor
      setShowDashboard(false);
    } else {
      // For others we just view
      setShowDashboard(false);
    }
  };

  const handleRequestQuote = () => {
    if (screenshotHandlerRef.current) {
      screenshotHandlerRef.current.capture();
    }
  };

  // Handle drop on a specific cell (from 3D raycasting)
  const handleCellDrop = (moduleData, cell) => {
    if (!cell) return;

    if (!moduleFitsInCell(moduleData, cell)) {
      alert(`Module (${moduleData.width}x${moduleData.depth}mm) doesn't fit in this cell (${Math.round(cell.width)}x${Math.round(cell.depth)}mm)`);
      return;
    }

    if (isCellOccupied(cell.key)) {
      alert('This cell already has a module!');
      return;
    }

    placeModuleInCell(moduleData, cell);
    handleDragEnd();
  };

  const cells = getCells();

  return (
    <div className="flex flex-col h-screen w-full bg-[#111111] overflow-hidden font-sans text-white">
      {showWelcome && (
        <WelcomePage
          onClose={() => setShowWelcome(false)}
          onCreateNew={() => setShowNewDesignModal(true)}
          onViewAll={() => {
            setDashboardTab('templates');
            setShowDashboard(true);
            setShowWelcome(false);
          }}
          onSelectTemplate={(template) => {
            setDimensions(prev => ({
              ...prev,
              rows: template.dims.rows,
              cols: template.dims.cols,
              horizontalDividers: [],
              verticalDividers: [],
            }));
            setShowWelcome(false);
          }}
        />
      )}
      {showDashboard && (
        <Dashboard
          initialTab={dashboardTab}
          designHistory={designHistory}
          currentProject={projectName ? {
            id: 'current',
            name: projectName,
            lastEdit: 'Just now',
            status: 'Draft',
            isCurrent: true
          } : null}
          onLogout={() => {
            setShowDashboard(false);
            setShowWelcome(true);
          }}
          onDeleteDesign={handleDeleteDesign}
          onEditDesign={handleEditDesign}
          onEditProject={() => setShowDashboard(false)}
          onSelectTemplate={(template) => {
            setDimensions(prev => ({
              ...prev,
              rows: template.dims.rows,
              cols: template.dims.cols,
              horizontalDividers: [],
              verticalDividers: [],
            }));
            setPlacedModules([]);
            setShowDashboard(false);
          }}
        />
      )}
      {showNewDesignModal && (
        <NewDesignModal
          onClose={() => setShowNewDesignModal(false)}
          onCreate={(title) => {
            setProjectName(title);
            // Reset to default tray
            setDimensions({
              width: 1000,
              depth: 600,
              height: 100,
              rows: 2,
              cols: 3,
              horizontalDividers: [300],
              verticalDividers: [333, 666],
            });
            // Clear placed modules for new design
            setPlacedModules([]);
            setShowNewDesignModal(false);
            setShowOverview(false); // Ensure sidebar is visible for adjustments
            setShowWelcome(false);
          }}
        />
      )}
      <TopBar
        onLogoClick={() => {
          if (showDashboard) setShowDashboard(false);
          setShowWelcome(true);
        }}
        onOpenTab={(tab) => {
          setDashboardTab(tab);
          setShowDashboard(true);
          setShowWelcome(false);
        }}
        onLogout={() => {
          setShowDashboard(false);
          setShowWelcome(true);
        }}
      />

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
              showModuleSelector={showModuleSelector}
              setShowModuleSelector={setShowModuleSelector}
              finish={finish}
              setFinish={setFinish}
            />
          )}
        </div>

        {showModuleSelector && (
          <ModuleSelector
            onClose={() => setShowModuleSelector(false)}
            onSelect={(mod) => {
              console.log('Selected module:', mod);
              setShowModuleSelector(false);
            }}
            onDragStart={handleDragStart}
          />
        )}

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
                minPolarAngle={viewMode === '3d' ? 0 : 0}
                maxPolarAngle={viewMode === '3d' ? Math.PI / 1.5 : 0}
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
                  placedModules={placedModules}
                  finish={finish}
                />

                {/* 3D Drop Handler for accurate cell detection */}
                <TrayDropHandler
                  dimensions={dimensions}
                  cells={cells}
                  placedModules={placedModules}
                  draggedModule={draggedModule}
                  onDrop={handleCellDrop}
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

          <CanvasControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            onNewDesign={() => setShowNewDesignModal(true)}
            isSaving={isSaving}
          />
        </main>
      </div>
    </div>
  );
}

export default App;



