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
    trayHeight
}) => {
    const { camera, raycaster, pointer, gl } = useThree();
    const planeRef = useRef();
    const [hoveredCell, setHoveredCell] = useState(null);

    const trayW = dimensions.width / 100;
    const trayD = dimensions.depth / 100;
    const h = dimensions.height / 100;

    // Handle mouse move to detect hovered cell
    useEffect(() => {
        if (!draggedModule) {
            setHoveredCell(null);
            return;
        }

        const handleMouseMove = (e) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera({ x, y }, camera);

            if (planeRef.current) {
                const intersects = raycaster.intersectObject(planeRef.current);
                if (intersects.length > 0) {
                    const point = intersects[0].point;

                    // Convert 3D point to cell coordinates
                    // Point is in scene units, tray is centered at origin
                    const absX = (point.x + trayW / 2) * 100; // Convert to mm from left edge
                    const absZ = (point.z + trayD / 2) * 100; // Convert to mm from front edge

                    // Find which cell
                    const cell = cells.find(c =>
                        absX >= c.left && absX < c.right &&
                        absZ >= c.front && absZ < c.back
                    );

                    setHoveredCell(cell || null);
                } else {
                    setHoveredCell(null);
                }
            }
        };

        const handleMouseUp = (e) => {
            if (hoveredCell && draggedModule && onDrop) {
                onDrop(draggedModule, hoveredCell);
            }
        };

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('mouseup', handleMouseUp);

        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggedModule, camera, raycaster, gl, cells, trayW, trayD, hoveredCell, onDrop]);

    if (!draggedModule) return null;

    return (
        <group position={[0, h / 2 + 0.01, 0]}>
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
                const cellZ = ((cell.front + cell.back) / 2 - dimensions.depth / 2) / 100;

                const isHovered = hoveredCell?.key === cell.key;
                const isOccupied = placedModules.some(m => m.cellKey === cell.key);

                return (
                    <group key={cell.key} position={[cellX, 0, cellZ]}>
                        {/* Cell highlight */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[cellW - 0.02, cellD - 0.02]} />
                            <meshBasicMaterial
                                color={isOccupied ? '#22c55e' : (isHovered ? '#ffffff' : '#888888')}
                                transparent
                                opacity={isHovered ? 0.4 : 0.1}
                                side={THREE.DoubleSide}
                            />
                        </mesh>

                        {/* Cell border */}
                        <lineSegments>
                            <edgesGeometry args={[new THREE.PlaneGeometry(cellW, cellD)]} />
                            <lineBasicMaterial
                                color={isHovered ? '#ffffff' : '#666666'}
                                transparent
                                opacity={0.5}
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
                        ((hoveredCell.front + hoveredCell.back) / 2 - dimensions.depth / 2) / 100
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
