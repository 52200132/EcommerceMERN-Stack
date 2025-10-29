import { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import slugify from 'slugify';
import parse from 'html-react-parser';

import MultiImageUpload from '../../components/products/multi-image-upload';
import Variants from 'Admin/components/products/variant/variants';

import { useDispatch } from 'react-redux';
import { setImages } from 'redux-tps/features/product-slice';
import { setShow, changeContent } from 'redux-tps/features/modal-slice';
import { createTriggerAction } from 'redux-tps/features/component-action-slice';

import { db } from 'indexed-db';
import { useLiveQuery } from 'dexie-react-hooks'
import z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import BackButton from 'Admin/components/back-btn';

const basicInfoSchema = z.object({
  product_name: z.string().min(1, 'Vui lòng nhập tên sản phẩm'),
  brand_id: z.any().refine(val => val && _.isObject(val) && !_.isEmpty(val), {
    message: 'Vui lòng chọn thương hiệu'
  }),
  hashtag: z.string().optional(),
  short_description: z.string().optional(),
  detail_description: z.string().optional(),
  is_active: z.boolean(),
});

const optionActions = {
  'create': {
    title: 'Thêm sản phẩm mới',
    'dd-no-content': 'Nhấn để thêm mô tả chi tiết',
    'dd-has-content': 'Nhấn để chỉnh sửa mô tả chi tiết',
  },
  'update': {
    title: 'Chỉnh sửa sản phẩm',
  },
  'read': {
    title: 'Xem sản phẩm',
  }
}

const CRUProduct = ({ action = 'create' }) => {
  const option = optionActions[action];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const brands = useLiveQuery(async () => await db.brands.toArray(), [], []);
  const hashtags = useLiveQuery(async () => await db.hashtags.toArray(), [], []);
  const [product, setProduct] = useState({
    product_name: '',
    brand_id: '',
    hashtag: '',
    quantity_sold: 0,
    price_min: 0,
    price_max: 0,
    short_description: '',
    detail_description: '',
    Images: [{ url: '', is_primary: true }],
    Variants: [{
      sku: '',
      price: 0,
      stock: 0,
      Images: [{ url: '', is_primary: true }],
      Attributes: [{ attribute: '', value: '', type: 'appearance' }]
    }],
    is_active: true,
  });
  const { register: basicRegister, control,
    getValues: basicGetValues,
    handleSubmit: basicHandleSubmit,
    formState: { errors: basicErrors } } =
    useForm({ resolver: zodResolver(basicInfoSchema), mode: 'all' });

  useEffect(() => {
    dispatch(createTriggerAction({ triggerKey: 'upload_action' }))
  }, [dispatch])

  const onHashtagsChange = (option) => {
    const target = {
      name: 'hashtag',
      value: option ? option.map(item => item.value).join('|') : ''
    };
    basicRegister("hashtag").onChange({ target });
  }

  const handleShowModalForCRUDetails = (e) => {
    e.preventDefault();
    dispatch(changeContent({
      title: 'Thêm mô tả chi tiết',
      componentName: 'TinyMCE'
    }));
    dispatch(setShow());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the product data to your API
    console.log('Submitting product:', product);
    // Call API to save product
  };

  console.log('RENDER: add-product');
  return (
    <>
      <BackButton />
      <Container className='tps-cru-product-page'>
        <Button onClick={() => { console.log(basicGetValues('hashtag')); }}>Test</Button>
        <h2 className="mb-4">Thêm sản phẩm mới</h2>

        <Form>
          <Card className="mb-4">
            <Card.Header>Thông tin cơ bản</Card.Header>
            <Card.Body>
              <Row>
                {/* Tên sản phẩm */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor='product_name'>Tên sản phẩm</Form.Label>
                    <Form.Control
                      {...basicRegister("product_name")}
                      isInvalid={!!basicErrors.product_name}
                    />
                    <Form.Text className="text-danger">
                      {basicErrors.product_name && basicErrors.product_name.message}
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Thương hiệu */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor='brand_id'>Thương hiệu</Form.Label>
                    <Controller
                      id='brand_id'
                      name='brand_id'
                      control={control}
                      render={({ field: { onChange, onBlur, ref } }) => (
                        <Select
                          classNamePrefix='tps'
                          inputRef={ref}
                          options={brands.map(brand => ({ value: brand, label: brand.brand_name }))}
                          styles={{
                            control: (base) => ({
                              ...base,
                              boxShadow: "var(--bs-box-shadow-inset)",
                              borderColor: basicErrors.brand_id ? 'var(--bs-form-invalid-border-color)' : 'var(--bs-border-color)',
                              cursor: 'text',
                              '&:hover': { borderColor: basicErrors.brand_id ? 'var(--bs-danger)' : 'var(--bs-border-color)' },
                            })
                          }}
                          placeholder="Chọn thương hiệu..."
                          isClearable={true}
                          onBlur={(option) => onBlur(option?.value)}
                          onChange={(option) => { console.log(option?.value); onChange(option?.value) }
                          }
                        />
                      )}
                    />
                    <Form.Text className="text-danger">
                      {basicErrors.brand_id && basicErrors.brand_id.message}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* Hashtag */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor='hashtag'>Hashtag</Form.Label>
                    <Form.Control hidden {...basicRegister('hashtag')} id='hashtag' />
                    <CreatableSelect
                      name='hashtag'
                      options={hashtags.map(tag => ({ value: tag?.tag_name, label: tag?.tag_name }))}
                      classNamePrefix='tps'
                      styles={{
                        control: (base) => ({
                          ...base,
                          boxShadow: "var(--bs-box-shadow-inset)",
                          cursor: 'text',
                        })
                      }}
                      filterOption={(option, inputValue) => {
                        const slug = slugify(inputValue, { lower: true, locales: 'vi', remove: /[*+~.()'"!:@]/g });
                        return option.data.label.includes(slug);
                      }}
                      getNewOptionData={(inVa) => {
                        const slug = slugify(inVa, { lower: true, locales: 'vi', remove: /[*+~.()'"!:@]/g });
                        const newTag = { value: slug, label: slug };
                        return newTag;
                      }}
                      isClearable={true}
                      onChange={onHashtagsChange}
                      placeholder=""
                      isMulti
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* Mô tả ngắn */}
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor='short_description'>Mô tả ngắn</Form.Label>
                    <Form.Control
                      rows={3}
                      as="textarea"
                      id='short_description'
                      {...basicRegister("short_description")}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* Mô tả chi tiết */}
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor='detail_description'>Mô tả chi tiết</Form.Label>
                    <Form.Control
                      readOnly
                      as='div'
                      className={`tps-detail-product-description ${basicGetValues('detail_description') ? 'has-content' : ''} d-flex align-items-center justify-content-center`}
                      id='detail_description'
                      title={basicGetValues('detail_description') ? option['dd-has-content'] : option['dd-no-content']}
                      {...basicRegister("detail_description")}
                      onClick={(e) => handleShowModalForCRUDetails(e)}
                    >
                      {basicGetValues('detail_description') ?
                        parse(basicGetValues('detail_description'))
                        :
                        <span className='text-secondary'>{option['dd-no-content']}</span>
                      }
                    </Form.Control>
                  </Form.Group>
                  {/* <Button variant="outline-primary" onClick={handleShowModalForEditDetails}>Chỉnh sửa mô tả chi tiết</Button> */}
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is-active"
                  label="Kích hoạt sản phẩm"
                  name="is_active"
                  checked={product.is_active}
                  onChange={(e) => setProduct({ ...product, is_active: e.target.checked })}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>

        <Form onSubmit={handleSubmit}>

          <Card className="mb-4">
            <Card.Header>Hình ảnh sản phẩm</Card.Header>
            <MultiImageUpload
              {...{ uploadsApi: true, uploadToServer: true }}
              selector={(state) => state.product.Images}
              action={images => setImages({ images })}
            />
            {/* <button onClick={() => { dispatch(setImages([])) }}>Lưu hình ảnh</button> */}
          </Card>

          <Card className="mb-4">
            <Card.Header>Phiên bản sản phẩm</Card.Header>
            <Card.Body>

              <Variants />

            </Card.Body>
          </Card>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button variant="secondary" className="me-md-2">Huỷ bỏ</Button>
            <Button variant="primary" type="submit">Lưu sản phẩm</Button>
          </div>
        </Form>

      </Container>
    </>
  );
};

export default CRUProduct;