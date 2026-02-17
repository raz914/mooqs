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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('templates');
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState(savedConfig.projectName || '');
  const [designHistory, setDesignHistory] = useState(() => {
    const savedHistory = localStorage.getItem('mooqs_design_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const colors = [
    { name: 'B01', hex: '#976e52', image: '/colors/B01.png' },
    { name: 'B02', hex: '#48433f', image: '/colors/B02.png' },
    { name: 'B03', hex: '#7e7066', image: '/colors/B03.png' },
    { name: 'B04', hex: '#6f423d', image: '/colors/B04.png' },
    { name: 'B05', hex: '#422f2b', image: '/colors/B05.png' },
    { name: 'B06', hex: '#8d8681', image: '/colors/B06.png' },
    { name: 'B07', hex: '#2b333f', image: '/colors/B07.png' },
    { name: 'B08', hex: '#87888b', image: '/colors/B08.png' },
    { name: 'B09', hex: '#7f6a59', image: '/colors/B09.png' },
    { name: 'B10', hex: '#9d7a73', image: '/colors/B10.png' }
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

  const handleSaveDesign = () => {
    if (!projectName) {
      alert('Please name your project before saving.');
      return;
    }

    // Check if a design with the same name already exists
    if (designHistory.some(d => d.name.toLowerCase() === projectName.toLowerCase())) {
      alert(`A design named "${projectName}" already exists. Please use a unique name.`);
      return;
    }

    const newDesign = {
      id: `#${Math.floor(Math.random() * 90000) + 10000}`,
      name: projectName,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
      lastEdit: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Complete',
      amount: '$' + (Math.floor(Math.random() * 500) + 300) + '.00', // Mock price for now
      config: {
        dimensions,
        finish,
        selectedColor,
        placedModules
      }
    };

    setDesignHistory(prev => [newDesign, ...prev]);
    alert('Design saved to history!');
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
            const dims = { ...template.dims };

            setDimensions(prev => ({
              ...prev,
              ...dims,
              horizontalDividers: dims.horizontalDividers ?? [],
              verticalDividers: dims.verticalDividers ?? [],
            }));
            if (template.finish) setFinish(template.finish);
            setPlacedModules([]);
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
            const dims = { ...template.dims };

            // Auto-generate dividers if not provided but rows/cols are present in template
            if (dims.rows && (!dims.horizontalDividers || dims.horizontalDividers.length === 0)) {
              if (dims.rows > 1) {
                const depth = dims.depth || dimensions.depth;
                const spacing = depth / dims.rows;
                dims.horizontalDividers = Array.from({ length: dims.rows - 1 }, (_, i) => Math.round((i + 1) * spacing));
              } else {
                dims.horizontalDividers = [];
              }
            }

            if (dims.cols && (!dims.verticalDividers || dims.verticalDividers.length === 0)) {
              if (dims.cols > 1) {
                const width = dims.width || dimensions.width;
                const spacing = width / dims.cols;
                dims.verticalDividers = Array.from({ length: dims.cols - 1 }, (_, i) => Math.round((i + 1) * spacing));
              } else {
                dims.verticalDividers = [];
              }
            }

            setDimensions(prev => ({
              ...prev,
              ...dims,
              horizontalDividers: dims.horizontalDividers ?? prev.horizontalDividers,
              verticalDividers: dims.verticalDividers ?? prev.verticalDividers,
            }));
            if (template.finish) setFinish(template.finish);
            setPlacedModules([]);
            setShowDashboard(false);
          }}
        />
      )}
      {showNewDesignModal && (
        <NewDesignModal
          onClose={() => setShowNewDesignModal(false)}
          onCreate={(title) => {
            // Check for duplicate name
            if (designHistory.some(d => d.name.toLowerCase() === title.toLowerCase())) {
              alert(`A design named "${title}" already exists. Please use a unique name.`);
              return;
            }

            setProjectName(title);
            // Reset to default tray
            const defaultDims = {
              width: 1000,
              depth: 600,
              height: 100,
              rows: 2,
              cols: 3,
              horizontalDividers: [300],
              verticalDividers: [333, 666],
            };
            setDimensions(defaultDims);
            // Clear placed modules for new design
            setPlacedModules([]);

            // Save to design history immediately as Draft
            const newDesign = {
              id: `#${Math.floor(Math.random() * 90000) + 10000}`,
              name: title,
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
              lastEdit: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              status: 'Draft',
              amount: '-',
              config: {
                dimensions: defaultDims,
                finish,
                selectedColor,
                placedModules: []
              }
            };
            setDesignHistory(prev => [newDesign, ...prev]);

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

              <ambientLight intensity={1} />
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



