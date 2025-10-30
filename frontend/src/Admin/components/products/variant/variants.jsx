import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "react-bootstrap";
import { IoTrashBinSharp } from "react-icons/io5";

import { addVariant, deleteVariant } from 'redux-tps/features';

import Variant from "./variant";

const Variants = ({ selector }) => {
  // const { selector, actions } = props;
  const dispatch = useDispatch();

  const variantLength = useSelector((state) => state.product.Variants?.length || 0);
  const variantsSelector = (index) => (state) => state.product.Variants[index]

  const handleAddVariant = () => {
    dispatch(addVariant());
  }
  const handleDeleteVariant = (variantIndex) => {
    dispatch(deleteVariant({ variantIndex }));
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