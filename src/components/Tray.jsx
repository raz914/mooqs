import React from 'react';
import { Box } from '@react-three/drei';

const Tray = ({ width, depth, height, horizontalDividers = [], verticalDividers = [], color = '#7E7E7E' }) => {
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
      {/* Internal Dividers - Horizontal (Varies along Z) */}
      {horizontalDividers.map((pos, i) => {
        // pos is in mm. Convert to scene units (/100).
        // Assuming pos is distance from the "back" (-d/2) for now to match previous logic logic structure
        // If "From Front", we might need to invert: z = d/2 - (pos/100)
        // Let's assume input is "from Front" (positive Z) implies starting at d/2 and going back.
        // But let's check standard UI sliders. Usually 0 is left/top.
        // Let's try: zPos = d/2 - (pos / 100). 
        // If pos=50mm, it's near the front.

        const zPos = d / 2 - (pos / 100);
        return (
          <Box key={`h-div-${i}`} args={[w - thickness * 2, h * 0.8, thickness]} position={[0, -h * 0.1, zPos]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}

      {/* Internal Dividers - Vertical */}
      {/* Internal Dividers - Vertical (Varies along X) */}
      {verticalDividers.map((pos, i) => {
        // vertical dividers: positions from left (-w/2).
        // xPos = -w/2 + (pos / 100).
        const xPos = -w / 2 + (pos / 100);
        return (
          <Box key={`v-div-${i}`} args={[thickness, h * 0.8, d - thickness * 2]} position={[xPos, -h * 0.1, 0]}>
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
          </Box>
        );
      })}
    </group>
  );
};

export default Tray;
