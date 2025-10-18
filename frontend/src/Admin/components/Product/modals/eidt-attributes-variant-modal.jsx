import { Modal, Button } from "react-bootstrap";

const EditAttributesVariantModal = (props) => {
  const { show, setHide, title } = props;
  return (
    <>
      <Modal
        show={show}
        onHide={() => setHide(false)}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setHide(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default EditAttributesVariantModal;