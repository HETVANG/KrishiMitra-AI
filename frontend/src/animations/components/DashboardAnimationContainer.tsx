import React, { ReactNode } from 'react';
import { BaseScene } from '../scenes/BaseScene';

interface DashboardAnimationContainerProps {
  children?: ReactNode;
  title?: string;
  className?: string;
  height?: string;
}

export const DashboardAnimationContainer: React.FC<DashboardAnimationContainerProps> = ({
  children,
  title = 'Living Farm Environment',
  className = 'w-full rounded-3xl overflow-hidden border border-emerald-900/10 dark:border-dark-800/30 bg-gradient-to-b from-emerald-900/5 to-transparent relative shadow-sm',
  height = 'h-48 sm:h-64',
}) => {
  return (
    <div className={`${className} ${height}`}>
      <div className="absolute top-3 left-4 z-20 pointer-events-none">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-emerald-500/20">
          {title}
        </span>
      </div>

      <BaseScene
        showGround={true}
        showSky={true}
        showDust={true}
        cameraPosition={[0, 2, 6]}
        timeOfDay="morning"
        className="w-full h-full pointer-events-none"
      >
        {children}
      </BaseScene>
    </div>
  );
};
