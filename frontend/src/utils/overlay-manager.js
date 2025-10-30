import { createRoot } from 'react-dom/client';
import Overlay from 'components/overlay';

let overlayRoot = null;
let overlayContainer = document.getElementById('overlay-root');

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

/**
 * Đóng overlay hiện tại
 */
export const closeOverlay = () => {
  if (overlayRoot) {
    overlayRoot.render(null);
    document.body.style.overflow = '';
  }
};