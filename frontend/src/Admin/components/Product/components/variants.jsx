import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import { addVariant } from 'redux-tps/features/product-slice';
import Variant from "./variant";

const Variants = (props) => {
  // const { selector, actions } = props;
  const dispatch = useDispatch();

  const variantLength = useSelector((state) => state.product.Variants?.length || 0);
  const variantsSelector = (index) => (state) => state.product.Variants[index]

  const handleAddVariant = () => {
    dispatch(addVariant());
  }

  console.log('RENDER: variants');

  return (
    <>
      {/* {variants.map((variant, variantIndex) => (
        <Variants 
          selector={variantsImgsSelector(variantIndex)}
        />
      ))} */}
      {variantLength > 0 &&
        [...Array(variantLength).keys()].map((_, variantIndex) =>
          <Variant
            key={`variant-${variantIndex}`}
            variantIndex={variantIndex}
            selector={variantsSelector(variantIndex)}
          />
        )
      }

      <Button variant="secondary" onClick={handleAddVariant}>+ Thêm phiên bản sản phẩm</Button>
    </>
  );
};

export default Variants;