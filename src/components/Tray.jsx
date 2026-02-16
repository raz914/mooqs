import React, { useEffect, useMemo } from 'react';
import { Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const TEXTURE_DENSITY = 1;

const TiledBox = ({
  args,
  position,
  map,
  materialType = 'physical',
  color = '#7E7E7E',
  roughness = 0.72,
  metalness = 0.08,
  clearcoat = 0.28,
  clearcoatRoughness = 0.32,
}) => {
  const [x, y, z] = args;

  // Clone and tile texture per face so each side uses correct UV scale.
  const faceTextures = useMemo(() => {
    if (!map) return [null, null, null, null, null, null];

    // Box face order: +X, -X, +Y, -Y, +Z, -Z
    const faceDims = [
      [z, y],
      [z, y],
      [x, z],
      [x, z],
      [x, y],
      [x, y],
    ];

    return faceDims.map(([u, v]) => {
      const tex = map.clone();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(Math.max(u * TEXTURE_DENSITY, 0.01), Math.max(v * TEXTURE_DENSITY, 0.01));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      return tex;
    });
  }, [map, x, y, z]);

  useEffect(() => {
    return () => {
      faceTextures.forEach((tex) => tex?.dispose());
    };
  }, [faceTextures]);

  return (
    <Box args={args} position={position}>
      {faceTextures.map((faceMap, i) => (
        materialType === 'standard' ? (
          <meshStandardMaterial
            key={`std-${i}`}
            attach={`material-${i}`}
            map={faceMap}
            color={color}
            roughness={roughness}
            metalness={metalness}
          />
        ) : (
          <meshPhysicalMaterial
            key={`phy-${i}`}
            attach={`material-${i}`}
            map={faceMap}
            color={color}
            roughness={roughness}
            metalness={metalness}
            clearcoat={clearcoat}
            clearcoatRoughness={clearcoatRoughness}
          />
        )
      ))}
    </Box>
  );
};

const Tray = ({
  width,
  depth,
  height,
  horizontalDividers = [],
  verticalDividers = [],
  color = '#7E7E7E',
  placedModules = [],
  finish = 'leather',
}) => {
  const w = width / 100;
  const d = depth / 100;
  const h = height / 100;
  const thickness = 0.05;

  const finishTextures = useTexture({
    leatherVelvetMap: '/texture/leatherVelvet.jpg',
    leatherMap: '/texture/dadleather.jpg',
    velvetMap: '/texture/velvet.jpg',
  });

  const textureFor = (isInternal = false) => {
    const isLeatherWithVelvet = finish === 'velvet';
    if (isInternal && isLeatherWithVelvet) return finishTextures.velvetMap;
    if (isLeatherWithVelvet) return finishTextures.leatherVelvetMap;
    return finishTextures.leatherMap;
  };

  const internalMaterial = finish === 'velvet'
    ? { materialType: 'standard', roughness: 0.95, metalness: 0.02 }
    : { materialType: 'physical', roughness: 0.72, metalness: 0.08, clearcoat: 0.28, clearcoatRoughness: 0.32 };

  const externalMaterial = { materialType: 'physical', roughness: 0.72, metalness: 0.08, clearcoat: 0.28, clearcoatRoughness: 0.32 };

  // Support both numeric divider positions and object dividers with spans.
  const hDivs = horizontalDividers.map((div) => (
    typeof div === 'number' ? { pos: div, start: 0, end: width } : div
  ));
  const vDivs = verticalDividers.map((div) => (
    typeof div === 'number' ? { pos: div, start: 0, end: depth } : div
  ));

  return (
    <group>
      <TiledBox
        args={[w, thickness, d]}
        position={[0, -h / 2 + thickness / 2, 0]}
        map={textureFor(true)}
        color={color}
        {...internalMaterial}
      />

      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, d / 2 - thickness / 2]}
        map={textureFor(false)}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, -d / 2 + thickness / 2]}
        map={textureFor(false)}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[w / 2 - thickness / 2, 0, 0]}
        map={textureFor(false)}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[-w / 2 + thickness / 2, 0, 0]}
        map={textureFor(false)}
        color={color}
        {...externalMaterial}
      />

      {hDivs.map((div, i) => {
        const zPos = d / 2 - (div.pos / 100);
        const divWidth = (div.end - div.start) / 100;
        const xPos = -w / 2 + (div.start + div.end) / 200;
        return (
          <TiledBox
            key={`h-div-${i}`}
            args={[divWidth, h - thickness, thickness]}
            position={[xPos, thickness / 2, zPos]}
            map={textureFor(true)}
            color={color}
            {...internalMaterial}
          />
        );
      })}

      {vDivs.map((div, i) => {
        const xPos = -w / 2 + (div.pos / 100);
        const divDepth = (div.end - div.start) / 100;
        const zPos = d / 2 - (div.start + div.end) / 200;
        return (
          <TiledBox
            key={`v-div-${i}`}
            args={[thickness, h - thickness, divDepth]}
            position={[xPos, thickness / 2, zPos]}
            map={textureFor(true)}
            color={color}
            {...internalMaterial}
          />
        );
      })}

      {placedModules.map((mod) => {
        const modW = mod.width / 100;
        const modD = mod.depth / 100;
        const modH = mod.height / 100;
        const yPos = -h / 2 + thickness + modH / 2;

        const holderInset = 0.01;
        const cellW = Math.max(modW, (mod.cellWidth || mod.width) / 100);
        const cellD = Math.max(modD, (mod.cellDepth || mod.depth) / 100);
        const holderBaseH = Math.max(0.008, modH * 0.12);
        const holderWallT = Math.max(0.007, Math.min(cellW, cellD) * 0.06);
        const holderWallH = Math.max(0.02, modH * 0.55);
        const holderW = Math.max(modW + holderWallT * 2, cellW - holderInset * 2);
        const holderD = Math.max(modD + holderWallT, cellD - holderInset * 2);
        const holderY = -h / 2 + thickness + holderBaseH / 2;
        const holderWallY = holderY + holderBaseH / 2 + holderWallH / 2;

        return (
          <group key={mod.instanceId}>
            <TiledBox
              args={[holderW, holderBaseH, holderD]}
              position={[mod.position[0], holderY, mod.position[2]]}
              map={textureFor(true)}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderWallT, holderWallH, holderD]}
              position={[mod.position[0] - holderW / 2 + holderWallT / 2, holderWallY, mod.position[2]]}
              map={textureFor(true)}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderWallT, holderWallH, holderD]}
              position={[mod.position[0] + holderW / 2 - holderWallT / 2, holderWallY, mod.position[2]]}
              map={textureFor(true)}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderW - holderWallT * 2, holderWallH, holderWallT]}
              position={[mod.position[0], holderWallY, mod.position[2] + holderD / 2 - holderWallT / 2]}
              map={textureFor(true)}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderW - holderWallT * 2, holderWallH, holderWallT]}
              position={[mod.position[0], holderWallY, mod.position[2] - holderD / 2 + holderWallT / 2]}
              map={textureFor(true)}
              color={color}
              {...internalMaterial}
            />

            <Box
              args={[modW, modH, modD]}
              position={[mod.position[0], yPos, mod.position[2]]}
            >
              <meshStandardMaterial color={mod.color} roughness={0.5} metalness={0.3} />
            </Box>
          </group>
        );
      })}
    </group>
  );
};

export default Tray;
