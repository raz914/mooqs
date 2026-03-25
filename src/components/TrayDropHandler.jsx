import React, { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';

/**
 * TrayDropHandler - 3D component that handles module drops using raycasting
 * This sits inside the Canvas and provides accurate cell detection
 */
const TrayDropHandler = ({
    dimensions,
    cells,
    placedModules,
    draggedModule,
    onDrop,
    onDragEnd
}) => {
    const { camera, raycaster, gl } = useThree();
    const planeRef = useRef();
    const [hoveredCell, setHoveredCell] = useState(null);

    const trayW = dimensions.width / 100;
    const trayD = dimensions.depth / 100;
    const h = dimensions.height / 100;
    const overlayLift = 0.03;

    // Handle mouse move to detect hovered cell
    useEffect(() => {
        if (!draggedModule) {
            setHoveredCell(null);
            return;
        }

        const getCellFromClientPoint = (clientX, clientY) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera({ x, y }, camera);

            if (planeRef.current) {
                const intersects = raycaster.intersectObject(planeRef.current);
                if (intersects.length > 0) {
                    const point = intersects[0].point;

                    // Convert 3D point to cell coordinates
                    // Point is in scene units, tray is centered at origin
                    const absX = (point.x + trayW / 2) * 100; // Convert to mm from left edge
                    const absZ = (trayD / 2 - point.z) * 100; // Convert to mm from front edge

                    // Find which cell
                    return cells.find(c =>
                        absX >= c.left && absX < c.right &&
                        absZ >= c.front && absZ < c.back
                    );
                }
            }
            return null;
        };

        const handleMove = (clientX, clientY) => {
            const cell = getCellFromClientPoint(clientX, clientY);
            setHoveredCell(cell || null);
        };

        const handleMouseMove = (e) => {
            handleMove(e.clientX, e.clientY);
        };

        const handleDragOver = (e) => {
            e.preventDefault(); // Required so drop events fire on canvas
            handleMove(e.clientX, e.clientY);
        };

        const finishDrag = (cell) => {
            if (cell && draggedModule && onDrop) {
                onDrop(draggedModule, cell);
            }
            if (onDragEnd) onDragEnd();
            setHoveredCell(null);
        };

        const handleMouseUp = (e) => {
            finishDrag(getCellFromClientPoint(e.clientX, e.clientY) || hoveredCell);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            finishDrag(getCellFromClientPoint(e.clientX, e.clientY) || hoveredCell);
        };

        const handleDragEnd = () => {
            if (onDragEnd) onDragEnd();
            setHoveredCell(null);
        };

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('mouseup', handleMouseUp);
        gl.domElement.addEventListener('dragover', handleDragOver);
        gl.domElement.addEventListener('drop', handleDrop);
        window.addEventListener('dragend', handleDragEnd);

        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('mouseup', handleMouseUp);
            gl.domElement.removeEventListener('dragover', handleDragOver);
            gl.domElement.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragend', handleDragEnd);
        };
    }, [draggedModule, camera, raycaster, gl, cells, trayW, trayD, hoveredCell, onDrop, onDragEnd]);

    if (!draggedModule) return null;

    return (
        <group position={[0, h / 2 + overlayLift, 0]}>
            {/* Invisible plane for raycasting */}
            <Plane
                ref={planeRef}
                args={[trayW, trayD]}
                rotation={[-Math.PI / 2, 0, 0]}
                visible={false}
            />

            {/* Visual cell highlights */}
            {cells.map((cell) => {
                const cellW = cell.width / 100;
                const cellD = cell.depth / 100;
                const cellX = ((cell.left + cell.right) / 2 - dimensions.width / 2) / 100;
                const cellZ = (dimensions.depth / 2 - (cell.front + cell.back) / 2) / 100;

                const isHovered = hoveredCell?.key === cell.key;
                const isOccupied = placedModules.some(m => m.cellKey === cell.key);

                return (
                    <group key={cell.key} position={[cellX, 0, cellZ]}>
                        {/* Cell highlight */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
                            <planeGeometry args={[cellW - 0.02, cellD - 0.02]} />
                            <meshBasicMaterial
                                color={isOccupied ? '#22c55e' : (isHovered ? '#ffffff' : '#888888')}
                                transparent
                                opacity={isHovered ? 0.4 : 0.1}
                                side={THREE.DoubleSide}
                                depthWrite={false}
                                polygonOffset
                                polygonOffsetFactor={-1}
                                polygonOffsetUnits={-1}
                            />
                        </mesh>

                        {/* Cell border */}
                        <lineSegments
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, 0.002, 0]}
                            renderOrder={11}
                        >
                            <edgesGeometry args={[new THREE.PlaneGeometry(cellW, cellD)]} />
                            <lineBasicMaterial
                                color={isHovered ? '#ffffff' : '#666666'}
                                transparent
                                opacity={0.5}
                                depthTest={false}
                                depthWrite={false}
                            />
                        </lineSegments>
                    </group>
                );
            })}

            {/* Ghost module preview */}
            {hoveredCell && draggedModule && !placedModules.some(m => m.cellKey === hoveredCell.key) && (
                <Box
                    args={[
                        draggedModule.width / 100,
                        draggedModule.height / 100,
                        draggedModule.depth / 100
                    ]}
                    position={[
                        ((hoveredCell.left + hoveredCell.right) / 2 - dimensions.width / 2) / 100,
                        draggedModule.height / 200,
                        (dimensions.depth / 2 - (hoveredCell.front + hoveredCell.back) / 2) / 100
                    ]}
                >
                    <meshStandardMaterial
                        color={draggedModule.color}
                        transparent
                        opacity={0.5}
                    />
                </Box>
            )}
        </group>
    );
};

export default TrayDropHandler;
