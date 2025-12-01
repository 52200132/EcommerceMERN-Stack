import { useRef } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';

import { clearProductState, setImages } from 'redux-tps/features/index-features';
import { BasicInfo, MultiImageUpload, Variants } from 'admins/components/products';
import { store } from 'redux-tps/store';
import { useCreateProductAdminMutation, useUpdateProductAdminMutation } from 'services/admin-services';

import BackButton from 'admins/components/back-btn';
import { useRenderCount, useUploadersRegistry } from '#custom-hooks';

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
  useRenderCount('CRUProduct', 'both');
  const backBtnRef = useRef(null);
  const dispatch = store.dispatch;
  const option = optionActions[action];
  const selector = (state) => state.product;
  const [createProduct] = useCreateProductAdminMutation();
  const [updateProductM] = useUpdateProductAdminMutation();

  const getUploaderFuncs = useUploadersRegistry(zs => zs.getUploaderFuncs);

  const handleSave = async () => {
    await Promise.all(getUploaderFuncs().map(uploadFunc => {
      if (typeof uploadFunc === 'function') {
        return uploadFunc();
      }
      return Promise.resolve();
    }));
    const product = store.getState().product;
    if (action === 'create') {
      const result = await createProduct(product).unwrap();
      console.log('createData', result);

      if (result.ec === 0) {
        dispatch(clearProductState());
        backBtnRef.current && backBtnRef.current.click();
      }
    } else if (action === 'update') {
      const result = await updateProductM(product).unwrap();
      if (result.ec === 0) {
        dispatch(clearProductState());
        backBtnRef.current && backBtnRef.current.click();
      }
    }
  }

  return (
    <>
      {/* <Button onClick={handTestUpload}>Test upload</Button> */}
      <BackButton ref={backBtnRef} />
      <Container className='tps-cru-product-page'>
        <h2 className="mb-4">Thêm sản phẩm mới</h2>
        <Form>

          <BasicInfo {...{ option, selector }} />

          <Card className="mb-4">
            <Card.Header className='h5'>Hình ảnh sản phẩm</Card.Header>
            <Card.Body>
              <MultiImageUpload
                {...{ uploadToServer: true }}
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
