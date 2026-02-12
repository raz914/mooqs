import React from 'react';
import { Box } from '@react-three/drei';

const Tray = ({ width, depth, height, horizontalDividers = [], verticalDividers = [], color = '#7E7E7E', placedModules = [] }) => {
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

      {/* Internal Dividers - Horizontal (Varies along Z) */}
      {horizontalDividers.map((pos, i) => {
        const zPos = d / 2 - (pos / 100);
        return (
          <Box key={`h-div-${i}`} args={[w - thickness * 2, h * 0.8, thickness]} position={[0, -h * 0.1, zPos]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}

      {/* Internal Dividers - Vertical (Varies along X) */}
      {verticalDividers.map((pos, i) => {
        const xPos = -w / 2 + (pos / 100);
        return (
          <Box key={`v-div-${i}`} args={[thickness, h * 0.8, d - thickness * 2]} position={[xPos, -h * 0.1, 0]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}

      {/* Placed Modules */}
      {placedModules.map((mod) => {
        const modW = mod.width / 100;
        const modD = mod.depth / 100;
        const modH = mod.height / 100;
        // Position module so it sits on the base of the tray
        const yPos = -h / 2 + thickness + modH / 2;
        return (
          <Box
            key={mod.instanceId}
            args={[modW, modH, modD]}
            position={[mod.position[0], yPos, mod.position[2]]}
          >
            <meshStandardMaterial color={mod.color} roughness={0.5} metalness={0.3} />
          </Box>
        );
      })}
    </group>
  );
};

export default Tray;

