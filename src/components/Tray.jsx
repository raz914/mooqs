import React, { useMemo } from 'react';
import { Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Tray = ({ width, depth, height, horizontalDividers = [], verticalDividers = [], color = '#7E7E7E', placedModules = [], finish = 'leather' }) => {
  // Convert mm to meters (Three.js units) - for better scene scale we divide by 100
  const w = width / 100;
  const d = depth / 100;
  const h = height / 100;
  const thickness = 0.05; // 5mm relative thickness

  // Teaching: useTexture loads images as Three.js Texture objects.
  // We load several 'maps' to define different properties of the velvet material.
  const velvetMaps = useTexture({
    map: '/texture/Fabric039_1K-JPG_Color.jpg',
    normalMap: '/texture/Fabric039_1K-JPG_NormalGL.jpg',
    roughnessMap: '/texture/Fabric039_1K-JPG_Roughness.jpg',
    aoMap: '/texture/Fabric039_1K-JPG_AmbientOcclusion.jpg',
  });

  // Teaching: We need to tell Three.js how to tile the texture if the object is larger than the image.
  // We use RepeatWrapping and set a 'repeat' value based on the tray size.
  useMemo(() => {
    Object.values(velvetMaps).forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(w * 2, d * 2); // Adjust tiling density
    });
  }, [velvetMaps, w, d]);

  // Teaching: For Leather, we don't have a texture yet, so we use MeshPhysicalMaterial.
  // This allows us to add a 'clearcoat' layer, making it look like polished leather.
  const renderMaterial = (isInternal = false) => {
    if (finish === 'velvet' && isInternal) {
      return (
        <meshStandardMaterial
          {...velvetMaps}
          color={color} // Mix the texture with the selected color
          roughness={1}
        />
      );
    }

    // Leather-look material using high-end properties
    return (
      <meshPhysicalMaterial
        color={color}
        roughness={0.7}
        metalness={0.1}
        clearcoat={0.3} // Adds a shiny protective layer
        clearcoatRoughness={0.2}
      />
    );
  };

  return (
    <group>
      {/* Base */}
      <Box args={[w, thickness, d]} position={[0, -h / 2 + thickness / 2, 0]}>
        {renderMaterial(true)}
      </Box>

      {/* Side Walls - Front / Back */}
      <Box args={[w, h, thickness]} position={[0, 0, d / 2 - thickness / 2]}>
        {renderMaterial(false)}
      </Box>
      <Box args={[w, h, thickness]} position={[0, 0, -d / 2 + thickness / 2]}>
        {renderMaterial(false)}
      </Box>

      {/* Side Walls - Left / Right */}
      <Box args={[thickness, h, d - thickness * 2]} position={[w / 2 - thickness / 2, 0, 0]}>
        {renderMaterial(false)}
      </Box>
      <Box args={[thickness, h, d - thickness * 2]} position={[-w / 2 + thickness / 2, 0, 0]}>
        {renderMaterial(false)}
      </Box>

      {/* Internal Dividers - Horizontal */}
      {horizontalDividers.map((div, i) => {
        const isObject = typeof div === 'object';
        const pos = isObject ? div.pos : div;
        const start = isObject ? (div.start || 0) : 0;
        const end = isObject ? (div.end || width) : width;

        const zPos = d / 2 - (pos / 100);
        const divLength = (end - start) / 100;
        const xOffset = ((start + end) / 2 - width / 2) / 100;

        return (
          <Box
            key={`h-div-${i}`}
            args={[divLength, h - thickness, thickness]}
            position={[xOffset, thickness / 2, zPos]}
          >
            {renderMaterial(true)}
          </Box>
        );
      })}

      {/* Internal Dividers - Vertical */}
      {verticalDividers.map((div, i) => {
        const isObject = typeof div === 'object';
        const pos = isObject ? div.pos : div;
        const start = isObject ? (div.start || 0) : 0;
        const end = isObject ? (div.end || depth) : depth;

        const xPos = -w / 2 + (pos / 100);
        const divLength = (end - start) / 100;
        const zOffset = (depth / 2 - (start + end) / 2) / 100;

        return (
          <Box
            key={`v-div-${i}`}
            args={[thickness, h - thickness, divLength]}
            position={[xPos, thickness / 2, zOffset]}
          >
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


