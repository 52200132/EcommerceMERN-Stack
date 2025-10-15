import { Button, Modal } from 'react-bootstrap';

const EditDetailsModal = (props) => {
  const { show, setHide } = props;

  return (
    <Modal
      show={show}
      onHide={() => setHide(false)}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Chỉnh sửa chi tiết của sản phẩm
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>

      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setHide(false)}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditDetailsModal