import React, { useState, useEffect, useMemo } from 'react';
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
import { useDispatch } from 'react-redux';
import { changeContent, setShow } from 'redux-tps/features/modal-slice';

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

  useEffect(() => {
    dispatch(changeContent({
      componentName: 'EditVariant',
      title: 'Chỉnh sửa biến thể'
    }))
    dispatch(setShow())
  }, []);

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

  // Get price display
  const getPriceDisplay = (product) => {
    if (product.price != null) {
      return formatCurrency(product.price);
    }
    if (product.minVariantPrice === product.maxVariantPrice) {
      return formatCurrency(product.minVariantPrice);
    }
    return `${formatCurrency(product.minVariantPrice)} – ${formatCurrency(product.maxVariantPrice)}`;
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
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'secondary' }
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
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
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
            <thead className="table-light">
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedProducts.length === products.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ width: '80px' }}>Ảnh</th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Tên sản phẩm
                  {sortConfig.key === 'name' && (
                    <span className="sort-indicator ms-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th style={{ width: '160px' }} className="sortable" onClick={() => handleSort('price')}>
                  Giá
                  {sortConfig.key === 'price' && (
                    <span className="sort-indicator ms-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th style={{ width: '120px' }} className="sortable" onClick={() => handleSort('stock')}>
                  Tồn kho
                  {sortConfig.key === 'stock' && (
                    <span className="sort-indicator ms-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th style={{ width: '100px' }}>Biến thể</th>
                <th style={{ width: '140px' }}>Trạng thái</th>
                <th style={{ width: '160px' }} className="sortable" onClick={() => handleSort('updatedAt')}>
                  Cập nhật
                  {sortConfig.key === 'updatedAt' && (
                    <span className="sort-indicator ms-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th style={{ width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Main Product Row */}
                  <tr className={selectedProducts.includes(product.id) ? 'table-active' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                    </td>
                    <td>
                      {product.mainImageUrl ? (
                        <img 
                          src={product.mainImageUrl} 
                          alt={product.name}
                          className="img-thumbnail"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light text-muted d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', borderRadius: '4px' }}>
                          <IoImage size={24} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {product.variantsCount > 0 && (
                          <button
                            className="btn btn-sm btn-link p-0 text-muted"
                            onClick={() => toggleRowExpansion(product.id)}
                            aria-label="Mở rộng biến thể"
                          >
                            {expandedRows.includes(product.id) ? (
                              <IoChevronDown size={16} />
                            ) : (
                              <IoChevronForward size={16} />
                            )}
                          </button>
                        )}
                        <div>
                          <div className="fw-semibold">{product.name}</div>
                          <small className="text-muted">
                            SKU: {product.sku || '—'} · Slug: {product.slug}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{getPriceDisplay(product)}</td>
                    <td>
                      <span className={`badge bg-${getStockBadge(product.totalStock).variant === 'destructive' ? 'danger' : getStockBadge(product.totalStock).variant === 'warning' ? 'warning' : 'secondary'}`}>
                        {getStockBadge(product.totalStock).label}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{product.variantsCount}</span>
                    </td>
                    <td>
                      <span className={`badge bg-${statusMap[product.status].color === 'success' ? 'success' : statusMap[product.status].color === 'secondary' ? 'secondary' : 'light text-dark'}`}>
                        {statusMap[product.status].label}
                      </span>
                    </td>
                    <td>{formatDateTime(product.updatedAt)}</td>
                    <td>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-link text-muted p-0" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          <IoEllipsisVertical size={16} />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button className="dropdown-item" onClick={() => console.log('Edit', product.id)}>
                              <IoPencil size={14} className="me-2" />
                              Sửa
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" onClick={() => console.log('Duplicate', product.id)}>
                              <IoCopy size={14} className="me-2" />
                              Nhân bản
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => {
                                if (window.confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động không thể hoàn tác.')) {
                                  console.log('Delete', product.id);
                                }
                              }}
                            >
                              <IoTrash size={14} className="me-2" />
                              Xóa
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Variants Table */}
                  {expandedRows.includes(product.id) && (
                    <tr>
                      <td colSpan="9" className="p-3 bg-light">
                        <div className="variants-container">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Biến thể</h5>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => console.log('Add variant', product.id)}
                            >
                              <IoAdd size={14} className="me-1" />
                              Thêm biến thể
                            </button>
                          </div>

                          {product.variants && product.variants.length > 0 ? (
                            <table className="table table-sm table-bordered bg-white mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: '60px' }}>Ảnh</th>
                                  <th>Tên biến thể</th>
                                  <th style={{ width: '140px' }}>SKU</th>
                                  <th style={{ width: '120px' }}>Giá</th>
                                  <th style={{ width: '80px' }}>Tồn</th>
                                  <th style={{ width: '120px' }}>Trạng thái</th>
                                  <th style={{ width: '80px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((variant) => (
                                  <tr key={variant.id}>
                                    <td>
                                      {variant.mainImageUrl ? (
                                        <img 
                                          src={variant.mainImageUrl} 
                                          alt={variant.name}
                                          className="img-thumbnail"
                                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="bg-light text-muted d-flex align-items-center justify-content-center" 
                                             style={{ width: '40px', height: '40px', borderRadius: '4px' }}>
                                          <IoImage size={16} />
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <div>
                                        <div className="fw-medium">{variant.name}</div>
                                        <small className="text-muted">
                                          {variant.options.Color && `${variant.options.Color} `}
                                          {variant.options.Size && variant.options.Size}
                                        </small>
                                      </div>
                                    </td>
                                    <td>
                                      <code className="text-dark">{variant.sku}</code>
                                    </td>
                                    <td>{formatCurrency(variant.price)}</td>
                                    <td className="text-center">{variant.stock}</td>
                                    <td>
                                      <span className={`badge bg-${variantStatusMap[variant.status].color === 'success' ? 'success' : 'secondary'}`}>
                                        {variantStatusMap[variant.status].label}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-1">
                                        <button
                                          className="btn btn-sm btn-link text-muted p-0"
                                          title="Sửa biến thể"
                                          onClick={() => console.log('Edit variant', variant.id)}
                                        >
                                          <IoPencil size={14} />
                                        </button>
                                        <button
                                          className="btn btn-sm btn-link text-danger p-0"
                                          title="Xóa biến thể"
                                          onClick={() => {
                                            if (window.confirm('Xóa biến thể này?')) {
                                              console.log('Delete variant', variant.id);
                                            }
                                          }}
                                        >
                                          <IoTrash size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-5 bg-white rounded">
                              <IoAlertCircle size={32} className="text-muted mb-2" />
                              <h5>Chưa có biến thể</h5>
                              <p className="text-muted mb-3">Thêm biến thể để quản lý tồn kho và giá theo tùy chọn.</p>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => console.log('Add variant', product.id)}
                              >
                                <IoAdd size={14} className="me-1" />
                                Thêm biến thể
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
