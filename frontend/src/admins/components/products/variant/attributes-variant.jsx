import { Table, Button, Row, Col, Form } from "react-bootstrap";
import { useEffect, useMemo, Fragment } from "react";
import { useDispatch } from "react-redux";
import { FaTrashArrowUp } from "react-icons/fa6";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import z from "zod";

import { productInits, setAttributes } from "redux-tps/features/product-slice";
import { store } from "redux-tps/store";
import { useDebounceSubscribeValues } from "#custom-hooks";

import AttributesReview from "./attributes-review";

const attributesSchema = z.object({
  attributes: z.array(
    z.object({
      attribute: z.string().min(1, 'Vui lòng nhập tên thuộc tính'),
      value: z.string().min(1, 'Vui lòng nhập giá trị thuộc tính'),
      type: z.string().optional(),
      group_attribute: z.string().optional(),
      is_show_in_table: z.boolean().optional(),
    })
  )
})
const columnHelper = createColumnHelper();

let renderCount = 0

const AttributesVariant = ({ selector, variantIndex }) => {
  const dispatch = useDispatch();
  const attributes = selector(store.getState())
  const { register, subscribe, control, formState: { errors } } = useForm({
    resolver: zodResolver(attributesSchema),
    defaultValues: { attributes: attributes },
    mode: 'all',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });
  const columns = useMemo(() => ([
    columnHelper.accessor('attribute', {
      header: 'Tên thuộc tính',
      cell: ({ row }) => (
        <Form.Control
          {...register(`attributes.${row.index}.attribute`)}
          isInvalid={!!errors?.attributes?.[row.index]?.attribute}
        />
      ),
    }),
    columnHelper.accessor('value', {
      header: 'Giá trị',
      cell: ({ row }) => (
        <Form.Control
          {...register(`attributes.${row.index}.value`)}
          isInvalid={!!errors?.attributes?.[row.index]?.value}
        />
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Loại',
      cell: ({ row }) => (
        <Form.Select {...register(`attributes.${row.index}.type`)}>
          <option value="technology">technology</option>
          <option value="appearance">appearance</option>
        </Form.Select>
      ),
    }),
    columnHelper.accessor('group_attribute', {
      header: 'Nhóm thuộc tính',
      cell: ({ row }) => (
        <Form.Control {...register(`attributes.${row.index}.group_attribute`)} />
      ),
    }),
    columnHelper.accessor('is_show_in_table', {
      header: 'Hiển thị',
      cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          {...register(`attributes.${row.index}.is_show_in_table`)}
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline-danger"
        onClick={() => handleDeleteAttribute(row.index)}
        >
          <FaTrashArrowUp />
        </Button>
      ),
    }),
  ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [register, errors]);
  const table = useReactTable({
    data: fields || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => (!!errors?.attributes?.[row.index]),
  });

  // handle functions
  const handleAddAttribute = () => {
    append(productInits.attribute);
  }
  const handleDeleteAttribute = (attributeIndex) => {
    remove(attributeIndex);
  }

  useDebounceSubscribeValues((values) => {
    dispatch(setAttributes({ 
      variantIndex, 
      attributes: values.attributes 
    }));
    return true; // đã lưu
  }, subscribe, 1000);

  useEffect(() => { return () => renderCount = 0 }, [])
  renderCount++
  console.log('RENDER: attributes-variant-' + renderCount);
  // if (loading) return <Loading />;
  return (
    <Form>
      <Row className="mb-3">
        <Col xl={6} lg={12}>
          <Button size="sm" variant="outline-secondary" onClick={handleAddAttribute}>+ Thêm thuộc tính</Button>
          <Table size="sm" hover className="tps-attributes-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      style={header.column.columnDef.meta?.thStyle}
                      className={header.column.columnDef.meta?.thClassName}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const canExpand = row.getCanExpand()
                let trEx
                if (errors?.attributes && errors?.attributes?.[row.index]) {
                  const ers = errors?.attributes?.[row.index]
                  trEx = Object.keys(ers).map((key, i) => (
                    <Form.Text key={`err-${row.index}-${i}`} className="text-danger d-inline-block mx-1">
                      <div>{ers[key]?.message}</div>
                    </Form.Text>
                  ))
                }
                return (
                  <Fragment key={row.id}>
                    <tr>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {canExpand && trEx && (
                      <tr>
                        <td style={{ fontSize: '13px' }} colSpan={table.getVisibleLeafColumns().length} className="bg-light">
                          {trEx}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </Table>
        </Col>
        <Col xl={6} lg={12}>
          <h6>Bảng thông số kỹ thuật được hiển thị</h6>
          <AttributesReview selector={(state) => state.product.Variants[variantIndex]} />
        </Col>
      </Row>
    </Form>
  )
}

export default AttributesVariant;