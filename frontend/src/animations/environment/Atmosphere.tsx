import React from 'react';

interface AtmosphereProps {
  color?: string;
  near?: number;
  far?: number;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  color = '#d8e6db',
  near = 8,
  far = 45,
}) => {
  return <fog attach="fog" args={[color, near, far]} />;
};
