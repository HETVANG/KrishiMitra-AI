// Core Animation & 3D Foundation Exports

export * from './types/animationTypes';
export * from './utils/webglCheck';
export * from './utils/devicePerformance';
export * from './utils/animationEventEmitter';
export * from './utils/naturalMovement';
export * from './utils/windSystem';

export * from './core/useReducedMotion';
export * from './core/useAnimationVisibility';
export * from './core/useDevicePerformance';
export * from './core/useAnimationController';
export * from './core/AnimationErrorBoundary';

export * from './components/QualitySettingsProvider';
export * from './components/Lighting';
export * from './components/AnimationCanvas';
export * from './components/LoginAnimationLayer';
export * from './components/DashboardAnimationContainer';

export * from './components/DashboardLivingFarmWidget';

export * from './environment/FarmSky';
export * from './environment/FarmGround';
export * from './environment/FarmSoil';
export * from './environment/InstancedCrops';
export * from './environment/InstancedGrass';
export * from './environment/FarmTrees';
export * from './environment/DistantLandscape';
export * from './environment/Atmosphere';
export * from './environment/DustParticles';
export * from './environment/WindSystemComponent';

export * from './effects/ParticleEmitter';

export * from './animals/sparrow/SparrowState';
export * from './animals/sparrow/SparrowController';
export * from './animals/sparrow/Sparrow3DMesh';
export * from './animals/sparrow/PerchBranch';
export * from './animals/sparrow/RealisticSparrow';

export * from './crops/CropGrowthProfile';
export * from './crops/PotatoUndergroundMesh';
export * from './crops/PlantGrowthMesh';
export * from './crops/UndergroundSoilCutaway';
export * from './crops/useCropGrowthController';

export * from './components/FarmLifecycleGrowthWidget';

export * from './weather/weatherResolver';
export * from './weather/RainSystem';
export * from './weather/CloudSystem';
export * from './weather/LightningEffect';

export * from './components/DashboardWeatherVisualWidget';

export * from './disease/diseaseResolver';
export * from './disease/LeafScannerMesh';
export * from './disease/ScanningLightBeam';
export * from './components/Disease3DScannerWidget';

export * from './irrigation/irrigationResolver';
export * from './irrigation/SoilCrossSectionMesh';
export * from './irrigation/WaterInfiltrationSystem';
export * from './irrigation/IrrigationMethodSystem';
export * from './components/DashboardSoilIrrigationWidget';

export * from './ai/aiCoreState';
export * from './ai/AICoreMesh';
export * from './ai/DataStreamParticles';
export * from './ai/FarmerCharacterMesh';
export * from './components/DashboardAICoreWidget';

export * from './market/MarketPriceChangeIndicator';
export * from './market/MarketRefreshAnimation';
export * from './notifications/NotificationBellAnimation';
export * from './tasks/TaskCompletionAnimation';

export * from './scenes/BaseScene';
export * from './scenes/LivingFarmScene';
export * from './scenes/CropGrowthScene';
export * from './scenes/WeatherScene';
export * from './scenes/DiseaseScannerScene';
export * from './scenes/SoilIrrigationScene';
export * from './scenes/AICoreScene';




