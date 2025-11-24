import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useRenderCountStore } from "./use-zustand-store";

let renderRoot = null;
let renderContainer = document.getElementById('render-root');
const renderStyles = {
  position: 'fixed',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(37, 187, 0, 1)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '5px',
  zIndex: 9999
};
/**
 * 
 * @param {name} name tên của component muốn theo dõi số lần render
 * @param {mode} mode có thể là console, ui, both
 * - console: log ra console
 * - ui: hiển thị trên UI
 * - both: cả hai
 */

export const useRenderCount = (name, mode) => {
  if (!renderContainer) {
    renderContainer = document.createElement('div');
    renderContainer.id = 'render-root';
    document.body.appendChild(renderContainer);
  }
  if (!renderRoot) {
    renderRoot = createRoot(renderContainer);

  }

  const addComponent = useRenderCountStore((zs) => zs.addComponent);
  const removeComponent = useRenderCountStore((zs) => zs.removeComponent);
  const getComponentIndex = useRenderCountStore((zs) => zs.getComponentIndex);
  const renderCount = useRef(0);

  renderCount.current += 1;

  useEffect(() => {
    addComponent(name);
    if (mode === 'console' || mode === 'both') {
      console.log(`[RENDER]:\n${name}`)
    }
    return () => {
      renderCount.current = 0;
      removeComponent(name);
    }
  }, [name, mode, addComponent, removeComponent]);

  useEffect(() => {
    if (mode === 'console' || mode === 'both') {
      console.log(`[RENDERCOUNT] \n${name || 'Component'} ${renderCount.current} time(s).`);
    }
    if (mode === 'ui' || mode === 'both') {
      const index = getComponentIndex(name);
      renderRoot.render(
        <div style={{ ...renderStyles, top: `${10 + index * 30}px` }}>
          {`${name || 'Component'} | render count: ${renderCount.current} | th: ${index + 1}`}
        </div>
      );
    }
  });

}