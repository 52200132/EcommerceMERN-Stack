import React, { useState, useEffect, useMemo, use } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  IoSearch,
  IoAdd,
  IoCloudUpload,
  IoCloudDownload,
  IoFilter,
  IoEllipsisVertical,
  IoPencil,
  IoCopy,
  IoTrash,
  IoOpenOutline,
  IoChevronDown,
  IoChevronForward,
  IoArchive,
  IoFolder,
  IoAlertCircle,
  IoImage
} from 'react-icons/io5';

import './manage-products-layout.scss';
import TableProducts from './table-products';

import { useDispatch } from 'react-redux';

/**
 * Component quản lý sản phẩm với biến thể
 * Hỗ trợ: mở rộng dòng, lọc, sắp xếp, phân trang, bulk actions
 */
const ManageProductsLayout = () => {
  const dispatch = useDispatch()
  // State management

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
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

  // useEffect(() => {
  //   dispatch(changeContent({
  //     componentName: 'EditVariant',
  //     title: 'Chỉnh sửa biến thể'
  //   }))
  //   dispatch(setShow())
  // }, []);

  // Mock data - Replace with API call
  useEffect(() => {
    loadProducts();
  }, [filters, sortConfig, currentPage, pageSize]);

  const loadProducts = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setProducts(getMockProducts());
      setLoading(false);
    }, 500);
  };

  // Toggle row expansion
  const toggleRowExpansion = (productId) => {
    setExpandedRows(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select/deselect products
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  // Sorting
  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Set variant as default
  const handleSetDefaultVariant = (productId, variantId) => {
    // TODO: API call to update default variant
    console.log('Set default variant:', { productId, variantId });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDateTime = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

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

  const variantStatusMap = {
    true: { label: 'Active', color: 'success' },
    false: { label: 'Inactive', color: 'secondary' }
  };

  return (
    <div className="manage-products-layout">
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumbs">
          <span>Dashboard</span>
          <span className="separator">/</span>
          <span>Catalog</span>
          <span className="separator">/</span>
          <span className="current">Sản phẩm</span>
        </div>
        <h1 className="page-title">Quản lý sản phẩm</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={() => console.log('Create product')}>
            <IoAdd size={16} />
            Thêm sản phẩm
          </button>
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
      <TableProducts />
      

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, products.length)} của {products.length}
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </button>
            <span className="page-number">Trang {currentPage}</span>
            <button
              className="btn btn-sm"
              disabled={currentPage * pageSize >= products.length}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </button>
          </div>
          <div className="page-size-selector">
            <label>Hiển thị:</label>
            <select value={pageSize} onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data function
const getMockProducts = () => [
  {
    id: 'p_001',
    name: 'Áo thun Basic',
    slug: 'ao-thun-basic',
    sku: null,
    category: 'Thời trang > Áo',
    status: 'published',
    mainImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    price: null,
    minVariantPrice: 99000,
    maxVariantPrice: 129000,
    totalStock: 42,
    variantsCount: 6,
    updatedAt: '2025-10-20T12:30:00Z',
    variants: [
      {
        id: 'v_001',
        productId: 'p_001',
        name: 'Áo thun Basic - Đen / M',
        options: { Color: 'Đen', Size: 'M' },
        sku: 'TS-BLK-M',
        price: 99000,
        stock: 8,
        status: 'active',
        mainImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
        isDefault: true
      },
      {
        id: 'v_002',
        productId: 'p_001',
        name: 'Áo thun Basic - Trắng / L',
        options: { Color: 'Trắng', Size: 'L' },
        sku: 'TS-WHT-L',
        price: 99000,
        stock: 12,
        status: 'active',
        mainImageUrl: null,
        isDefault: false
      },
      {
        id: 'v_003',
        productId: 'p_001',
        name: 'Áo thun Basic - Xanh / S',
        options: { Color: 'Xanh', Size: 'S' },
        sku: 'TS-BLU-S',
        price: 129000,
        stock: 5,
        status: 'active',
        mainImageUrl: null,
        isDefault: false
      }
    ]
  },
  {
    id: 'p_002',
    name: 'Quần Jean Slim Fit',
    slug: 'quan-jean-slim-fit',
    sku: 'JEAN-001',
    category: 'Thời trang > Quần',
    status: 'published',
    mainImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200',
    price: 450000,
    minVariantPrice: null,
    maxVariantPrice: null,
    totalStock: 0,
    variantsCount: 0,
    updatedAt: '2025-10-18T09:15:00Z',
    variants: []
  },
  {
    id: 'p_003',
    name: 'Giày Sneaker Sport',
    slug: 'giay-sneaker-sport',
    sku: null,
    category: 'Thời trang > Giày',
    status: 'draft',
    mainImageUrl: null,
    price: null,
    minVariantPrice: 350000,
    maxVariantPrice: 550000,
    totalStock: 3,
    variantsCount: 4,
    updatedAt: '2025-10-15T14:20:00Z',
    variants: [
      {
        id: 'v_004',
        productId: 'p_003',
        name: 'Giày Sneaker - Đen / 39',
        options: { Color: 'Đen', Size: '39' },
        sku: 'SNK-BLK-39',
        price: 350000,
        stock: 1,
        status: 'active',
        mainImageUrl: null,
        isDefault: true
      },
      {
        id: 'v_005',
        productId: 'p_003',
        name: 'Giày Sneaker - Trắng / 42',
        options: { Color: 'Trắng', Size: '42' },
        sku: 'SNK-WHT-42',
        price: 550000,
        stock: 2,
        status: 'inactive',
        mainImageUrl: null,
        isDefault: false
      }
    ]
  }
];

export default ManageProductsLayout;
