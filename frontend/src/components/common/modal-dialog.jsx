import { Button, Modal } from 'react-bootstrap';
import { cloneElement, createElement } from 'react';
import { userModalDialogStore, useShallow } from '#custom-hooks';
import { setShow } from '#features/modal-slice';

const renderBodyComponent = (bodyComponent, bodyProps) => {
  if (typeof bodyComponent === 'function') {
    return createElement(bodyComponent, { ...bodyProps });
  } else if (bodyComponent) {
    const BodyComponent = bodyComponent;
    return cloneElement(BodyComponent, { ...bodyProps });
  }
  return bodyComponent;
};

const ModalDialog = () => {
  const {
    show,
    setShow,
    size,
    title,
    bodyComponent,
    bodyProps,
    stack,
    pop,
    reset,
  } = userModalDialogStore(
    useShallow((zs) => ({
      show: zs.show,
      setShow: zs.setShow,
      size: zs.size,
      title: zs.title,
      bodyComponent: zs.bodyComponent,
      bodyProps: zs.bodyProps,
      stack: zs.stack,
      pop: zs.pop,
      reset: zs.reset,
    }))
  );

  const handleHide = () => {
    setShow(false);
    setTimeout(() => reset(), 300);
    // if (stack.length > 1) {
    //   pop();
    // } else {
    //   reset();
    // }
  };

  return (
    <Modal
      show={show}
      onHide={handleHide}
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
        {stack.length > 1 && (
          <Button variant="outline-secondary" onClick={pop}>
            Quay lại
          </Button>
        )}
        <Button onClick={handleHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalDialog;
