import React, { useMemo } from 'react';
import { Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Tray = ({ width, depth, height, horizontalDividers = [], verticalDividers = [], color = '#7E7E7E', placedModules = [], finish = 'leather' }) => {
  // Fix: The user changed texture files. Using existing one to avoid crash.
  const velvetMaps = useTexture({
    map: '/texture/velvet.jpg',
  });

  const w = width / 100;
  const d = depth / 100;
  const h = height / 100;
  const thickness = 0.05;

  useMemo(() => {
    Object.values(velvetMaps).forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(w * 2, d * 2);
    });
  }, [velvetMaps, w, d]);

  const renderMaterial = (isInternal = false) => {
    if (finish === 'velvet' && isInternal) {
      return (
        <meshStandardMaterial
          {...velvetMaps}
          color={color}
          roughness={1}
        />
      );
    }

    return (
      <meshPhysicalMaterial
        color={color}
        roughness={0.7}
        metalness={0.1}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
      />
    );
  };

  // Convert dividers to standard format if they are just numbers
  const hDivs = horizontalDividers.map(div => typeof div === 'number' ? { pos: div, start: 0, end: width } : div);
  const vDivs = (Array.isArray(verticalDividers) ? verticalDividers : []).map(div => typeof div === 'number' ? { pos: div, start: 0, end: depth } : div);

  return (
    <group>
      {/* Base */}
      <Box args={[w, thickness, d]} position={[0, -h / 2 + thickness / 2, 0]}>
        {renderMaterial(true)}
      </Box>

      {/* Side Walls */}
      <Box args={[w, h, thickness]} position={[0, 0, d / 2 - thickness / 2]}>
        {renderMaterial(false)}
      </Box>
      <Box args={[w, h, thickness]} position={[0, 0, -d / 2 + thickness / 2]}>
        {renderMaterial(false)}
      </Box>
      <Box args={[thickness, h, d - thickness * 2]} position={[w / 2 - thickness / 2, 0, 0]}>
        {renderMaterial(false)}
      </Box>
      <Box args={[thickness, h, d - thickness * 2]} position={[-w / 2 + thickness / 2, 0, 0]}>
        {renderMaterial(false)}
      </Box>

      {/* Internal Dividers - Horizontal (varies in Z, length in X) */}
      {hDivs.map((div, i) => {
        const zPos = d / 2 - (div.pos / 100);
        const divWidth = (div.end - div.start) / 100;
        const xPos = -w / 2 + (div.start + div.end) / 200;
        return (
          <Box key={`h-div-${i}`} args={[divWidth, h - thickness, thickness]} position={[xPos, thickness / 2, zPos]}>
            {renderMaterial(true)}
          </Box>
        );
      })}

      {/* Internal Dividers - Vertical (varies in X, length in Z) */}
      {vDivs.map((div, i) => {
        const xPos = -w / 2 + (div.pos / 100);
        const divDepth = (div.end - div.start) / 100;
        const zPos = d / 2 - (div.start + div.end) / 200;
        return (
          <Box key={`v-div-${i}`} args={[thickness, h - thickness, divDepth]} position={[xPos, thickness / 2, zPos]}>
            {renderMaterial(true)}
          </Box>
        );
      })}

      {/* Placed Modules */}
      {placedModules.map((mod) => {
        const modW = mod.width / 100;
        const modD = mod.depth / 100;
        const modH = mod.height / 100;
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


