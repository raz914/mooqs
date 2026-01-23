import React from 'react';
import { Box } from '@react-three/drei';

const Tray = ({ width, depth, height, rows = 1, cols = 1, color = '#7E7E7E' }) => {
  // Convert mm to meters (Three.js units) - for better scene scale we divide by 100
  const w = width / 100;
  const d = depth / 100;
  const h = height / 100;
  const thickness = 0.05; // 5mm relative thickness if units are meters/100

  return (
    <group>
      {/* Base */}
      <Box args={[w, thickness, d]} position={[0, -h / 2 + thickness / 2, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </Box>

      {/* Side Walls - Front / Back */}
      <Box args={[w, h, thickness]} position={[0, 0, d / 2 - thickness / 2]}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </Box>
      <Box args={[w, h, thickness]} position={[0, 0, -d / 2 + thickness / 2]}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </Box>

      {/* Side Walls - Left / Right */}
      <Box args={[thickness, h, d - thickness * 2]} position={[w / 2 - thickness / 2, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </Box>
      <Box args={[thickness, h, d - thickness * 2]} position={[-w / 2 + thickness / 2, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </Box>

      {/* Internal Dividers - Horizontal */}
      {Array.from({ length: rows - 1 }).map((_, i) => {
        const spacing = d / rows;
        const zPos = -d / 2 + spacing * (i + 1);
        return (
          <Box key={`row-${i}`} args={[w - thickness * 2, h * 0.8, thickness]} position={[0, -h * 0.1, zPos]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}

      {/* Internal Dividers - Vertical */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const spacing = w / cols;
        const xPos = -w / 2 + spacing * (i + 1);
        return (
          <Box key={`col-${i}`} args={[thickness, h * 0.8, d - thickness * 2]} position={[xPos, -h * 0.1, 0]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}
    </group>
  );
};

export default Tray;
