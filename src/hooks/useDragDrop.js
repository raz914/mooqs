import { useState, useCallback } from 'react';

const EPSILON = 1e-6;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeDividerSegments = (dividers = [], axisLimit, spanLimit) => {
    return dividers
        .map((div) => {
            if (typeof div === 'number') {
                return { pos: div, start: 0, end: spanLimit };
            }

            if (!div || typeof div !== 'object') return null;

            return {
                pos: Number(div.pos),
                start: div.start == null ? 0 : Number(div.start),
                end: div.end == null ? spanLimit : Number(div.end),
            };
        })
        .filter(Boolean)
        .map((seg) => {
            const start = clamp(Math.min(seg.start, seg.end), 0, spanLimit);
            const end = clamp(Math.max(seg.start, seg.end), 0, spanLimit);
            const pos = clamp(seg.pos, 0, axisLimit);
            return { pos, start, end };
        })
        .filter((seg) =>
            Number.isFinite(seg.pos) &&
            Number.isFinite(seg.start) &&
            Number.isFinite(seg.end) &&
            seg.pos > EPSILON &&
            seg.pos < axisLimit - EPSILON &&
            seg.end - seg.start > EPSILON
        )
        .sort((a, b) => (a.pos - b.pos) || (a.start - b.start) || (a.end - b.end));
};

const uniqueSortedBreakpoints = (values, min, max) => {
    const sorted = values
        .map((v) => clamp(Number(v), min, max))
        .filter((v) => Number.isFinite(v))
        .sort((a, b) => a - b);

    const unique = [];
    for (const value of sorted) {
        if (unique.length === 0 || Math.abs(value - unique[unique.length - 1]) > EPSILON) {
            unique.push(value);
        }
    }
    return unique;
};

const makeCellKey = (left, right, front, back) => {
    const f = (n) => Number.parseFloat(n.toFixed(3));
    return `cell-${f(front)}-${f(back)}-${f(left)}-${f(right)}`;
};

/**
 * Custom hook to manage drag and drop state for tray modules
 */
export const useDragDrop = ({ dimensions, onModulePlaced, initialPlacedModules = [] }) => {
    const [draggedModule, setDraggedModule] = useState(null);
    const [placedModules, setPlacedModules] = useState(initialPlacedModules);

    // Calculate cell grid based on dividers
    const getCells = useCallback(() => {
        const trayW = dimensions.width;
        const trayD = dimensions.depth;
        if (!trayW || !trayD) return [];

        const verticalSegments = normalizeDividerSegments(dimensions.verticalDividers || [], trayW, trayD);
        const horizontalSegments = normalizeDividerSegments(dimensions.horizontalDividers || [], trayD, trayW);

        const xBreaks = uniqueSortedBreakpoints([
            0,
            trayW,
            ...verticalSegments.map((seg) => seg.pos),
            ...horizontalSegments.flatMap((seg) => [seg.start, seg.end]),
        ], 0, trayW);

        const zBreaks = uniqueSortedBreakpoints([
            0,
            trayD,
            ...horizontalSegments.map((seg) => seg.pos),
            ...verticalSegments.flatMap((seg) => [seg.start, seg.end]),
        ], 0, trayD);

        const blocksVerticalEdge = (xBoundary, front, back) => (
            verticalSegments.some((seg) =>
                Math.abs(seg.pos - xBoundary) <= EPSILON &&
                seg.start <= front + EPSILON &&
                seg.end >= back - EPSILON
            )
        );

        const blocksHorizontalEdge = (zBoundary, left, right) => (
            horizontalSegments.some((seg) =>
                Math.abs(seg.pos - zBoundary) <= EPSILON &&
                seg.start <= left + EPSILON &&
                seg.end >= right - EPSILON
            )
        );

        const microCells = [];
        const cellByGrid = new Map();

        for (let xIndex = 0; xIndex < xBreaks.length - 1; xIndex++) {
            const left = xBreaks[xIndex];
            const right = xBreaks[xIndex + 1];
            if (right - left <= EPSILON) continue;

            for (let zIndex = 0; zIndex < zBreaks.length - 1; zIndex++) {
                const front = zBreaks[zIndex];
                const back = zBreaks[zIndex + 1];
                if (back - front <= EPSILON) continue;

                const micro = { xIndex, zIndex, left, right, front, back };
                const key = `${xIndex}:${zIndex}`;
                microCells.push(micro);
                cellByGrid.set(key, micro);
            }
        }

        const visited = new Set();
        const merged = [];

        const pushNeighbor = (queue, xIndex, zIndex) => {
            const key = `${xIndex}:${zIndex}`;
            if (visited.has(key)) return;
            const neighbor = cellByGrid.get(key);
            if (!neighbor) return;
            queue.push(neighbor);
        };

        for (const start of microCells) {
            const startKey = `${start.xIndex}:${start.zIndex}`;
            if (visited.has(startKey)) continue;

            const queue = [start];
            let minLeft = Infinity;
            let maxRight = -Infinity;
            let minFront = Infinity;
            let maxBack = -Infinity;

            while (queue.length > 0) {
                const current = queue.pop();
                const currentKey = `${current.xIndex}:${current.zIndex}`;
                if (visited.has(currentKey)) continue;
                visited.add(currentKey);

                minLeft = Math.min(minLeft, current.left);
                maxRight = Math.max(maxRight, current.right);
                minFront = Math.min(minFront, current.front);
                maxBack = Math.max(maxBack, current.back);

                if (
                    cellByGrid.has(`${current.xIndex + 1}:${current.zIndex}`) &&
                    !blocksVerticalEdge(current.right, current.front, current.back)
                ) {
                    pushNeighbor(queue, current.xIndex + 1, current.zIndex);
                }

                if (
                    cellByGrid.has(`${current.xIndex - 1}:${current.zIndex}`) &&
                    !blocksVerticalEdge(current.left, current.front, current.back)
                ) {
                    pushNeighbor(queue, current.xIndex - 1, current.zIndex);
                }

                if (
                    cellByGrid.has(`${current.xIndex}:${current.zIndex + 1}`) &&
                    !blocksHorizontalEdge(current.back, current.left, current.right)
                ) {
                    pushNeighbor(queue, current.xIndex, current.zIndex + 1);
                }

                if (
                    cellByGrid.has(`${current.xIndex}:${current.zIndex - 1}`) &&
                    !blocksHorizontalEdge(current.front, current.left, current.right)
                ) {
                    pushNeighbor(queue, current.xIndex, current.zIndex - 1);
                }
            }

            if (
                Number.isFinite(minLeft) &&
                Number.isFinite(maxRight) &&
                Number.isFinite(minFront) &&
                Number.isFinite(maxBack) &&
                maxRight - minLeft > EPSILON &&
                maxBack - minFront > EPSILON
            ) {
                merged.push({
                    left: minLeft,
                    right: maxRight,
                    front: minFront,
                    back: maxBack,
                    width: maxRight - minLeft,
                    depth: maxBack - minFront,
                });
            }
        }

        const sorted = merged.sort((a, b) => {
            if (Math.abs(a.front - b.front) > EPSILON) return a.front - b.front;
            if (Math.abs(a.left - b.left) > EPSILON) return a.left - b.left;
            return a.width - b.width;
        });

        const rowMap = new Map();
        const rowColCounter = new Map();

        return sorted.map((cell) => {
            const rowKey = Number.parseFloat(cell.front.toFixed(3));
            if (!rowMap.has(rowKey)) rowMap.set(rowKey, rowMap.size);
            const row = rowMap.get(rowKey);
            const col = rowColCounter.get(row) || 0;
            rowColCounter.set(row, col + 1);

            return {
                key: makeCellKey(cell.left, cell.right, cell.front, cell.back),
                row,
                col,
                ...cell,
            };
        });
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
            cellWidth: cell.width,
            cellDepth: cell.depth,
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
