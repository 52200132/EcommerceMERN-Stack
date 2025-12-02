import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { Badge, Button, Form, Nav } from 'react-bootstrap';
import { IoAdd, IoFilter, IoSearch, IoRefresh, IoStorefront, IoLayers, IoPricetag } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';

import TableProducts from 'admins/components/products/table/table-products';
import Variant from 'admins/components/products/variant/variant';
import {
  useCreateCategoryAdminMutation,
  useCreateVariantAdminMutation,
  useCreateWarehouseAdminMutation,
  useDeleteCategoryAdminMutation,
  useDeleteVariantAdminMutation,
  useDeleteWarehouseAdminMutation,
  useGetCategoriesAdminQuery,
  useGetProductsAdminQuery,
  useGetWarehousesByProductQuery,
  useUpdateCategoryAdminMutation,
  useUpdateVariantAdminMutation,
} from 'services/admin-services';
import { userModalDialogStore, useShallow } from '#custom-hooks';
import ConfirmDialog from 'admins/components/common/confirm-dialog';
import WarehouseForm from 'admins/components/products/forms/warehouse-form';

import './manage-products-layout.scss';

const PAGE_SIZES = [5, 10, 20, 50];

const ManageProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.max(parseInt(searchParams.get('limit') || '10', 10), 1);
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const inventoryProductId = searchParams.get('inventoryProductId') || '';
  const inventorySku = searchParams.get('sku') || '';
  const categorySearch = searchParams.get('categorySearch') || '';

  const [searchText, setSearchText] = useState(qParam);
  const [categorySearchText, setCategorySearchText] = useState(categorySearch);

  const updateParams = (entries, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  useEffect(() => setSearchText(qParam), [qParam]);
  useEffect(() => setCategorySearchText(categorySearch), [categorySearch]);

  const queryArgs = useMemo(() => ({
    page,
    limit,
    q: qParam,
    categoryId: categoryParam !== 'all' ? categoryParam : undefined,
  }), [page, limit, qParam, categoryParam]);

  const { data, isLoading, isFetching, refetch } = useGetProductsAdminQuery(queryArgs);
  const products = data?.dt?.products || [];
  const total = data?.dt?.total || 0;

  useEffect(() => {
    const totalPages = Math.max(Math.ceil((total || 0) / limit), 1);
    if (page > totalPages) {
      updateParams({ page: totalPages }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, limit]);

  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetCategoriesAdminQuery({ includeProductStats: true });
  const categories = categoriesData?.dt || [];
  const filterableCategories = useMemo(() => categories.filter((cate) => !cate.isVirtual), [categories]);

  const selectedInventoryProductId = inventoryProductId || (products[0]?._id ?? '');
  const {
    data: warehouseData,
    isFetching: isWarehouseFetching,
    refetch: refetchWarehouses,
  } = useGetWarehousesByProductQuery(selectedInventoryProductId, {
    skip: activeTab !== 'inventory' || !selectedInventoryProductId,
  });
  const warehouses = warehouseData?.dt || [];

  const { push, reset: resetModal } = userModalDialogStore(useShallow((zs) => ({
    push: zs.push,
    reset: zs.reset,
  })));
  const openConfirmDialog = useCallback(({ title, message, confirmText = 'Xác nhận', variant = 'danger', onConfirm }) => {
    push({
      title,
      bodyComponent: ConfirmDialog,
      bodyProps: { message },
      size: 'sm',
      buttons: [
        <Button key="cancel" variant="secondary" onClick={resetModal}>Hủy</Button>,
        <Button
          key="confirm"
          variant={variant}
          onClick={async () => {
            await onConfirm?.();
            resetModal();
          }}
        >
          {confirmText}
        </Button>,
      ],
    });
  }, [push, resetModal]);

  const [createVariant] = useCreateVariantAdminMutation();
  const [updateVariant] = useUpdateVariantAdminMutation();
  const [deleteVariant] = useDeleteVariantAdminMutation();
  const [createCategory] = useCreateCategoryAdminMutation();
  const [updateCategory] = useUpdateCategoryAdminMutation();
  const [deleteCategory] = useDeleteCategoryAdminMutation();
  const [createWarehouse, { isLoading: isCreatingWarehouse }] = useCreateWarehouseAdminMutation();
  const [removeWarehouse] = useDeleteWarehouseAdminMutation();

  useEffect(() => {
    if (activeTab === 'inventory' && !inventoryProductId && products[0]?._id) {
      updateParams({ inventoryProductId: products[0]._id }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, inventoryProductId, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchText.trim() || null }, true);
  };
  const handleCategoryChange = (value) => updateParams({ category: value }, true);
  const handleLimitChange = (value) => updateParams({ limit: value }, true);
  const handlePageChange = (nextPage) => updateParams({ page: nextPage }, false);
  const handleResetFilters = () => {
    setSearchText('');
    updateParams({ q: null, category: null }, true);
  };

  const handleAddVariant = (product) => {
    push({
      title: `Thêm biến thể - ${product.product_name}`,
      bodyComponent: Variant,
      bodyProps: {
        variantIndex: 0,
        initialVariant: { sku: '', price: 0, cost_price: 0, is_active: true },
        showAttributes: false,
        showImages: false,
        submitLabel: 'Lưu biến thể',
        onSubmit: async (values) => {
          try {
            await createVariant({ productId: product._id, payload: values }).unwrap();
            toast.success('Đã thêm biến thể');
            resetModal();
            refetch();
          } catch (error) {
            toast.error(error?.em || 'Không thể tạo biến thể');
          }
        },
      },
    });
  };

  const handleEditVariant = (product, variant) => {
    push({
      title: `Cập nhật biến thể ${variant.sku}`,
      bodyComponent: Variant,
      bodyProps: {
        variantIndex: 0,
        initialVariant: variant,
        showAttributes: false,
        showImages: false,
        submitLabel: 'Cập nhật',
        onSubmit: async (values) => {
          try {
            await updateVariant({ productId: product._id, sku: variant.sku, payload: values }).unwrap();
            toast.success('Đã cập nhật biến thể');
            resetModal();
            refetch();
          } catch (error) {
            toast.error(error?.em || 'Không thể cập nhật biến thể');
          }
        },
      },
    });
  };

  const handleDeleteVariant = (product, variant) => {
    openConfirmDialog({
      title: 'Xóa biến thể',
      message: (
        <p>
          Bạn có chắc muốn xóa SKU <strong>{variant.sku}</strong> của sản phẩm <strong>{product.product_name}</strong>?
        </p>
      ),
      confirmText: 'Xóa biến thể',
      onConfirm: async () => {
        try {
          await deleteVariant({ productId: product._id, sku: variant.sku }).unwrap();
          toast.success('Đã xóa biến thể');
          refetch();
        } catch (error) {
          toast.error(error?.em || 'Không thể xóa biến thể');
        }
      }
    });
  };

  const openCategoryModal = (category) => {
    if (category?.isVirtual) {
      toast.info('Danh mục này được tổng hợp tự động từ sản phẩm chưa phân loại.');
      return;
    }
    push({
      title: category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục',
      bodyComponent: CategoryForm,
      bodyProps: {
        defaultValue: category || { category_name: '' },
        onSubmit: async (values) => {
          try {
            if (category?._id) {
              await updateCategory({ id: category._id, payload: values }).unwrap();
              toast.success('Đã cập nhật danh mục');
            } else {
              await createCategory(values).unwrap();
              toast.success('Đã thêm danh mục');
            }
            resetModal();
            refetchCategories();
          } catch (error) {
            toast.error(error?.em || 'Không thể lưu danh mục');
          }
        },
      },
    });
  };

  const handleDeleteCategory = (category) => {
    if (category?.isVirtual) {
      toast.info('Không thể xóa danh mục ảo.');
      return;
    }
    openConfirmDialog({
      title: 'Xóa danh mục',
      message: `Xóa danh mục "${category.category_name}"?`,
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await deleteCategory(category._id).unwrap();
          toast.success('Đã xóa danh mục');
          refetchCategories();
        } catch (error) {
          toast.error(error?.em || 'Không thể xóa danh mục');
        }
      }
    });
  };

  const handleAddWarehouse = () => {
    if (!selectedInventoryProductId) return;
    push({
      title: 'Thêm kho hàng',
      bodyComponent: WarehouseForm,
      bodyProps: {
        onSubmit: async (values) => {
          try {
            await createWarehouse({
              productId: selectedInventoryProductId,
              payload: { ...values, warehouse_variants: [] }
            }).unwrap();
            toast.success('Đã thêm kho');
            resetModal();
            refetchWarehouses();
            refetch();
          } catch (error) {
            toast.error(error?.em || 'Không thể tạo kho mới');
          }
        },
        submitting: isCreatingWarehouse,
      },
    });
  };

  const handleDeleteWarehouse = async (warehouse) => {
    openConfirmDialog({
      title: 'Xóa kho hàng',
      message: `Xóa kho "${warehouse.name}" khỏi sản phẩm này?`,
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await removeWarehouse({ productId: selectedInventoryProductId, warehouseId: warehouse._id }).unwrap();
          toast.success('Đã xóa kho');
          refetchWarehouses();
        } catch (error) {
          toast.error(error?.em || 'Không thể xóa kho');
        }
      }
    });
  };

  const filteredCategories = useMemo(() => {
    const keyword = categorySearchText.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((cate) => cate.category_name.toLowerCase().includes(keyword));
  }, [categories, categorySearchText]);

  const productStats = useMemo(() => {
    return products.reduce((acc, prod) => {
      if (prod.category_id) {
        acc[prod.category_id] = (acc[prod.category_id] || 0) + 1;
      }
      return acc;
    }, {});
  }, [products]);

  const categoryRows = useMemo(() => {
    return filteredCategories.map((cate) => {
      const countFromApi = typeof cate.productCount === 'number' ? cate.productCount : null;
      const total = countFromApi ?? productStats[cate._id] ?? 0;
      return {
        ...cate,
        productCount: total,
      };
    });
  }, [filteredCategories, productStats]);

  const categoryColumns = useMemo(() => ([
    {
      header: 'Danh mục',
      accessorKey: 'category_name',
    },
    {
      header: 'Sản phẩm',
      accessorKey: 'productCount',
      meta: { thStyle: { width: '120px' } },
    },
    {
      id: 'actions',
      header: '',
      meta: { thStyle: { width: '120px' } },
      cell: ({ row }) => (
        <div className="d-flex gap-2 justify-content-end">
          <Button size="sm" variant="outline-secondary" onClick={() => openCategoryModal(row.original)} disabled={row.original.isVirtual}>
            Sửa
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteCategory(row.original)} disabled={row.original.isVirtual}>
            Xóa
          </Button>
        </div>
      ),
    },
  ]), [handleDeleteCategory, openCategoryModal]);

  const categoryTable = useReactTable({
    data: categoryRows,
    columns: categoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const inventoryFilter = inventorySku.trim().toLowerCase();
  const inventoryRows = useMemo(() => {
    return warehouses
      .map((wh) => {
        const variants = wh.warehouse_variants || [];
        const filteredVariants = inventoryFilter
          ? variants.filter((v) => (v.sku || '').toLowerCase().includes(inventoryFilter))
          : variants;
        const totalStock = filteredVariants.reduce((sum, v) => {
          const available = (v.quantity || 0) - (v.waiting_for_delivery || 0);
          return sum + Math.max(available, 0);
        }, 0);
        const preview = filteredVariants.slice(0, 3).map((v) => `${v.sku} (${(v.quantity || 0) - (v.waiting_for_delivery || 0)})`).join(', ');
        return {
          ...wh,
          variantCount: filteredVariants.length,
          totalStock,
          preview: preview || 'Chưa có SKU',
        };
      })
      .filter((row) => inventoryFilter ? row.variantCount > 0 : true);
  }, [warehouses, inventoryFilter]);

  const inventoryColumns = useMemo(() => ([
    { header: 'Kho', accessorKey: 'name' },
    { header: 'Địa điểm', accessorKey: 'location' },
    { header: 'Số SKU', accessorKey: 'variantCount', meta: { thStyle: { width: '120px' } } },
    { header: 'Tồn khả dụng', accessorKey: 'totalStock', meta: { thStyle: { width: '140px' } } },
    {
      header: 'Danh sách SKU',
      accessorKey: 'preview',
    },
    {
      id: 'warehouse-actions',
      header: '',
      meta: { thStyle: { width: '120px' } },
      cell: ({ row }) => (
        <div className="d-flex justify-content-end">
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteWarehouse(row.original)}>
            Xóa
          </Button>
        </div>
      )
    }
  ]), [handleDeleteWarehouse]);

  const inventoryTable = useReactTable({
    data: inventoryRows,
    columns: inventoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isProductBusy = isLoading || isFetching;

  return (
    <div className="tps-manage-products-layout">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý sản phẩm</h1>
        </div>
        <Button variant="outline-secondary" onClick={() => refetch()}>
          <IoRefresh size={16} />
        </Button>
      </div>

      <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => updateParams({ tab: key, page: 1 })} className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="products"><IoPricetag className="me-1" />Tất cả sản phẩm</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="categories"><IoLayers className="me-1" />Danh mục sản phẩm</Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'products' && (
        <>
          <div className="filters-panel">
            <form className="filters-grid" onSubmit={handleSearchSubmit}>
              <div className="filter-item search-box">
                <label htmlFor="search-products">Tìm kiếm</label>
                <div className="search-input">
                  <IoSearch size={16} />
                  <input
                    id="search-products"
                    type="text"
                    placeholder="Tên, SKU..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Button type="submit" size="sm" variant="primary">
                    Tìm
                  </Button>
                </div>
              </div>

              <div className="filter-item">
                <label htmlFor="category-filter">Danh mục</label>
                <Form.Select
                  id="category-filter"
                  value={categoryParam}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isLoadingCategories}
                >
                  <option value="all">Tất cả</option>
                  {filterableCategories.map((cate) => (
                    <option key={cate._id} value={cate._id}>{cate.category_name}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="filter-actions">
                <Button variant="outline-secondary" type="button" onClick={handleResetFilters}>
                  <IoFilter size={16} /> Xóa lọc
                </Button>
              </div>
            </form>
          </div>

          <div className="toolbar mb-3">
            <div className="toolbar-left">
              <Button variant="primary" onClick={() => navigate('add-product')}>
                <IoAdd size={16} />
                Thêm sản phẩm
              </Button>
            </div>
            <div className="toolbar-right">
              <Badge bg="light" text="dark">Tổng: {total}</Badge>
            </div>
          </div>

          <TableProducts
            products={products}
            isLoading={isProductBusy}
            onAddVariant={handleAddVariant}
            onEditVariant={handleEditVariant}
            onDeleteVariant={handleDeleteVariant}
          />

          <div className="pagination-bar">
            <div className="page-size-row">
              <Form.Select
                className="w-auto"
                size="sm"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size} / trang</option>
                ))}
              </Form.Select>
            </div>

            <div className="pagination-row">
              <PaginationControl
                page={page}
                between={3}
                total={total}
                limit={limit}
                changePage={handlePageChange}
                next
                last
                ellipsis={1}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-item search-box">
                <label htmlFor="category-search">Tìm kiếm danh mục</label>
                <div className="search-input">
                  <IoSearch size={16} />
                  <input
                    id="category-search"
                    type="text"
                    placeholder="Tên danh mục..."
                    value={categorySearchText}
                    onChange={(e) => {
                      setCategorySearchText(e.target.value);
                      updateParams({ categorySearch: e.target.value || null }, false);
                    }}
                  />
                </div>
              </div>
              <div className="filter-actions">
                <Button variant="primary" onClick={() => openCategoryModal(null)}>
                  <IoAdd size={16} /> Thêm danh mục
                </Button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table table-hover">
              <thead className="table-light">
                {categoryTable.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} style={header.column.columnDef.meta?.thStyle}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {categoryRows.length === 0 ? (
                  <tr>
                    <td colSpan={categoryTable.getAllColumns().length} className="text-center py-4 text-muted">
                      Chưa có danh mục
                    </td>
                  </tr>
                ) : (
                  categoryTable.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const CategoryForm = ({ defaultValue, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValue,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>Tên danh mục</Form.Label>
        <Form.Control
          {...register('category_name', { required: 'Vui lòng nhập tên danh mục' })}
          isInvalid={!!errors.category_name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.category_name?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <div className="d-flex justify-content-end">
        <Button type="submit" variant="success">
          Lưu
        </Button>
      </div>
    </Form>
  );
};

export default ManageProductsPage;
