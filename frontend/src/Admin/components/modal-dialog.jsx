import { Button, Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import AttributesVariant from './products/variant/attributes-variant';
import TinyMCE from './tiny-mce';
import EditVariant from './products/variant/edit-variant';

import { goBack, setHide } from 'redux-tps/features/modal-slice';
import { useAContext } from '../a-context';

const MODAL_COMPONENTS = {
  TinyMCE,
  AttributesVariant,
  EditVariant,
}

const ModalDialog = (props) => {
  const dispatch = useDispatch();
  const { SELECTORS } = useAContext();
  const { show, componentName, componentProps, title, showBackBtn } = useSelector((state) => state.modal);
  const ModalContent = MODAL_COMPONENTS[componentName];
  const selector = SELECTORS[componentProps?.selectorKey] ? SELECTORS[componentProps?.selectorKey] : null;

  if (!selector && ModalContent === AttributesVariant) return

  console.log('RENDER: modal-dialog');
  return (
    <>
      <Modal
        show={show}
        onHide={() => dispatch(setHide())}
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

          {ModalContent && <ModalContent {...componentProps} selector={selector} />}

        </Modal.Body>
        <Modal.Footer>
          {showBackBtn &&
            <Button variant='secondary' onClick={() => dispatch(goBack())}>Trở lại</Button>
          }
          <Button onClick={() => dispatch(setHide())}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDialog