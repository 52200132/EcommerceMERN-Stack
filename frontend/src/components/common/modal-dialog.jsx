import { Button, Modal } from 'react-bootstrap';
import { cloneElement, createElement } from 'react';
import { userModalDialogStore, useShallow } from '#custom-hooks';

const renderBodyComponent = (bodyComponent, bodyProps) => {
  if (typeof bodyComponent === 'function') {
    return createElement(bodyComponent, { ...bodyProps });
  } else if (bodyComponent) {
    const BodyComponent = bodyComponent;
    return cloneElement(BodyComponent, { ...bodyProps });
  } else {
    return bodyComponent;
  }
};

const ModalDialog = () => {
  const { show, setShow, bodyProps, bodyComponent, title, size } = userModalDialogStore(
    useShallow(zs => ({
      show: zs.show,
      setShow: zs.setShow,
      bodyProps: zs.bodyProps,
      bodyComponent: zs.bodyComponent,
      title: zs.title,
      size: zs.size,
    }))
  );

  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size={size}
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
          {renderBodyComponent(bodyComponent, bodyProps)}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDialog