import React from 'react';

/**
 * DropZone - A 2D overlay that shows cell grid and handles drop events
 */
const DropZone = ({
    dimensions,
    cells,
    placedModules,
    onDrop,
    onDragOver,
    visible = true
}) => {
    if (!visible) return null;

    const trayW = dimensions.width;
    const trayD = dimensions.depth;

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (onDragOver) onDragOver(e);
    };

    const handleDrop = (e, cell) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const moduleData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (onDrop) onDrop(moduleData, cell);
        } catch (err) {
            console.error('Drop error:', err);
        }
    };

    // Check if cell is occupied
    const isCellOccupied = (cellKey) => {
        return placedModules?.some(m => m.cellKey === cellKey);
    };

    return (
        <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ opacity: 0.8 }}
        >
            {/* Cell grid overlay */}
            <div
                className="absolute pointer-events-auto"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${Math.min(80, (trayW / trayD) * 50)}%`,
                    aspectRatio: `${trayW} / ${trayD}`,
                    display: 'grid',
                    gridTemplateColumns: cells
                        .filter((c, i, arr) => arr.findIndex(x => x.col === c.col) === i)
                        .map(c => `${c.width}fr`)
                        .join(' '),
                    gridTemplateRows: cells
                        .filter((c, i, arr) => arr.findIndex(x => x.row === c.row) === i)
                        .map(c => `${c.depth}fr`)
                        .join(' '),
                }}
            >
                {cells.map((cell) => {
                    const occupied = isCellOccupied(cell.key);
                    return (
                        <div
                            key={cell.key}
                            className={`
                border border-dashed transition-all duration-200
                ${occupied
                                    ? 'border-green-500/50 bg-green-500/10'
                                    : 'border-white/20 hover:border-white/50 hover:bg-white/5'
                                }
              `}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, cell)}
                            title={`Cell ${cell.row + 1}-${cell.col + 1} (${Math.round(cell.width)}x${Math.round(cell.depth)}mm)`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default DropZone;
