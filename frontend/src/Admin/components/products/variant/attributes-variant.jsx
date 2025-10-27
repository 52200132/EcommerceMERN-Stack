import { Table, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-bootstrap";
import { FaTrashArrowUp } from "react-icons/fa6";
import parse from 'html-react-parser';

import Loading from "Admin/components/loading";
import { addAttribute, changeAttributeValue, deleteAttribute } from "redux-tps/features/product-slice";
import { useTpsSelector } from "custom-hooks/use-tps-selector";

const AttributesVariant = (props) => {
  const { selector, variantIndex } = props;

  const dispatch = useDispatch();

  const attributes = useSelector(selector) || [];
  const { html_text_attributes = '' } = useTpsSelector((state) => state.product.Variants[variantIndex],
    { includeProps: ['html_text_attributes'] });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // handle functions
  const handleAddAttribute = () => {
    dispatch(addAttribute({ variantIndex }))
  }
  const handleDeleteAttribute = (attributeIndex) => {
    dispatch(deleteAttribute({ variantIndex, attributeIndex }))
  }
  const handleChangeValueAttribute = (e, attributeIndex, key) => {
    const checkboxType = e.target.type === 'checkbox';
    const value = checkboxType ? e.target.checked : e.target.value;
    dispatch(changeAttributeValue({ value, variantIndex, attributeIndex, key }))
  }

  // console.log('HTML-RENDER: ', html_text_attributes);

  console.log('RENDER: attributes-variant');
  if (loading) return <Loading />;
  return (
    <>
      <Row className="mb-3">
        <Col xl={6} lg={12}>
          <Button size="sm" variant="outline-secondary" onClick={handleAddAttribute}>+ Thêm thuộc tính</Button>
          <Table size="sm" className="mb-3">
            <thead>
              <tr>
                <th>Tên thuộc tính</th>
                <th>Giá trị</th>
                <th>Loại</th>
                <th>Nhóm thuộc tính</th>
                <th>Hiển thị</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, attrIndex) => (
                <tr key={`attr-${variantIndex}-${attrIndex}`}>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={attr.attribute}
                      onChange={(e) => handleChangeValueAttribute(e, attrIndex, 'attribute')}
                    />
                  </td>

                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={attr.value}
                      onChange={(e) => handleChangeValueAttribute(e, attrIndex, 'value')}
                    />
                  </td>

                  <td>
                    <Form.Select
                      size="sm"
                      value={attr.type}
                      onChange={(e) => handleChangeValueAttribute(e, attrIndex, 'type')}
                    >
                      <option value="appearance">Appearance</option>
                      <option value="technology">Technology</option>
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={attr.group_attribute}
                      onChange={(e) => handleChangeValueAttribute(e, attrIndex, 'group_attribute')}
                    />
                  </td>

                  <td>
                    <Form.Check
                      size="sm"
                      type="checkbox"
                      name={`show-in-table-${attrIndex}`}
                      checked={attr.is_show_in_table}
                      onChange={(e) => handleChangeValueAttribute(e, attrIndex, 'is_show_in_table')}
                    />
                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteAttribute(attrIndex)}
                    >
                      <FaTrashArrowUp />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button size="sm" variant="outline-secondary" className="ms-2" onClick={() => console.log(attributes)}>Lưu thuộc tính</Button>
        </Col>
        <Col xl={6} lg={12}>
          {parse(html_text_attributes)}
        </Col>
      </Row>
    </>
  )
}

export default AttributesVariant;