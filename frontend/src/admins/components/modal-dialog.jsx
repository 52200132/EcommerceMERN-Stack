import { Button, Modal } from 'react-bootstrap';
import { createElement } from 'react';
import { userModalDialogStore, useShallow } from '#custom-hooks';

const ModalDialog = () => {
  const { show, setShow, bodyProps, bodyComponent, title } = userModalDialogStore(
    useShallow(zs => ({
      show: zs.show,
      setShow: zs.setShow,
      bodyProps: zs.bodyProps,
      bodyComponent: zs.bodyComponent,
      title: zs.title,
    }))
  );
  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bodyComponent && createElement(bodyComponent, { ...bodyProps })}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDialog