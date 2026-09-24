import { useState, useEffect, RefObject } from 'react';

export function useAnimationVisibility(containerRef?: RefObject<HTMLElement | null>): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    let isPageVisible = !document.hidden;
    let isElementVisible = true;

    const updateVisibility = () => {
      setIsVisible(isPageVisible && isElementVisible);
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      updateVisibility();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if (containerRef && containerRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          isElementVisible = entry.isIntersecting;
          updateVisibility();
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [containerRef]);

  return isVisible;
}
