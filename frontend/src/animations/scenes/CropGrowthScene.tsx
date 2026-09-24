import React, { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { FarmSky } from '../environment/FarmSky';
import { FarmSoil } from '../environment/FarmSoil';
import { InstancedGrass } from '../environment/InstancedGrass';
import { DistantLandscape } from '../environment/DistantLandscape';
import { PlantGrowthMesh } from '../crops/PlantGrowthMesh';
import { PotatoUndergroundMesh } from '../crops/PotatoUndergroundMesh';
import { UndergroundSoilCutaway } from '../crops/UndergroundSoilCutaway';
import { RealisticSparrow } from '../animals/sparrow/RealisticSparrow';
import { damp } from '../utils/naturalMovement';
import type { CropType, CameraViewMode } from '../types/animationTypes';
import { CROP_PROFILES } from '../crops/CropGrowthProfile';

interface CropGrowthSceneProps {
  cropType?: CropType;
  progress?: number;
  viewMode?: CameraViewMode;
  includeSparrow?: boolean;
  className?: string;
  fallback?: ReactNode;
}

const CameraTransitionController: React.FC<{ viewMode: CameraViewMode }> = ({ viewMode }) => {
  useFrame((state, delta) => {
    const targetY = viewMode === 'UNDERGROUND' ? -0.35 : 1.8;
    const targetZ = viewMode === 'UNDERGROUND' ? 3.4 : 5.8;
    const targetFov = viewMode === 'UNDERGROUND' ? 40 : 45;

    state.camera.position.y = damp(state.camera.position.y, targetY, 4, delta);
    state.camera.position.z = damp(state.camera.position.z, targetZ, 4, delta);
    (state.camera as any).fov = damp((state.camera as any).fov || 45, targetFov, 4, delta);
    state.camera.updateProjectionMatrix();
  });
  return null;
};

export const CropGrowthScene: React.FC<CropGrowthSceneProps> = ({
  cropType = 'potato',
  progress = 0.7,
  viewMode = 'ABOVE_GROUND',
  includeSparrow = true,
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  const profile = CROP_PROFILES[cropType] || CROP_PROFILES.neutral;
  const isPotato = cropType === 'potato' || profile.hasUndergroundTubers;

  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={[0, 1.8, 5.8]}
        className={className}
        fallback={fallback}
      >
        <CameraTransitionController viewMode={viewMode} />
        <Lighting timeOfDay="morning" />
        <Atmosphere near={5} far={30} />
        <FarmSky />
        <DistantLandscape />
        <FarmSoil />
        <InstancedGrass />

        {/* Above Ground Biological Plant Growth */}
        <group position={[0, 0, 0]}>
          <PlantGrowthMesh cropType={cropType} progress={progress} />
        </group>

        {/* Underground Potato Cutaway & Root/Tuber Network */}
        {isPotato && viewMode === 'UNDERGROUND' && (
          <group position={[0, -0.1, 0]}>
            <UndergroundSoilCutaway depth={1.6} width={3.6} />
            <PotatoUndergroundMesh progress={progress} tuberCount={7} tuberMaxScale={0.5} />
          </group>
        )}

        {/* Sparrow Integration */}
        {includeSparrow && viewMode === 'ABOVE_GROUND' && (
          <RealisticSparrow showBranch={true} autoStart={true} scale={0.7} />
        )}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
