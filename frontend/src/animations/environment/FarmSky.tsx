import React from 'react';

interface FarmSkyProps {
  colorTop?: string;
  colorBottom?: string;
}

export const FarmSky: React.FC<FarmSkyProps> = ({
  colorTop = '#7ab8d6',
  colorBottom = '#e2f0d9',
}) => {
  return (
    <mesh scale={[100, 100, 100]} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={colorTop}
        side={2} // DoubleSide
        depthWrite={false}
      />
    </mesh>
  );
};
