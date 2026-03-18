import React, { useEffect, useMemo, useState } from 'react';
import { Box, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { getModuleDefinition } from '../config/modules';

const clamp = (value, min, max) => {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
};

const MODEL_PATHS = {
  ringStrokes: '/models/modules/ringstrokes.glb',
  holesOnly: '/models/modules/holesonly.glb',
  lipWithHoles: '/models/modules/lipwithholes.glb',
  lipNoHoles: '/models/modules/lipNoholes.glb',
  noLipNoHoles: '/models/modules/nolipnoholes.glb',
};

const resolveModuleTextureRule = (rule, finish) => {
  if (rule === 'onlyVelvet') return 'velvet';
  if (rule === 'onlyLeather') return 'leather';
  if (rule === 'outsideLeatherBottomVelvet') return 'leather';
  if (rule === 'leatherTopVelvetBottom') return 'leather';
  return finish === 'velvet' ? 'velvet' : 'leather';
};

async function desaturateTexture(texture, brightness = 1.0) {
  if (!texture?.image) return texture;
  const img = texture.image;

  if (img.decode) {
    try {
      await img.decode();
    } catch {
      // The image may already be decoded.
    }
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
  } catch (error) {
    console.warn('Texture desaturation failed, using original:', error);
    return texture;
  }
}

function useDesaturatedTexture(texture, brightness = 1.0) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    desaturateTexture(texture, brightness).then((tex) => {
      if (!cancelled) setResult(tex);
    });

    return () => {
      cancelled = true;
    };
  }, [texture, brightness]);

  return result || texture;
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

  const faceTextures = useMemo(() => {
    if (!map) return [null, null, null, null, null, null];

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

const FittedModuleModel = ({
  modelScene,
  position,
  targetSize,
  color = '#7E7E7E',
  textureRule = 'leather',
  textureMaps,
  rotation = [0, 0, 0],
}) => {
  const { centeredModel, boundsSize } = useMemo(() => {
    if (!modelScene) return { centeredModel: null, boundsSize: new THREE.Vector3(1, 1, 1) };

    const modelInstance = modelScene.clone(true);
    const box = new THREE.Box3().setFromObject(modelInstance);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    modelInstance.position.sub(center);

    return {
      centeredModel: modelInstance,
      boundsSize: size,
    };
  }, [modelScene]);

  useEffect(() => {
    if (!centeredModel || !textureMaps) return undefined;

    const createdMaterials = [];
    const leatherMap = textureMaps.leather ?? textureMaps.velvet;
    const velvetMap = textureMaps.velvet ?? textureMaps.leather;
    const mapToUse = textureRule === 'velvet' ? velvetMap : leatherMap;

    if (!mapToUse) {
      return undefined;
    }

    centeredModel.traverse((node) => {
      if (node.isMesh) {
        const isVelvet = textureRule === 'velvet';
        const MaterialCtor = isVelvet ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
        const baseMaterial = new MaterialCtor({
          roughness: 1,
          metalness: 0,
          clearcoat: 0,
          clearcoatRoughness: 0,
          color,
        });

        baseMaterial.map = mapToUse;
        if (baseMaterial.map) {
          baseMaterial.map.colorSpace = THREE.SRGBColorSpace;
        }
        baseMaterial.needsUpdate = true;
        node.material = baseMaterial;
        node.castShadow = true;
        node.receiveShadow = true;
        createdMaterials.push(baseMaterial);
      }
    });

    return () => {
      createdMaterials.forEach((material) => material.dispose());
    };
  }, [centeredModel, color, textureMaps, textureRule]);

  const scaleVector = useMemo(() => {
    const safeSize = {
      x: Math.max(boundsSize.x, 0.0001),
      y: Math.max(boundsSize.y, 0.0001),
      z: Math.max(boundsSize.z, 0.0001),
    };

    return [
      targetSize.width / safeSize.x,
      targetSize.height / safeSize.y,
      targetSize.depth / safeSize.z,
    ];
  }, [boundsSize.x, boundsSize.y, boundsSize.z, targetSize.depth, targetSize.height, targetSize.width]);

  if (!centeredModel) return null;

  const scaledHeight = boundsSize.y * scaleVector[1];
  const baseY = position[1];

  return (
    <group
      position={[position[0], baseY + scaledHeight / 2, position[2]]}
      scale={scaleVector}
      rotation={rotation}
    >
      <primitive object={centeredModel} />
    </group>
  );
};

const HolderShell = ({
  centerX,
  centerZ,
  texture,
  textureDensity,
  color,
  materialProps,
  width,
  depth,
  baseHeight,
  wallThickness,
  wallHeight,
  baseY,
  wallY,
}) => (
  <>
    <TiledBox
      args={[width, baseHeight, depth]}
      position={[centerX, baseY, centerZ]}
      map={texture}
      textureDensity={textureDensity}
      color={color}
      {...materialProps}
    />

    <TiledBox
      args={[wallThickness, wallHeight, depth]}
      position={[centerX - width / 2 + wallThickness / 2, wallY, centerZ]}
      map={texture}
      textureDensity={textureDensity}
      color={color}
      {...materialProps}
    />

    <TiledBox
      args={[wallThickness, wallHeight, depth]}
      position={[centerX + width / 2 - wallThickness / 2, wallY, centerZ]}
      map={texture}
      textureDensity={textureDensity}
      color={color}
      {...materialProps}
    />

    <TiledBox
      args={[width - wallThickness * 2, wallHeight, wallThickness]}
      position={[centerX, wallY, centerZ + depth / 2 - wallThickness / 2]}
      map={texture}
      textureDensity={textureDensity}
      color={color}
      {...materialProps}
    />

    <TiledBox
      args={[width - wallThickness * 2, wallHeight, wallThickness]}
      position={[centerX, wallY, centerZ - depth / 2 + wallThickness / 2]}
      map={texture}
      textureDensity={textureDensity}
      color={color}
      {...materialProps}
    />
  </>
);

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
  const thicknessMm = thickness * 100;
  const dividerInsetMm = 0.1;
  const dividerHalfMm = thicknessMm / 2;

  const finishTextures = useTexture({
    leatherMap: '/texture/leather.jpg',
    velvetMap: '/texture/velvet.jpg',
  });
  const { scene: ringStrokesScene } = useGLTF(MODEL_PATHS.ringStrokes);
  const { scene: holesOnlyScene } = useGLTF(MODEL_PATHS.holesOnly);
  const { scene: lipWithHolesScene } = useGLTF(MODEL_PATHS.lipWithHoles);
  const { scene: lipNoHolesScene } = useGLTF(MODEL_PATHS.lipNoHoles);
  const { scene: noLipNoHolesScene } = useGLTF(MODEL_PATHS.noLipNoHoles);

  const moduleScenes = useMemo(() => ({
    [MODEL_PATHS.ringStrokes]: ringStrokesScene,
    [MODEL_PATHS.holesOnly]: holesOnlyScene,
    [MODEL_PATHS.lipWithHoles]: lipWithHolesScene,
    [MODEL_PATHS.lipNoHoles]: lipNoHolesScene,
    [MODEL_PATHS.noLipNoHoles]: noLipNoHolesScene,
  }), [holesOnlyScene, lipNoHolesScene, lipWithHolesScene, noLipNoHolesScene, ringStrokesScene]);

  const neutralLeather = useDesaturatedTexture(finishTextures.leatherMap, 1.3);
  const neutralVelvet = useDesaturatedTexture(finishTextures.velvetMap, 2.5);
  const texDensity = finish === 'velvet' ? 0.3 : 0.2;
  const textureFor = () => (finish === 'velvet' ? neutralVelvet : neutralLeather);
  const textureMaps = useMemo(() => ({
    leather: neutralLeather,
    velvet: neutralVelvet,
  }), [neutralLeather, neutralVelvet]);

  const materialProps = { roughness: 1, metalness: 0.0, clearcoat: 0, clearcoatRoughness: 0 };
  const velvetModuleMaterial = { materialType: 'standard', ...materialProps };
  const leatherModuleMaterial = { materialType: 'physical', ...materialProps };
  const internalMaterial = finish === 'velvet'
    ? velvetModuleMaterial
    : leatherModuleMaterial;
  const externalMaterial = { materialType: 'physical', ...materialProps };

  const hStartMin = thicknessMm + dividerInsetMm;
  const hEndMax = width - thicknessMm - dividerInsetMm;
  const hPosMin = thicknessMm + dividerHalfMm + dividerInsetMm;
  const hPosMax = depth - thicknessMm - dividerHalfMm - dividerInsetMm;
  const vStartMin = thicknessMm + dividerInsetMm;
  const vEndMax = depth - thicknessMm - dividerInsetMm;
  const vPosMin = thicknessMm + dividerHalfMm + dividerInsetMm;
  const vPosMax = width - thicknessMm - dividerHalfMm - dividerInsetMm;

  const hDivs = horizontalDividers
    .map((div) => {
      const source = typeof div === 'number'
        ? { pos: div, start: hStartMin, end: hEndMax }
        : div;
      const start = clamp(source.start ?? hStartMin, hStartMin, hEndMax);
      const end = clamp(source.end ?? hEndMax, hStartMin, hEndMax);
      return {
        pos: clamp(source.pos ?? depth / 2, hPosMin, hPosMax),
        start: Math.min(start, end),
        end: Math.max(start, end),
      };
    })
    .filter((div) => div.end - div.start > 0.5);

  const vDivs = verticalDividers
    .map((div) => {
      const source = typeof div === 'number'
        ? { pos: div, start: vStartMin, end: vEndMax }
        : div;
      const start = clamp(source.start ?? vStartMin, vStartMin, vEndMax);
      const end = clamp(source.end ?? vEndMax, vStartMin, vEndMax);
      return {
        pos: clamp(source.pos ?? width / 2, vPosMin, vPosMax),
        start: Math.min(start, end),
        end: Math.max(start, end),
      };
    })
    .filter((div) => div.end - div.start > 0.5);

  const trayFloorY = -h / 2 + thickness;

  return (
    <group>
      <TiledBox
        args={[w, thickness, d]}
        position={[0, -h / 2 + thickness / 2, 0]}
        map={textureFor()}
        textureDensity={texDensity}
        color={color}
        {...internalMaterial}
      />

      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, d / 2 - thickness / 2]}
        map={textureFor()}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[w, h, thickness]}
        position={[0, 0, -d / 2 + thickness / 2]}
        map={textureFor()}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[w / 2 - thickness / 2, 0, 0]}
        map={textureFor()}
        textureDensity={texDensity}
        color={color}
        {...externalMaterial}
      />
      <TiledBox
        args={[thickness, h, d - thickness * 2]}
        position={[-w / 2 + thickness / 2, 0, 0]}
        map={textureFor()}
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
            map={textureFor()}
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
            map={textureFor()}
            textureDensity={texDensity}
            color={color}
            {...internalMaterial}
          />
        );
      })}

      {placedModules.map((mod) => {
        const definition = getModuleDefinition(mod.id);
        const resolvedModule = {
          ...definition,
          ...mod,
          width: mod.width ?? definition?.width ?? 100,
          depth: mod.depth ?? definition?.depth ?? 100,
          height: mod.height ?? definition?.height ?? 40,
          color: mod.color ?? definition?.color ?? '#9CA3AF',
        };

        const resolvedTextureRule = resolveModuleTextureRule(resolvedModule.textureRule, finish);
        const modW = resolvedModule.width / 100;
        const modD = resolvedModule.depth / 100;
        const modH = resolvedModule.height / 100;
        const cellW = Math.max(modW, (resolvedModule.cellWidth || resolvedModule.width) / 100);
        const cellD = Math.max(modD, (resolvedModule.cellDepth || resolvedModule.depth) / 100);
        const holderInset = 0.01;
        const coverInset = 0.01;
        const trayTopY = h / 2;
        const coverLift = 0.002;
        const strokesPushDown = 0.5;
        const isStrokesModule = mod.id === 'rings_4_strokes' || mod.id === 'rings_1_stroke';
        const usesHolderShell = resolvedModule.renderType === 'geometry';
        const isCoverModule = resolvedModule.mountStyle === 'cover';
        const holderBaseH = Math.max(0.008, modH * 0.12);
        const holderWallT = Math.max(0.007, Math.min(cellW, cellD) * 0.06);
        const holderWallH = Math.max(0.02, modH * 0.55);
        const holderW = Math.max(modW + holderWallT * 2, cellW - holderInset * 2);
        const holderD = Math.max(modD + holderWallT, cellD - holderInset * 2);
        const holderBaseY = trayFloorY + holderBaseH / 2;
        const holderWallY = trayFloorY + holderBaseH + holderWallH / 2;
        const contentBaseY = isCoverModule
          ? trayTopY + coverLift - (isStrokesModule ? strokesPushDown : 0)
          : (usesHolderShell ? trayFloorY + holderBaseH : trayFloorY);
        const modelScene = resolvedModule.modelPath ? moduleScenes[resolvedModule.modelPath] : null;
        const targetPadding = isCoverModule ? 1 : (resolvedModule.renderType === 'model' ? 0.94 : 1);
        const contentSize = {
          width: (isCoverModule ? Math.max(cellW - coverInset * 2, 0.01) : modW) * targetPadding,
          depth: (isCoverModule ? Math.max(cellD - coverInset * 2, 0.01) : modD) * targetPadding,
          height: modH * targetPadding,
        };
        const holderTexture = resolvedTextureRule === 'velvet' ? neutralVelvet : neutralLeather;
        const holderMaterialProps = resolvedTextureRule === 'velvet'
          ? velvetModuleMaterial
          : leatherModuleMaterial;

        return (
          <group key={mod.instanceId}>
            {usesHolderShell && (
              <HolderShell
                centerX={mod.position[0]}
                centerZ={mod.position[2]}
                texture={holderTexture}
                textureDensity={texDensity}
                color={color}
                materialProps={holderMaterialProps}
                width={holderW}
                depth={holderD}
                baseHeight={holderBaseH}
                wallThickness={holderWallT}
                wallHeight={holderWallH}
                baseY={holderBaseY}
                wallY={holderWallY}
              />
            )}

            {resolvedModule.renderType === 'model' && modelScene && (
              <FittedModuleModel
                modelScene={modelScene}
                position={[mod.position[0], contentBaseY, mod.position[2]]}
                targetSize={contentSize}
                color={color}
                textureRule={resolvedTextureRule}
                textureMaps={textureMaps}
              />
            )}

            {!definition && !modelScene && resolvedModule.renderType !== 'geometry' && (
              <Box
                args={[modW, modH, modD]}
                position={[mod.position[0], contentBaseY + modH / 2, mod.position[2]]}
              >
                <meshStandardMaterial color={resolvedModule.color} roughness={1} metalness={0} />
              </Box>
            )}
          </group>
        );
      })}
    </group>
  );
};

useGLTF.preload(MODEL_PATHS.ringStrokes);
useGLTF.preload(MODEL_PATHS.holesOnly);
useGLTF.preload(MODEL_PATHS.lipWithHoles);
useGLTF.preload(MODEL_PATHS.lipNoHoles);
useGLTF.preload(MODEL_PATHS.noLipNoHoles);

export default Tray;
