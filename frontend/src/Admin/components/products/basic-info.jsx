import { Card, Form, Col, Row } from "react-bootstrap";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from 'dexie-react-hooks'
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { zodResolver } from '@hookform/resolvers/zod';

import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import slugify from 'slugify';
import parse from 'html-react-parser';
import { z } from "zod";
import _ from 'lodash';

import { updateProduct } from 'redux-tps/features';
import { useDebounceSubscribeValues, useTpsGetState, useTpsSelector } from 'custom-hooks';
import { db } from 'indexed-db';

const optionActions = {
  create: {
    title: 'Thêm sản phẩm mới',
    'no-content': 'Nhấn để thêm mô tả chi tiết',
    'has-content': 'Nhấn để chỉnh sửa mô tả chi tiết',
  },
  read: {

  },
  update: {

  }
}

const basicInfoSchema = z.object({
  product_name: z.string().min(1, 'Vui lòng nhập tên sản phẩm'),
  brand_id: z.string().min(1, 'Vui lòng chọn thương hiệu'),
  hashtag: z.string().optional(),
  short_description: z.string().min(1, 'Vui lòng nhập mô tả ngắn'),
  detail_description: z.string().optional(),
  is_active: z.boolean(),
});

let rerenderCount = 0
const BasicInfo = ({ selector, action = 'create' }) => {
  const dispatch = useDispatch();
  const product = useTpsGetState(selector, { includeProps: ['product_name', 'brand_id', 'hashtag', 'short_description', 'detail_description', 'is_active', 'defaultBrandOption'] });
  const brandsOptions = useLiveQuery(async () => {
    const [array, productBrand] = await Promise.all([
      db.brands.toArray().then(brands => brands.map(brand => ({ value: brand._id, label: brand.brand_name }))),
      product?.brand_id ? db.brands.get(product.brand_id) : null
    ]);
    const defaultOption = productBrand ? { value: productBrand._id, label: productBrand.brand_name } : null; 
    return { array: array, defaultOption: defaultOption };
  }, [], { array: [], defaultOption: {} });
  const hashtags = useLiveQuery(async () => await db.hashtags.toArray(), [], []);
  const { register, control, getValues, subscribe, formState: { errors } } = useForm({
    resolver: zodResolver(basicInfoSchema),
    mode: 'all',
    defaultValues: product
  });
  
  const onHashtagsChange = (option) => {
    const target = {
      name: 'hashtag',
      value: option ? option.map(item => item.value).join('|') : ''
    };
    register("hashtag").onChange({ target });
    console.log('Hashtags changed:', target.value);
  }

  useDebounceSubscribeValues((productBasicInfo) => {
    dispatch(updateProduct(productBasicInfo));
    return true;
  }, subscribe, 1000);

  rerenderCount++;
  useEffect(() => { console.log('FM: basic-info'); return () => rerenderCount = 0 }, []);
  console.log('RENDER: basic-info-' + rerenderCount);
  return (
    <Card className="mb-4">
      <Card.Header className='h5'>Thông tin cơ bản</Card.Header>
      <Card.Body>
        <Row>
          {/* Tên sản phẩm */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='product_name'>Tên sản phẩm</Form.Label>
              <Form.Control
                id='product_name'
                {...register("product_name")}
                isInvalid={!!errors.product_name}
              />
              <Form.Text className="text-danger">
                {errors.product_name && errors.product_name.message}
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Thương hiệu */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='brand_id'>Thương hiệu</Form.Label>
              <Form.Control hidden id='brand_id' />
              <Controller
                id='brand_id'
                name='brand_id'
                control={control}
                render={({ field: { onChange, onBlur, ref } }) => (
                  <Select
                    classNamePrefix='tps'
                    inputRef={ref}
                    options={brandsOptions.array}
                    defaultValue={product?.defaultBrandOption || null}
                    styles={{
                      control: (base) => ({
                        ...base,
                        boxShadow: "var(--bs-box-shadow-inset)",
                        borderColor: errors.brand_id ? 'var(--bs-form-invalid-border-color)' : 'var(--bs-border-color)',
                        cursor: 'text',
                        '&:hover': { borderColor: errors.brand_id ? 'var(--bs-danger)' : 'var(--bs-border-color)' },
                      })
                    }}
                    placeholder="Chọn thương hiệu..."
                    isClearable={true}
                    onBlur={(option) => onBlur(option?.value)}
                    onChange={(option) => onChange(option?.value || '')}
                  />
                )}
              />
              <Form.Text className="text-danger">
                {errors.brand_id && errors.brand_id.message}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Hashtag */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor='hashtag'>Hashtag</Form.Label>
              <Form.Control hidden {...register('hashtag')} id='hashtag' />
              <CreatableSelect
                name='hashtag'
                defaultValue={getValues('hashtag') ? getValues('hashtag').split('|').map(tag => ({ value: tag, label: tag })) : []}
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
                isInvalid={!!errors.short_description}
                {...register("short_description")}
              />
              <Form.Text className="text-danger">
                {errors.short_description && errors.short_description.message}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Mô tả chi tiết */}
          <Col md={12}>
            <DetailsDescriptionPreview {...{ selector, action }} />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Check
            label="Kích hoạt sản phẩm"
            type="switch"
            inline={true}
            {...register('is_active')}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  )
}

const DetailsDescriptionPreview = ({ selector, action }) => {
  const option = optionActions[action];
  const { detail_description } = useTpsSelector(selector, { includeProps: ['detail_description'] });
  const navigate = useNavigate();

  const handleShowForCRUDetails = (e) => {
    e.preventDefault();
    navigate('description');
  };

  console.log('RENDER: details-description-preview')
  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor='detail_description'>Mô tả chi tiết</Form.Label>
      <Form.Control hidden id='detail_description' />
      <Form.Control
        readOnly
        as='div'
        className={`tps-detail-product-description ${detail_description ? 'has-content gradient-soft' : ''}`}
        title={detail_description ? option['has-content'] : option['no-content']}
        onClick={(e) => handleShowForCRUDetails(e)}
      >
        {detail_description ?
          <>
            <span className='edit-dd-text text-muted'><i>{option['has-content']}</i></span>
            <div style={{ opacity: 0.5 }}>
              {parse(detail_description)}
            </div>
          </>
          :
          <div className='d-flex justify-content-center align-items-center h-100'>
            <span className='text-secondary'>{option['no-content']}</span>
          </div>
        }
      </Form.Control>
    </Form.Group>
  )
}

export default BasicInfo;