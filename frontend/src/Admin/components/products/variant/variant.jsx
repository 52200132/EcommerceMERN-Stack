import { useDispatch } from "react-redux";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
// component imports
import MultiImageUpload from "../multi-image-upload";
//
import { setImagesVariant, deleteVariant } from "redux-tps/features/product-slice";
import { useTpsSelector } from "custom-hooks/use-tps-selector";
import { setShow, changeContent } from "redux-tps/features/modal-slice";
import { useAContext } from "Admin/a-context";
import { VARIANTSELECTOR_INDEX } from "Admin/selectors/product";

const Variant = ({ variantIndex, selector }) => {
  selector = selector || VARIANTSELECTOR_INDEX(variantIndex);
  const dispatch = useDispatch()
  const variant = useTpsSelector(selector, { excludeProps: ['Images', 'Attributes', 'html_text_attributes'] });
  const variantsImgsSelector = (state) => state.product.Variants[variantIndex].Images
  const attributesSelector = (state) => state.product.Variants[variantIndex].Attributes
  const { setSELECTORS } = useAContext();  

  const handleShowModalForCreateAttribute = () => {
    const selectorKey = `attributesSelector-${variantIndex}`
    setSELECTORS(prev => (
      {...prev, [selectorKey]: attributesSelector})
    )
    dispatch(changeContent({
      title: 'Thêm thuộc tính',
      componentName: 'AttributesVariant',
      componentProps: { 
        selectorKey, 
        variantIndex 
      },
    }))
    dispatch(setShow())
  }

  // console.log('VARIANT PROPS: ', variant);
  console.log('RENDER: variant');
  return (
    <>
      <div key={`variant-${variantIndex}`} className="border rounded p-3 mb-4">
        <h5>Biến thể {variantIndex + 1}</h5>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Mã SKU</Form.Label>
              <Form.Control
                type="text"
                value={variant.sku}
                onChange={(e) => console.log('Handle SKU change')}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={variant.price}
                  onChange={(e) => console.log('Handle price change')}
                  required
                />
                <InputGroup.Text>VND</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Số lượng</Form.Label>
              <Form.Control
                type="number"
                value={variant.stock}
                onChange={(e) => console.log('Handle stock change')}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <hr />

        {/* Thuộc tính của biến thể, thông số kỹ thuật */}
        {/* <AttributesVariant /> */}
        <div>Preview render html attributes</div>
        <Button className="mb-3" onClick={handleShowModalForCreateAttribute}>Thêm thuộc tính</Button>
        {/* <Button className="mb-3" onClick={() => console.log('Handle add attribute')}>Thêm thuộc tính</Button> */}
        <hr />

        <MultiImageUpload
          selector={variantsImgsSelector}
          action={(images) => setImagesVariant({ variantIndex, images })}
        />
      </div>
    </>
  )
}

export default Variant;