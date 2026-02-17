import React, { useEffect, useMemo, useState } from 'react';
import { Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';


// Convert a texture to grayscale so the material color can tint it cleanly
// Returns a Promise that resolves once the image is fully decoded and processed
async function desaturateTexture(texture, brightness = 1.0) {
  if (!texture?.image) return texture;
  const img = texture.image;

  // Wait for image to be fully decoded before reading pixels
  if (img.decode) {
    try { await img.decode(); } catch (e) { /* already decoded */ }
  }

  if (!img.width || !img.height) return texture;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const adjusted = Math.min(255, gray * brightness);
      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    }
    ctx.putImageData(imageData, 0, 0);
    const newTex = texture.clone();
    newTex.image = canvas;
    newTex.needsUpdate = true;
    return newTex;
  } catch (e) {
    console.warn('Texture desaturation failed, using original:', e);
    return texture;
  }
}

// Hook to desaturate a texture asynchronously
function useDesaturatedTexture(texture, brightness = 1.0) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    desaturateTexture(texture, brightness).then((tex) => {
      if (!cancelled) setResult(tex);
    });
    return () => { cancelled = true; };
  }, [texture, brightness]);
  return result || texture; // fallback to original until processed
}

const TiledBox = ({
  args,
  position,
  map,
  textureDensity = 0.2,
  materialType = 'physical',
  color = '#7E7E7E',
  roughness = 1,
  metalness = 0,
  clearcoat = 0,
  clearcoatRoughness = 0,
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
      tex.repeat.set(Math.max(u * textureDensity, 0.01), Math.max(v * textureDensity, 0.01));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      return tex;
    });
  }, [map, textureDensity, x, y, z]);

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
    leatherMap: '/texture/leather.jpg',
    velvetMap: '/texture/velvet.jpg',
  });

  // Desaturate textures so selected color applies cleanly
  const neutralLeather = useDesaturatedTexture(finishTextures.leatherMap, 1.3);
  const neutralVelvet = useDesaturatedTexture(finishTextures.velvetMap, 2.5);

  const texDensity = finish === 'velvet' ? 1 : 0.2;

  const textureFor = () => {
    return finish === 'velvet' ? neutralVelvet : neutralLeather;
  };

  // For leather: use same material everywhere (physical with no reflections)
  // For velvet: internal surfaces use standard material (softer look)
  const materialProps = { roughness: 1, metalness: 0.0, clearcoat: 0, clearcoatRoughness: 0 };

  const internalMaterial = finish === 'velvet'
    ? { materialType: 'standard', ...materialProps }
    : { materialType: 'physical', ...materialProps };

  const externalMaterial = { materialType: 'physical', ...materialProps };

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
        textureDensity={texDensity}
        color={color}
        {...internalMaterial}
      />

      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, d / 2 - thickness / 2]}
        map={textureFor(false)}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, -d / 2 + thickness / 2]}
        map={textureFor(false)}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[w / 2 - thickness / 2, 0, 0]}
        map={textureFor(false)}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[-w / 2 + thickness / 2, 0, 0]}
        map={textureFor(false)}
        textureDensity={texDensity}
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
            textureDensity={texDensity}
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
            textureDensity={texDensity}
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
              textureDensity={texDensity}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderWallT, holderWallH, holderD]}
              position={[mod.position[0] - holderW / 2 + holderWallT / 2, holderWallY, mod.position[2]]}
              map={textureFor(true)}
              textureDensity={texDensity}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderWallT, holderWallH, holderD]}
              position={[mod.position[0] + holderW / 2 - holderWallT / 2, holderWallY, mod.position[2]]}
              map={textureFor(true)}
              textureDensity={texDensity}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderW - holderWallT * 2, holderWallH, holderWallT]}
              position={[mod.position[0], holderWallY, mod.position[2] + holderD / 2 - holderWallT / 2]}
              map={textureFor(true)}
              textureDensity={texDensity}
              color={color}
              {...internalMaterial}
            />

            <TiledBox
              args={[holderW - holderWallT * 2, holderWallH, holderWallT]}
              position={[mod.position[0], holderWallY, mod.position[2] - holderD / 2 + holderWallT / 2]}
              map={textureFor(true)}
              textureDensity={texDensity}
              color={color}
              {...internalMaterial}
            />

            <Box
              args={[modW, modH, modD]}
              position={[mod.position[0], yPos, mod.position[2]]}
            >
              <meshStandardMaterial color={mod.color} roughness={1} metalness={0} />
            </Box>
          </group>
        );
      })}
    </group>
  );
};

export default Tray;
