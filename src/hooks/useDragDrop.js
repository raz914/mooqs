import { useState, useCallback } from 'react';

/**
 * Custom hook to manage drag and drop state for tray modules
 */
export const useDragDrop = ({ dimensions, onModulePlaced }) => {
    const [draggedModule, setDraggedModule] = useState(null);
    const [placedModules, setPlacedModules] = useState([]);

    // Calculate cell grid based on dividers
    const getCells = useCallback(() => {
        const trayW = dimensions.width;
        const trayD = dimensions.depth;

        const vDividers = [0, ...(dimensions.verticalDividers || []).sort((a, b) => a - b), trayW];
        const hDividers = [0, ...(dimensions.horizontalDividers || []).sort((a, b) => a - b), trayD];

        const cells = [];
        for (let row = 0; row < hDividers.length - 1; row++) {
            for (let col = 0; col < vDividers.length - 1; col++) {
                cells.push({
                    key: `${row}-${col}`,
                    row,
                    col,
                    left: vDividers[col],
                    right: vDividers[col + 1],
                    front: hDividers[row],
                    back: hDividers[row + 1],
                    width: vDividers[col + 1] - vDividers[col],
                    depth: hDividers[row + 1] - hDividers[row],
                });
            }
        }
        return cells;
    }, [dimensions]);

    // Find cell at given position (in mm from top-left of tray)
    const findCellAtPosition = useCallback((absX, absZ) => {
        const cells = getCells();
        return cells.find(cell =>
            absX >= cell.left && absX < cell.right &&
            absZ >= cell.front && absZ < cell.back
        );
    }, [getCells]);

    // Check if module fits in cell
    const moduleFitsInCell = useCallback((module, cell) => {
        return module.width <= cell.width && module.depth <= cell.depth;
    }, []);

    // Check if cell is occupied
    const isCellOccupied = useCallback((cellKey) => {
        return placedModules.some(m => m.cellKey === cellKey);
    }, [placedModules]);

    // Place module in cell
    const placeModuleInCell = useCallback((module, cell) => {
        const trayW = dimensions.width;
        const trayD = dimensions.depth;

        // Calculate center position in scene units
        const cellCenterX = ((cell.left + cell.right) / 2 - trayW / 2) / 100;
        const cellCenterZ = ((cell.front + cell.back) / 2 - trayD / 2) / 100;

        const newModule = {
            ...module,
            instanceId: Date.now(),
            cellKey: cell.key,
            position: [cellCenterX, 0, cellCenterZ]
        };

        setPlacedModules(prev => [...prev, newModule]);
        if (onModulePlaced) onModulePlaced(newModule);

        return newModule;
    }, [dimensions, onModulePlaced]);

    // Remove module from tray
    const removeModule = useCallback((instanceId) => {
        setPlacedModules(prev => prev.filter(m => m.instanceId !== instanceId));
    }, []);

    // Handle drag start
    const handleDragStart = useCallback((module) => {
        setDraggedModule(module);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        setDraggedModule(null);
    }, []);

    return {
        draggedModule,
        placedModules,
        getCells,
        findCellAtPosition,
        moduleFitsInCell,
        isCellOccupied,
        placeModuleInCell,
        removeModule,
        handleDragStart,
        handleDragEnd,
        setPlacedModules,
    };
};

export default useDragDrop;
