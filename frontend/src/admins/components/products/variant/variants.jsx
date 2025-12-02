import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import { IoTrashBinSharp } from "react-icons/io5";

import { addVariant, deleteVariant } from 'redux-tps/features/index-features';

import Variant from "./variant";
import { userModalDialogStore, useShallow } from "#custom-hooks";
import ConfirmDialog from "#a-components/common/confirm-dialog";

const Variants = ({ selector }) => {
  // const { selector, actions } = props;
  const { push, reset } = userModalDialogStore(useShallow((zs) => ({
    push: zs.push,
    reset: zs.reset,
  })));
  const dispatch = useDispatch();

  const variantLength = useSelector((state) => state.product.Variants?.length || 0);
  const variantsSelector = (index) => (state) => state.product.Variants[index]

  const handleAddVariant = () => {
    dispatch(addVariant());
  }
  const handleDeleteVariant = (variantIndex) => {
    push({
      title: 'Xác nhận xóa biến thể',
      bodyComponent: ConfirmDialog,
      bodyProps: {
        message: (
          <p>
            Bạn có chắc chắn muốn xóa biến thể thứ <strong>{variantIndex + 1}</strong> không?
          </p>
        )
      },
      size: 'sm',
      buttons: [
        <Button
          key="confirm"
          variant="danger"
          onClick={() => { dispatch(deleteVariant({ variantIndex })); reset(); }}
        >
          Xóa
        </Button>,
      ]
    });
  }

  console.log('RENDER: variants');
  return (
    <>
      <Card className="mb-4" id="variants">
        <Card.Header className='h5'>Biến thể sản phẩm</Card.Header>

        <Card.Body>
          {variantLength > 0 &&
            [...Array(variantLength).keys()].map((_, variantIndex) =>
              <div key={`variant-fragment-${variantIndex}`} className='position-relative'>
                <Variant
                  key={`variant-${variantIndex}`}
                  variantIndex={variantIndex}
                  selector={variantsSelector(variantIndex)}
                />
                <Button variant="outline-danger" className="btn-del-variant"
                  onClick={() => handleDeleteVariant(variantIndex)}
                  tile='Xóa biến thể'
                >
                  <IoTrashBinSharp />
                </Button>
              </div>
            )
          }
          <Button variant="outline-secondary" onClick={handleAddVariant}>+ Thêm biến thể</Button>
        </Card.Body>

      </Card>
    </>
  );
};

export default Variants;