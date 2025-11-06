import { createRoot } from 'react-dom/client';
import Overlay from 'components/overlay';

let overlayRoot = null;
let overlayContainer = document.getElementById('overlay-root');
let preloaderRoot = null;
let preloaderContainer = document.getElementById('overlay-prloader-root');
/**
 * Hiển thị overlay với children tùy chỉnh
 * @param {React.ReactNode} children - Component hoặc JSX cần hiển thị
 * @returns {Object} - Object với method close()
 */
export const overlay = (children, props) => {
  // Tạo container nếu chưa có
  if (!overlayContainer) {
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'overlay-root';
    document.body.appendChild(overlayContainer);
  }

  // Tạo root nếu chưa có
  if (!overlayRoot) {
    overlayRoot = createRoot(overlayContainer);
  }

  const closeOverlay = () => {
    overlayRoot.render(null);
    document.body.style.overflow = '';
  }

  const overlayProps = {
    ...props,
    closeOverlay
  };

  // Render overlay
  overlayRoot.render(
    <Overlay
      {...overlayProps}
    >
      {children}
    </Overlay>
  );
  document.body.style.overflow = 'hidden';

  // Trả về API để đóng overlay
  return {
    close: closeOverlay,
    update: (newChildren) => {
      overlayRoot.render(
        <Overlay
          {...overlayProps}
        >
          {newChildren}
        </Overlay>
      );
    }
  };
};

const OverlayPreloader = ({children}) => (
  <div className="preloader">
    <div className="preloader-inner">
      <div className="preloader-icon">
        <span></span>
        <span></span>
      </div>
      <div className="content">{children}</div>
    </div>
  </div>
);

export const overlayPreloader = (children) => {
  // Tạo container nếu chưa có
  if (!preloaderContainer) {
    preloaderContainer = document.createElement('div');
    preloaderContainer.className = 'preloader';
    preloaderContainer.id = 'overlay-prloader-root';
    document.body.appendChild(preloaderContainer);
  }

  // Tạo root nếu chưa có
  if (!preloaderRoot) {
    preloaderRoot = createRoot(preloaderContainer);
  }

  const closeOverlay = () => {
    preloaderRoot.render(null);
    preloaderContainer.style.display = 'none';
    preloaderContainer.style.opacity = '0';
  }

  // Render overlay
  preloaderRoot.render(
    <OverlayPreloader>
      {children}
    </OverlayPreloader>
  );
  preloaderContainer.style = {}

  // Trả về API để đóng overlay
  return {
    close: closeOverlay,
    update: (newChildren) => {
      preloaderRoot.render(
        <OverlayPreloader>
          {newChildren}
        </OverlayPreloader>
      );
      preloaderContainer.style = {}
    }
  };
};

/**
 * Đóng tất cả overlay hiện tại
 */
export const closeOverlays = () => {
  if (overlayRoot) {
    overlayRoot.render(null);
    document.body.style.overflow = '';
  }
  if (preloaderRoot) {
    preloaderRoot.render(null);
    preloaderContainer.style = {};
  }
};