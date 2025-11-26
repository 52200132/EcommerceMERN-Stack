import { useOffCanvasStore } from '#custom-hooks';
import { useState, useEffect } from 'react';

const getPlacement = () => {
  if (typeof window === 'undefined') return 'end';
  return window.innerWidth < 576 ? 'bottom' : 'end';
};

export const useResponsiveOffcanvasPlacement = () => {
  const [placement, setPlacement] = useState(getPlacement());
  const show = useOffCanvasStore(zs => zs.show);
  const setShow = useOffCanvasStore(zs => zs.setShow);
  const canvasBody = useOffCanvasStore(zs => zs.activateOffCanvasBody);
  const setOffCanvasBody = useOffCanvasStore(zs => zs.setActiveOffCanvasBody);

  useEffect(() => {
    const handleResize = () => {
      console.log('change'); setPlacement(getPlacement())
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return { placement, show, setShow, canvasBody, setOffCanvasBody };
};