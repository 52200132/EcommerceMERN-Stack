import { useEffect, useRef } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';

import { initialState, setImages, updateProduct } from 'redux-tps/features';
import { BasicInfo, MultiImageUpload, Variants } from 'Admin/components/products';
import { store } from 'redux-tps/store';
import { useCreateProductMutation, useUpdateProductMutation } from 'services/product-api';

import BackButton from 'Admin/components/back-btn';

const optionActions = {
  'create': {
    bottomBtn: {
      hidden: true,
      text: 'Lưu sản phẩm',
    },
  },
  'update': {
    bottomBtn: {
      hidden: true,
      text: 'Cập nhật sản phẩm',
    },
    title: 'Chỉnh sửa sản phẩm',
  },
  'read': {
    bottomBtn: {
      hidden: false,
    },
    title: 'Xem sản phẩm',
  }
}

const CRUProduct = ({ action = 'create' }) => {
  const backBtnRef = useRef(null);
  const dispatch = store.dispatch;
  const option = optionActions[action];
  const selector = (state) => state.product;
  const [createProduct] = useCreateProductMutation();
  const [updateProductM] = useUpdateProductMutation();

  const handleSave = async () => {
    const product = store.getState().product;
    if (action === 'create') {
      const result = await createProduct(product).unwrap();
      console.log('createData', result);

      if (result.ec === 0) {
        dispatch(updateProduct(initialState));
        backBtnRef.current && backBtnRef.current.click();
      }
    } else if (action === 'update') {
      const result = await updateProductM(product).unwrap();
      if (result.ec === 0) {
        dispatch(updateProduct(initialState));
        backBtnRef.current && backBtnRef.current.click();
      }
    }
  }

  console.log('RENDER: add-product');
  return (
    <>
      <BackButton ref={backBtnRef} />
      <Container className='tps-cru-product-page'>
        <h2 className="mb-4">Thêm sản phẩm mới</h2>
        <Form>

          <BasicInfo {...{ option, selector }} />

          <Card className="mb-4">
            <Card.Header className='h5'>Hình ảnh sản phẩm</Card.Header>
            <Card.Body>
              <MultiImageUpload
                {...{ uploadsApi: true, uploadToServer: true }}
                selector={(state) => state.product.Images}
                action={images => setImages({ images })}
              />
            </Card.Body>
          </Card>

          <Variants {...{ selector }} />

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button variant="secondary" className="me-md-2"
              onClick={() => backBtnRef.current && backBtnRef.current.click()}
            >
              Thoát
            </Button>
            <Button variant="success"
              hidden={!option.bottomBtn.hidden}
              onClick={handleSave}
            >
              {option.bottomBtn.text}
            </Button>
          </div>

        </Form>
      </Container>
    </>
  );
};

export default CRUProduct;