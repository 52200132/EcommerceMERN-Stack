import { Fragment, useRef, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { isArray, isObject } from 'lodash';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getExpandedRowModel,
} from '@tanstack/react-table';
import {
  IoAdd,
  IoEllipsisVertical,
  IoPencil,
  IoCopy,
  IoTrash,
  IoChevronDown,
  IoChevronForward,
  IoAlertCircle,
  IoImage,
} from 'react-icons/io5';

import slugify from 'slugify';

import { formatDateTime, formatCurrency } from 'utils/format';
import TableExpandVariants from './table-expand-variants';
import { useDispatch } from 'react-redux';
import { useDeleteProductMutation, useLazyGetProductByIdQuery, useUpdateProductMutation } from 'services/product-api';
import { useNavigate } from 'react-router-dom';
import { updateProduct } from 'redux-tps/features';
import { confirmation } from 'utils/confirmation';
import { db } from 'indexed-db';

const columnHelper = createColumnHelper();
// Get stock badge
const getStockBadge = (stock) => {
  if (stock <= 0) {
    return { variant: 'destructive', label: `Hết hàng (${stock})` };
  }
  if (stock <= 5) {
    return { variant: 'warning', label: `Sắp hết (${stock})` };
  }
  return { variant: 'default', label: stock };
};
// Status map
const statusMap = {
  draft: { label: 'Nháp', color: 'secondary' },
  published: { label: 'Đã xuất bản', color: 'success' },
  archived: { label: 'Lưu trữ', color: 'muted' }
};
const columHelper = createColumnHelper();


const TableProducts = ({ products, isLoading }) => {
  const dispatch = useDispatch();
  const [triggerGetProductById] = useLazyGetProductByIdQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const navigate = useNavigate()
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expanded, setExpanded] = useState([]);

  const columnsRef = useRef([
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          name="select-all"
          type="checkbox"
          className="form-check-input"
          ref={el => { if (typeof el?.indeterminate === 'boolean') el.indeterminate = !el.checked && table.getIsSomeRowsSelected() }}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      meta: { thStyle: { width: '40px' } },
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),
    // ảnh thumbnail
    columHelper.display({
      id: 'thumbnail', header: 'Ảnh',
      meta: { thStyle: { width: '80px' } },
      accessorFn: (row) => {
        const Images = row.Images
        if (isArray(Images)) {
          const primaryImg = Images.find((img) => img?.is_primary)
          if (primaryImg) {
            return { url: primaryImg.url, alt: slugify(row?.product_name || 'tps-default') }
          }
        } else if (isObject(Images)) { // object chứa { url, alt }
          return Images
        }
        return { url: '', alt: '' }
      },
      cell: ({ getValue }) => {
        const { url, alt } = getValue();
        return (
          <img
            src={url}
            alt={alt}
            className="img-thumbnail tps-thumbnail-customize"
          />
        )
      }
    }),
    // Tên sản phẩm product_name và nút mở rộng biến thể
    columnHelper.accessor('product_name', {
      header: 'Tên sản phẩm',
      meta: { thClassName: 'sortable' },
      cell: ({ row, getValue }) => (
        <div className="d-flex  gap-2">
          {row.getCanExpand() && (
            <Button
              variant='tps-btn'
              className="btn btn-sm btn-link p-0 text-muted"
              onClick={row.getToggleExpandedHandler()}
              aria-label="Mở rộng biến thể"
            >
              {row.getIsExpanded() ? (
                <IoChevronDown size={16} />
              ) : (
                <IoChevronForward size={16} />
              )}
            </Button>
          )}
          <div>
            <div className="fw-semibold">{getValue()}</div>
          </div>
        </div>
      )
    }),
    // giá price_min - price_max
    {
      id: 'price', header: 'Giá',
      meta: { thClassName: 'sortable' },
      accessorFn: (row) => ({ price_max: row.price_max, price_min: row.price_min }),
      cell: ({ getValue }) => `${formatCurrency(getValue().price_min)} - ${formatCurrency(getValue().price_max)}`
    },
    // Tồn kho stock
    columnHelper.display({
      id: 'stock',
      header: 'Tồn kho',
      meta: { thClassName: 'sortable', thStyle: { width: '120px' } },
      accessorFn: (row) => {
        let totalStock = 0;
        for (const variant of row.Variants) {
          totalStock += variant.stock;
        }
        return totalStock;
      },
      cell: ({ getValue }) => (
        <span className={`badge bg-${getStockBadge(getValue()).variant === 'destructive' ? 'danger' : getStockBadge(getValue()).variant === 'warning' ? 'warning' : 'success'}`}>
          {getStockBadge(getValue()).label}
        </span>
      )
    }),
    // số luong biến thể Variants[]
    {
      id: 'numVariants', header: 'Biến thể',
      meta: { thStyle: { width: '100px' } },
      accessorFn: (row) => row.Variants.length,
      cell: ({ getValue }) => (<span className="badge bg-light text-dark">{getValue()}</span>)
    },
    // trang thai is_active
    {
      accessorKey: 'is_active', header: 'Trạng thái',
      meta: { thClassName: 'sortable', thStyle: { width: '140px' } },
    },
    // cập nhật updatedAt
    {
      accessorKey: 'updated_at', header: 'Cập nhật',
      meta: { thClassName: 'sortable', thStyle: { width: '160px' } },
      cell: ({ getValue }) => formatDateTime(getValue())
    },
    // các thao tác edit, delete, duplicate
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <Dropdown align="end">
          <Dropdown.Toggle bsPrefix="tps-dropdown-toggle"
            as={'button'}
            className="btn btn-sm btn-link text-muted p-0"
            id={`dropdown-${row.original.id}`}
          >
            <IoEllipsisVertical size={16} />
          </Dropdown.Toggle>
          <Dropdown.Menu as="ul">
            <Dropdown.Item as="li" onClick={() => handleEditProductClick(row.original._id)}>
              <IoPencil size={14} className="me-2" />
              Sửa
            </Dropdown.Item>
            <Dropdown.Item as="li" onClick={() => console.log("Duplicate", row.original._id)}>
              <IoCopy size={14} className="me-2" />
              Nhân bản
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as="li"
              className="text-danger"
              onClick={() => handleDeleteProductClick(row.original._id, row.original.product_name)}
            >
              <IoTrash size={14} className="me-2" />
              Xóa
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )
    }
  ]);

  const table = useReactTable({
    data: products,
    columns: columnsRef.current,
    state: {
      expanded,
      rowSelection: selectedProducts,
    },
    onRowSelectionChange: setSelectedProducts,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand: (row) => row.original.Variants && row.original.Variants.length > 0,
  });


  // handle function
  const handleEditProductClick = async(productId) => {
    console.log('Edit product', productId);
    triggerGetProductById(productId)
      .unwrap()
      .then(async (data) => {
        const defaultBrandOption = await db.brands.get(data.dt.brand_id);
        dispatch(updateProduct({...data.dt, defaultBrandOption: { value: defaultBrandOption._id, label: defaultBrandOption.brand_name } }));
        navigate(`/admin/manage-products/edit-product/${productId}`);
      })
      .catch((error) => {
        console.error('Failed to fetch product:', error);
      });
  }
  const handleDeleteProductClick = async (productId, productName) => {
    const confirmed = await confirmation({
      title: 'Xác nhận xóa sản phẩm',
      message: (<p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{productName}</strong> không?</p>),
      confirmText: 'Có',
      cancelText: 'Không',
      variant: 'danger',
    })
    if (confirmed) {
      deleteProduct(productId);
    }
  }

  console.log('RENDER: table-products');
  return (
    <>
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : products && products.length === 0 ? (
          <div className="empty-state">
            <IoAlertCircle size={48} />
            <h3>Chưa có sản phẩm</h3>
            <p>Tạo sản phẩm đầu tiên để bắt đầu bán hàng.</p>
            <button className="btn btn-primary" onClick={() => console.log('Create product')}>
              <IoAdd size={16} />
              Thêm sản phẩm
            </button>
          </div>
        ) : (
          <table className="table table-hover">
            <thead className='table-light'>
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
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    onDoubleClick={row.getToggleExpandedHandler()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr>
                      <td colSpan={table.getVisibleLeafColumns().length} className="p-3 bg-light">
                        <TableExpandVariants
                          variants={row.original.Variants}
                          productId={row.original._id}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default TableProducts