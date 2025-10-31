
import { Modal, Button } from 'react-bootstrap';
import { createRoot } from 'react-dom/client';

/**
 * Hiển thị confirmation dialog
 * @param {Object} options - Tùy chọn cho confirmation
 * @param {string} options.title - Tiêu đề
 * @param {string} options.message - Nội dung thông báo
 * @param {string} options.confirmText - Text nút xác nhận (mặc định: "Xác nhận")
 * @param {string} options.cancelText - Text nút hủy (mặc định: "Hủy")
 * @param {string} options.variant - Variant cho nút xác nhận (mặc định: "primary")
 * @param {string} options.size - Kích thước modal (sm, lg, xl)
 * @returns {Promise<boolean>} - Promise trả về true nếu xác nhận, false nếu hủy
 */
export const confirmation = ({
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  size = 'lg'
}) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleConfirm = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve(true);
    };

    const handleCancel = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve(false);
    };

    root.render(
      <Modal
        show={true}
        onHide={handleCancel}
        size={size}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {typeof message === 'string' ? (
            <p className="mb-0">{message}</p>
          ) : (
            <div className="mb-0">{message}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  });
};