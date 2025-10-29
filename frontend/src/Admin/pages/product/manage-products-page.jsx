import { useState, useEffect, useMemo } from 'react';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { useNavigate } from 'react-router-dom';
import {
  IoAdd,
  IoCloudUpload,
  IoCloudDownload,
  IoFilter,
  IoTrash,
  IoArchive,
  IoFolder,
} from 'react-icons/io5';

import TableProducts from 'Admin/components/products/table/table-products';

import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from 'services/product-api';
import { Button } from 'react-bootstrap';

const ManageProductsLayout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  // State management
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [showFilters, setShowFilters] = useState(false);
  // Filters state
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    status: [],
    hasVariants: 'all',
    stockRange: { min: '', max: '' },
    priceRange: { min: '', max: '' },
    updatedAt: { from: '', to: '' }
  });
  const { data, isLoading } = useGetProductsQuery({ page, pageSize });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    console.log('DATA: products changed');
    setProducts(data?.dt?.products ?? [])
  }, [data])

  const totalRow = useMemo(() => {
    console.log('DATA: total row changed');
    return data?.dt?.total
  }, [data?.dt?.total])

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý sản phẩm</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <Button variant='outline-primary' onClick={() => navigate('add-product')}>
            <IoAdd size={16} />
            Thêm sản phẩm
          </Button>
          <button className="btn btn-secondary" onClick={() => console.log('Import CSV')}>
            <IoCloudUpload size={16} />
            Import CSV
          </button>
          <button className="btn btn-secondary" onClick={() => console.log('Export CSV')}>
            <IoCloudDownload size={16} />
            Export CSV
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <IoFilter size={16} />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập tên, SKU hoặc slug…"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>

            <div className="filter-item">
              <label>Danh mục</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="fashion">Thời trang</option>
                <option value="electronics">Điện tử</option>
                <option value="home">Nhà cửa</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Trạng thái</label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters({ ...filters, status: values });
                }}
              >
                <option value="draft">Nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Có biến thể</label>
              <select
                value={filters.hasVariants}
                onChange={(e) => setFilters({ ...filters, hasVariants: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="yes">Có</option>
                <option value="no">Không</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={() => setFilters({
              q: '', category: '', status: [], hasVariants: 'all',
              stockRange: { min: '', max: '' },
              priceRange: { min: '', max: '' },
              updatedAt: { from: '', to: '' }
            })}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedProducts.length} đã chọn</span>
          <div className="bulk-actions">
            <button className="btn btn-sm" onClick={() => console.log('Bulk publish')}>
              <IoCloudUpload size={14} />
              Publish
            </button>
            <button className="btn btn-sm" onClick={() => console.log('Bulk unpublish')}>
              <IoCloudDownload size={14} />
              Unpublish
            </button>
            <button className="btn btn-sm" onClick={() => console.log('Bulk archive')}>
              <IoArchive size={14} />
              Lưu trữ
            </button>
            <button className="btn btn-sm" onClick={() => console.log('Bulk move')}>
              <IoFolder size={14} />
              Chuyển danh mục
            </button>
            <button className="btn btn-sm btn-destructive" onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa các sản phẩm đã chọn?')) {
                console.log('Bulk delete');
              }
            }}>
              <IoTrash size={14} />
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <TableProducts {...{ products, isLoading }} />

      {/* Phân trang */}
      <PaginationControl {...{
        page,
        between: 3,
        total: totalRow,
        limit: pageSize,
        changePage: (page) => {
          setPage(page)
        },
        next: true,
        last: true,
        ellipsis: 1
      }}
      />
    </>
  );
};

export default ManageProductsLayout;
