import { useState, useEffect } from 'react';

export const getPlacement = () => {
  if (typeof window === 'undefined') return 'end';
  return window.innerWidth < 576 ? 'bottom' : 'end';
};

export const useResponsiveOffcanvasPlacement = () => {
  const [placement, setPlacement] = useState(getPlacement());

  useEffect(() => {
    const handleResize = () => setPlacement(getPlacement());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return { placement };
};