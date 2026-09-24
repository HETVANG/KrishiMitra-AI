import React from 'react';
import { BaseScene } from '../scenes/BaseScene';
import { RealisticSparrow } from '../animals/sparrow/RealisticSparrow';

interface LoginAnimationLayerProps {
  className?: string;
}

export const LoginAnimationLayer: React.FC<LoginAnimationLayerProps> = ({
  className = 'absolute inset-0 pointer-events-none z-10 overflow-hidden',
}) => {
  return (
    <div className={className} aria-hidden="true">
      <BaseScene
        showGround={false}
        showSky={false}
        showDust={true}
        cameraPosition={[0, 1.5, 5]}
        timeOfDay="morning"
        className="w-full h-full pointer-events-none opacity-90"
      >
        <RealisticSparrow showBranch={true} autoStart={true} scale={0.7} />
      </BaseScene>
    </div>
  );
};
