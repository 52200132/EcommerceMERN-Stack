import { Button, Col, Dropdown, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CiViewTable, CiViewList } from "react-icons/ci";
import { FiEdit3 } from "react-icons/fi";
import { GiCancel } from "react-icons/gi";

import z from "zod";

import { setImagesVariant, setShow, changeContent, updateVariantDraft, deleteAttributes } from "redux-tps/features/index-features";
import { useDebounceSubscribeValues, useSelectorStore, useTpsSelector } from "#custom-hooks";
import { VARIANTSELECTOR_INDEX } from "admins/selectors/product";
import { deformatCurrency, formatCurrency } from '#utils';

import { useEffect, useRef } from "react";
import { IoTrashBinSharp } from "react-icons/io5";
import { store } from "redux-tps/store";
import AttributesReview from "./attributes-review";
import MultiImageUpload from "../multi-image-upload";
import { productInits } from "redux-tps/features/product-slice";

const OPTION_ACTIONS = {
  'create': {
    title: 'Thêm sản phẩm mới',
    'no-content': 'Nhấn để thêm mô tả chi tiết',
    'has-content': 'Nhấn để chỉnh sửa mô tả chi tiết',
  },
  'update': {
    title: 'Chỉnh sửa sản phẩm',
    'has-content': 'Nhấn để hỉnh sửa mô tả chi tiết',
  },
  'read': {
    title: 'Xem sản phẩm',
    'has-content': 'Xem chi tiết mô tả sản phẩm',
  }
}

export const variantSchema = z.object({
  sku: z.string().min(1, 'Vui lòng nhập mã SKU'),
  price: z.preprocess(
    (val) => {
      if (/[^0-9.,]/.test(val)) return NaN
      if (typeof val === 'string' && val[0] === '0' && val.length > 1) return NaN
      return deformatCurrency(val)
    },
    z.number("Không đúng định dạng").min(0, 'Giá phải lớn hơn hoặc bằng 0').default(0)
  ),
  cost_price: z.preprocess(
    (val) => {
      if (/[^0-9.,]/.test(val)) return NaN
      if (typeof val === 'string' && val[0] === '0' && val.length > 1) return NaN
      return deformatCurrency(val)
    },
    z.number("Không đúng định dạng").min(0, 'Giá nhập phải lớn hơn hoặc bằng 0').default(0)
  ),
  is_active: z.boolean().default(true),
  html_text_attributes: z.string().optional(),
});

const Variant = ({
  selector,
  variantIndex,
  action = 'create',
  handleAttributesClick,
  initialVariant,
  onSubmit,
  showAttributes = true,
  showImages = true,
  submitLabel = 'Lưu'
}) => {
  const renderCount = useRef(1);
  const dispatch = useDispatch();
  const isStandalone = Boolean(onSubmit) || Boolean(initialVariant);
  const resolvedSelector = selector || (!isStandalone && VARIANTSELECTOR_INDEX(variantIndex));
  const variant = isStandalone
    ? { ...productInits.variant, ...(initialVariant || {}) }
    : store.getState().product.Variants[variantIndex] || productInits.variant;

  const { register, subscribe, getValues, formState: { errors }, handleSubmit } = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: variant,
    mode: 'all',
  });
  const variantsImgsSelector = (state) => state.product.Variants?.[variantIndex || 0]?.Images;

  useDebounceSubscribeValues((values) => {
    if (isStandalone || typeof variantIndex !== 'number') return;
    dispatch(updateVariantDraft({
      variantIndex,
      object: values,
    }))
  }, subscribe, 1000);
  useEffect(() => { ++renderCount.current; return () => { renderCount.current = 0; }; });
  console.log('RENDER: variant-' + variantIndex + '-count-' + renderCount.current);

  const shouldShowAttributes = showAttributes && !isStandalone && resolvedSelector;
  const shouldShowImages = showImages && !isStandalone && typeof variantIndex === 'number';
  const handleSubmitForm = onSubmit ? handleSubmit(onSubmit) : undefined;
  const titleIndex = typeof variantIndex === 'number' ? variantIndex + 1 : '';

  const content = (
    <div key={`variant-${variantIndex ?? 'standalone'}`} className="border rounded p-3 mb-4">
      <h6>Biến thể {titleIndex}</h6>
      <Row>
        {/* Mã SKU */}
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor={`sku-${variantIndex}`}>Mã SKU</Form.Label>
            <Form.Control
              id={`sku-${variantIndex}`}
              {...register("sku")}
              isInvalid={!!errors.sku}
            />
            <Form.Text className="text-danger">
              {errors.sku && errors.sku.message}
            </Form.Text>
          </Form.Group>
        </Col>

        {/* Giá */}
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor={`price-${variantIndex}`}>Giá</Form.Label>
            <Form.Control
              id={`price-${variantIndex}`}
              {...register('price')}
              isInvalid={!!errors.price}
              onFocus={(e) => { e.target.value = getValues('price') }}
              onBlur={(e) => {
                const val = e.target.value;
                if (/[^0-9.,]/.test(val) || (typeof val === 'string' && val[0] === '0' && val.length > 1)) {
                  register('price').onBlur(e);
                  return
                }
                e.target.value = val ? formatCurrency(getValues('price')) : '';
              }}
            />
            <Form.Text className="text-danger">
              {errors.price && errors.price.message}
            </Form.Text>
          </Form.Group>
        </Col>

        {/* Giá nhập */}
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor={`cost_price-${variantIndex}`}>Giá nhập</Form.Label>
            <Form.Control
              id={`cost_price-${variantIndex}`}
              {...register('cost_price')}
              isInvalid={!!errors.cost_price}
              onFocus={(e) => { e.target.value = getValues('cost_price') }}
              onBlur={(e) => {
                const val = e.target.value;
                if (/[^0-9.,]/.test(val) || (typeof val === 'string' && val[0] === '0' && val.length > 1)) {
                  register('cost_price').onBlur(e);
                  return;
                }
                e.target.value = val ? formatCurrency(getValues('cost_price')) : '';
              }}
            />
            <Form.Text className="text-danger">
              {errors.cost_price && errors.cost_price.message}
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor={`is_active-${variantIndex}`}>Hiển thị</Form.Label>
            <Form.Check
              id={`is_active-${variantIndex}`}
              type="switch"
              {...register('is_active')}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Thuộc tính của biến thể, thông số kỹ thuật */}
      {shouldShowAttributes && (
        <>
          <h6>Thuộc tính hiển thị</h6>
          <Row>
            <Col md={12}>
              <ReviewAttributesBlock {...{ selector: resolvedSelector, variantIndex, action, handleAttributesClick }} />
            </Col>
          </Row>
        </>
      )}

      {shouldShowImages && (
        <>
          <h6>Hình ảnh của biến thể</h6>
          <MultiImageUpload
            selector={variantsImgsSelector}
            action={(images) => setImagesVariant({ variantIndex, images })}
          />
        </>
      )}

      {onSubmit && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="success" type="submit">
            {submitLabel}
          </Button>
        </div>
      )}
    </div>
  );

  return onSubmit ? (
    <Form onSubmit={handleSubmitForm} noValidate>
      {content}
    </Form>
  ) : (
    <>{content}</>
  )
}

const ReviewAttributesBlock = ({ selector, variantIndex, action, handleAttributesClick }) => {
  const dispatch = useDispatch();
  const option = OPTION_ACTIONS[action];
  const actionsRef = useRef(null);
  const setSelector = useSelectorStore((zs) => zs.setSelector);
  const getSelector = useSelectorStore((zs) => zs.getSelector);
  const attributesSelector = (state) => selector(state).Attributes

  const { html_text_attributes = '' } = useTpsSelector(selector, { includeProps: ['html_text_attributes'] });

  const handleShowModalForCreateAttribute = () => {
    if (handleAttributesClick) {
      handleAttributesClick();
      return;
    }
    const selectorKey = `attributesSelector-${variantIndex}`
    if (!getSelector(selectorKey)) setSelector(selectorKey, attributesSelector)
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
  const handleShowActions = (e) => {
    const [x, y] = [e.clientX, e.clientY];
    const rect = e.target.getBoundingClientRect();
    const offsetX = x - rect.left;
    const offsetY = y - rect.top;
    if (actionsRef.current) {
      actionsRef.current.style.left = `${offsetX}px`;
      actionsRef.current.style.top = `${offsetY}px`;
      actionsRef.current.style.display = 'block';
    }
  }
  const handleDeleteAttributes = () => {
    dispatch(deleteAttributes({ variantIndex }));
  }

  return (
    <Form.Group className="mb-3">
      <Form.Control
        readOnly
        title={option['has-content']}
        className={`tps-attributes-variant ${html_text_attributes ? 'has-content gradient-soft' : ''}`}
        id={`attributes-${variantIndex}`}
        as='div'
        onClick={handleShowActions}
      >
        {html_text_attributes ?
          <>
            <span className='edit-dd-text text-muted'><i>{option['has-content']}</i></span>
            <div style={{ opacity: 0.5 }}>
              <AttributesReview htmlTextAttributes={html_text_attributes} />
            </div>
          </>
          :
          <div className='d-flex justify-content-center align-items-center h-100'>
            <span className='text-secondary'>{option['no-content']}</span>
          </div>
        }
      </Form.Control>
      {action && (
        <Dropdown>
          <div className="dropdown-menu" ref={actionsRef} style={{
            transform: "translate(0, -70%)",
          }}>
            <Dropdown.Item className="attribute-action-item"><CiViewList size={15} /> Xem tất cả</Dropdown.Item>
            <Dropdown.Item className="attribute-action-item"><CiViewTable size={15} /> Xem thuộc tính hiển thị</Dropdown.Item>
            {action !== 'read' &&
              (<Dropdown.Item className="attribute-action-item"
                onClick={handleShowModalForCreateAttribute}
              ><FiEdit3 size={15} /> Chỉnh sửa</Dropdown.Item>)
            }
            {html_text_attributes &&
              (<Dropdown.Item className="attribute-action-item"
                onClick={handleDeleteAttributes}
              >
                <IoTrashBinSharp size={15} /> Xóa
              </Dropdown.Item>)
            }
            <Dropdown.Item className="attribute-action-item"
              onClick={() => { if (actionsRef.current) actionsRef.current.style.display = 'none'; }}
            >
              <GiCancel size={15} /> Đóng</Dropdown.Item>
          </div>
        </Dropdown>
      )}
    </Form.Group>
  )
}

export default Variant;
