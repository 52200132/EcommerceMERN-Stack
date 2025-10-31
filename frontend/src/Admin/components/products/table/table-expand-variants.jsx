import { useReactTable, createColumnHelper, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { isArray, isObject } from "lodash";
import { Button } from "react-bootstrap";
import { IoPencil, IoTrash, IoAdd, IoAlertCircle } from "react-icons/io5";
import slugify from "slugify";
import { formatCurrency } from 'utils/format';

const columnHelper = createColumnHelper();

const variantStatusMap = {
  true: { label: 'Active', color: 'success' },
  false: { label: 'Inactive', color: 'secondary' }
};

const columns = [
  // Ảnh
  columnHelper.display({
    id: 'thumbnail',
    header: 'Ảnh',
    meta: { thStyle: { width: '60px' } },
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
    },
  }),
  // Tên biến thể
  // columnHelper.accessor('name', {
  //   header: 'Tên biến thể',
  //   cell: ({ row, getValue }) => (
  //     <div>
  //       <div className="fw-medium">{getValue()}</div>
  //       <small className="text-muted">
  //         {row.original.options?.Color && `${row.original.options.Color} `}
  //         {row.original.options?.Size && row.original.options.Size}
  //       </small>
  //     </div>
  //   ),
  // }),
  // SKU
  columnHelper.accessor('sku', {
    header: 'SKU',
    meta: { thStyle: { width: '140px' } },
    cell: ({ getValue }) => <code className="text-dark">{getValue()}</code>,
  }),

  // Giá
  columnHelper.accessor('price', {
    header: 'Giá',
    meta: { thStyle: { width: '120px' } },
    cell: ({ getValue }) => formatCurrency(getValue()),
  }),

  // Tồn
  columnHelper.accessor('stock', {
    header: 'Tồn',
    meta: { thStyle: { width: '80px' } },
    cell: ({ getValue }) => <span className="text-center">{getValue()}</span>,
  }),

  // Trạng thái
  columnHelper.accessor('is_active', {
    header: 'Trạng thái',
    meta: { thStyle: { width: '120px' } },
    cell: ({ getValue }) => (
      <span className={`badge bg-${variantStatusMap[getValue()]?.color === 'success' ? 'success' : 'secondary'}`}>
        {variantStatusMap[getValue()]?.label}
      </span>
    ),
  }),

  // Actions
  columnHelper.display({
    id: 'actions',
    header: '',
    meta: { thStyle: { width: '80px' } },
    cell: ({ row }) => (
      <div className="d-flex gap-1 justify-content-center">
        <Button
          variant="tps-btn"
          className="btn btn-sm btn-link text-muted p-0"
          title="Sửa biến thể"
          onClick={() => console.log('Edit variant', row.original._id)}
        >
          <IoPencil size={14} />
        </Button>
        <Button
          variant="tps-btn"
          className="btn btn-sm btn-link text-danger p-0"
          title="Xóa biến thể"
          onClick={() => {
            if (window.confirm('Xóa biến thể này?')) {
              console.log('Delete variant', row.original._id);
            }
          }}
        >
          <IoTrash size={14} />
        </Button>
      </div>
    ),
  }),
];

const TableExpandVariants = ({ variants, productId }) => {

  const table = useReactTable({
    data: variants || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log('RENDER: table-expand-variants');
  return (

    <div className="variants-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Biến thể</h5>
        <Button
          className="btn btn-sm btn-outline-primary text-white"
          onClick={() => console.log('Add variant', productId)}
        >
          <IoAdd size={14} className="me-1" />
          Thêm biến thể
        </Button>
      </div>

      {variants && variants.length > 0 ? (
        <table className="table table-sm table-bordered bg-white mb-0">
          <thead className="table-light">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={header.column.columnDef.meta?.thStyle}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-5 bg-white rounded">
          <IoAlertCircle size={32} className="text-muted mb-2" />
          <h5>Chưa có biến thể</h5>
          <p className="text-muted mb-3">Thêm biến thể để quản lý tồn kho và giá theo tùy chọn.</p>
          <Button
            className="btn btn-sm btn-outline-primary"
            onClick={() => console.log('Add variant', productId)}
          >
            <IoAdd size={14} className="me-1" />
            Thêm biến thể
          </Button>
        </div>
      )}
    </div>

  );
};

export default TableExpandVariants;