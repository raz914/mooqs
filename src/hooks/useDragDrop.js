import { useState, useCallback, useEffect } from 'react';

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

const getCellScenePosition = (cell, trayW, trayD) => ([
    ((cell.left + cell.right) / 2 - trayW / 2) / 100,
    0,
    (trayD / 2 - (cell.front + cell.back) / 2) / 100,
]);

const getModuleAnchorRect = (module, trayW, trayD) => {
    if (
        Number.isFinite(module.cellLeft) &&
        Number.isFinite(module.cellRight) &&
        Number.isFinite(module.cellFront) &&
        Number.isFinite(module.cellBack)
    ) {
        return {
            left: module.cellLeft,
            right: module.cellRight,
            front: module.cellFront,
            back: module.cellBack,
        };
    }

    if (
        !Array.isArray(module.position) ||
        module.position.length < 3 ||
        !Number.isFinite(trayW) ||
        !Number.isFinite(trayD)
    ) {
        return null;
    }

    const centerX = Number(module.position[0]) * 100 + trayW / 2;
    const centerZ = trayD / 2 - Number(module.position[2]) * 100;
    const width = Number(module.cellWidth ?? module.width);
    const depth = Number(module.cellDepth ?? module.depth);

    if (!Number.isFinite(centerX) || !Number.isFinite(centerZ) || !Number.isFinite(width) || !Number.isFinite(depth)) {
        return null;
    }

    return {
        left: centerX - width / 2,
        right: centerX + width / 2,
        front: centerZ - depth / 2,
        back: centerZ + depth / 2,
    };
};

const getRectOverlapArea = (rectA, rectB) => {
    if (!rectA || !rectB) return 0;

    const overlapWidth = Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
    const overlapDepth = Math.min(rectA.back, rectB.back) - Math.max(rectA.front, rectB.front);

    if (overlapWidth <= EPSILON || overlapDepth <= EPSILON) return 0;
    return overlapWidth * overlapDepth;
};

const getBoundaryMatchCount = (rect, cell) => {
    if (!rect || !cell) return 0;

    let count = 0;
    if (Math.abs(rect.left - cell.left) <= EPSILON) count += 1;
    if (Math.abs(rect.right - cell.right) <= EPSILON) count += 1;
    if (Math.abs(rect.front - cell.front) <= EPSILON) count += 1;
    if (Math.abs(rect.back - cell.back) <= EPSILON) count += 1;
    return count;
};

const findBestCellForModule = (module, cells, trayW, trayD) => {
    if (!cells.length) return null;

    const matchingCell = cells.find((cell) => cell.key === module.cellKey);
    if (matchingCell) return matchingCell;

    const anchorRect = getModuleAnchorRect(module, trayW, trayD);
    if (!anchorRect) {
        if (Number.isInteger(module.cellRow) && Number.isInteger(module.cellCol)) {
            const matchingGridCell = cells.find(
                (cell) => cell.row === module.cellRow && cell.col === module.cellCol
            );

            if (matchingGridCell) return matchingGridCell;
        }

        return cells[0];
    }

    const anchorCenterX = (anchorRect.left + anchorRect.right) / 2;
    const anchorCenterZ = (anchorRect.front + anchorRect.back) / 2;

    let bestCell = null;
    let bestBoundaryMatches = -1;
    let bestOverlap = 0;

    for (const cell of cells) {
        const boundaryMatches = getBoundaryMatchCount(anchorRect, cell);
        const overlap = getRectOverlapArea(anchorRect, cell);

        if (boundaryMatches > bestBoundaryMatches) {
            bestBoundaryMatches = boundaryMatches;
            bestOverlap = overlap;
            bestCell = cell;
            continue;
        }

        if (boundaryMatches === bestBoundaryMatches && overlap > bestOverlap + EPSILON) {
            bestOverlap = overlap;
            bestCell = cell;
            continue;
        }

        if (boundaryMatches === bestBoundaryMatches && Math.abs(overlap - bestOverlap) <= EPSILON) {
            const centerInside =
                anchorCenterX >= cell.left - EPSILON &&
                anchorCenterX <= cell.right + EPSILON &&
                anchorCenterZ >= cell.front - EPSILON &&
                anchorCenterZ <= cell.back + EPSILON;

            if (centerInside) {
                bestCell = cell;
            }
        }
    }

    if (bestCell) return bestCell;

    return cells.find((cell) =>
        anchorCenterX >= cell.left - EPSILON &&
        anchorCenterX <= cell.right + EPSILON &&
        anchorCenterZ >= cell.front - EPSILON &&
        anchorCenterZ <= cell.back + EPSILON
    ) || cells[0];
};

const attachModuleToCell = (module, cell, trayW, trayD) => ({
    ...module,
    cellKey: cell.key,
    cellRow: Number.isInteger(module.cellRow) ? module.cellRow : cell.row,
    cellCol: Number.isInteger(module.cellCol) ? module.cellCol : cell.col,
    cellWidth: cell.width,
    cellDepth: cell.depth,
    cellLeft: cell.left,
    cellRight: cell.right,
    cellFront: cell.front,
    cellBack: cell.back,
    position: getCellScenePosition(cell, trayW, trayD),
});

const modulePlacementMatchesCell = (module, cell, trayW, trayD) => {
    const nextPosition = getCellScenePosition(cell, trayW, trayD);

    return (
        module.cellKey === cell.key &&
        Math.abs((module.cellWidth ?? 0) - cell.width) <= EPSILON &&
        Math.abs((module.cellDepth ?? 0) - cell.depth) <= EPSILON &&
        Math.abs((module.cellLeft ?? 0) - cell.left) <= EPSILON &&
        Math.abs((module.cellRight ?? 0) - cell.right) <= EPSILON &&
        Math.abs((module.cellFront ?? 0) - cell.front) <= EPSILON &&
        Math.abs((module.cellBack ?? 0) - cell.back) <= EPSILON &&
        Array.isArray(module.position) &&
        module.position.length >= 3 &&
        Math.abs(module.position[0] - nextPosition[0]) <= EPSILON &&
        Math.abs(module.position[1] - nextPosition[1]) <= EPSILON &&
        Math.abs(module.position[2] - nextPosition[2]) <= EPSILON
    );
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

    useEffect(() => {
        const trayW = dimensions.width;
        const trayD = dimensions.depth;
        const cells = getCells();

        if (!cells.length || !trayW || !trayD) return;

        setPlacedModules((prev) => {
            let hasChanges = false;

            const next = prev.map((module) => {
                const targetCell = findBestCellForModule(module, cells, trayW, trayD);
                if (!targetCell) return module;

                if (modulePlacementMatchesCell(module, targetCell, trayW, trayD)) {
                    return module;
                }

                hasChanges = true;
                return attachModuleToCell(module, targetCell, trayW, trayD);
            });

            return hasChanges ? next : prev;
        });
    }, [dimensions.width, dimensions.depth, getCells]);

    // Place module in cell
    const placeModuleInCell = useCallback((module, cell) => {
        const trayW = dimensions.width;
        const trayD = dimensions.depth;

        const newModule = attachModuleToCell({
            ...module,
            instanceId: Date.now(),
        }, cell, trayW, trayD);

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
