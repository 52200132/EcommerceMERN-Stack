import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, Button, Container, Form, Spinner } from "react-bootstrap";
import slugify from "slugify";
import {
  IoArrowDownCircleOutline,
  IoFilterSharp,
  IoPricetagOutline,
  IoRefresh,
  IoSearch,
  IoStar,
  IoFlash
} from "react-icons/io5";

import { formatCurrency } from "#utils";
import { useGetProductFilterQuery } from "#services/product-services";
import { axiosInstance } from "services/axios-config";

import "./products-filter-page.scss";

const PAGE_SIZE = 15;

const sortOptions = [
  { value: "quantity_sold_desc", label: "Phổ biến nhất", hint: "Ưu tiên sản phẩm bán chạy", server: true },
  { value: "name_asc", label: "Tên A → Z", server: true },
  { value: "name_desc", label: "Tên Z → A", server: true },
  { value: "price_asc", label: "Giá tăng dần", server: true },
  { value: "price_desc", label: "Giá giảm dần", server: true },
];

const ratingOptions = [
  { value: 4.5, label: "Từ 4.5 ★" },
  { value: 4, label: "Từ 4 ★" },
  { value: 3, label: "Từ 3 ★" },
];

const ProductsFilterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "all";
  const selectedBrands = searchParams.getAll("brand");
  const sortParam = searchParams.get("sort") || "quantity_sold_desc";
  const priceMinParam = searchParams.get("price_min") || "";
  const priceMaxParam = searchParams.get("price_max") || "";
  const ratingParam = searchParams.get("rating") || "";

  const [searchValue, setSearchValue] = useState(qParam);
  const [priceDraft, setPriceDraft] = useState({ min: priceMinParam, max: priceMaxParam });
  const [products, setProducts] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => setSearchValue(qParam), [qParam]);
  useEffect(() => setPriceDraft({ min: priceMinParam, max: priceMaxParam }), [priceMinParam, priceMaxParam]);

  useEffect(() => {
    let mounted = true;
    axiosInstance.get("/brands")
      .then((res) => {
        if (!mounted) return;
        const names = (res?.dt || [])
          .map((brand) => brand?.brand_name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }));
        setBrandOptions(names);
      })
      .catch(() => {
        if (mounted) setBrandOptions([]);
      });
    return () => { mounted = false; };
  }, []);

  const updateParams = useCallback((nextEntries, resetPage = true) => {
    console.log('updateParams called');
    const next = new URLSearchParams(searchParams);
    Object.entries(nextEntries).forEach(([key, value]) => {
      next.delete(key);
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => next.append(key, item));
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const activeSort = sortOptions.find((opt) => opt.value === sortParam) || sortOptions[0];
  const priceMinNumber = priceMinParam !== "" && !Number.isNaN(Number(priceMinParam)) ? Number(priceMinParam) : undefined;
  const priceMaxNumber = priceMaxParam !== "" && !Number.isNaN(Number(priceMaxParam)) ? Number(priceMaxParam) : undefined;
  const minRating = ratingParam && !Number.isNaN(Number(ratingParam)) ? Number(ratingParam) : 0;

  const queryArgs = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    q: qParam || undefined,
    brand_names: selectedBrands.length ? selectedBrands : undefined,
    category_name: categoryParam !== "all" ? categoryParam : undefined,
    sort_by: activeSort?.server ? activeSort.value : undefined,
    price_min: priceMinNumber,
    price_max: priceMaxNumber,
  }), [page, qParam, categoryParam, activeSort, priceMinNumber, priceMaxNumber, selectedBrands.join("|")]);

  const filterKey = useMemo(() => JSON.stringify({
    q: qParam,
    category: categoryParam,
    brands: [...selectedBrands].sort(),
    sort: activeSort?.value,
    priceMin: priceMinParam,
    priceMax: priceMaxParam,
    rating: minRating,
  }), [qParam, categoryParam, selectedBrands.join("|"), activeSort?.value, priceMinParam, priceMaxParam, minRating]);

  const { data, isLoading, isFetching, error, refetch } = useGetProductFilterQuery(queryArgs);

  useEffect(() => {
    setProducts([]);
  }, [filterKey]);

  useEffect(() => {
    if (!data?.dt) return;
    const incoming = data.dt.products || [];
    setProducts((prev) => {
      if (page === 1) return incoming;
      const existingIds = new Set(prev.map((p) => p._id));
      const merged = [...prev];
      incoming.forEach((item) => {
        if (!existingIds.has(item._id)) {
          merged.push(item);
        }
      });
      return merged;
    });

    setCategoryOptions((prev) => {
      const next = new Set(prev);
      incoming.forEach((item) => {
        if (item?.category_name) next.add(item.category_name);
      });
      return Array.from(next);
    });
  }, [data, page]);

  const displayProducts = useMemo(() => {
    let list = [...products];
    if (minRating > 0) {
      list = list.filter((item) => (item?.rating || 0) >= minRating);
    }

    if (activeSort?.value === "price_asc") {
      list.sort((a, b) => (a.price_min || 0) - (b.price_min || 0));
    }
    if (activeSort?.value === "price_desc") {
      list.sort((a, b) => (b.price_min || 0) - (a.price_min || 0));
    }
    return list;
  }, [products, minRating, activeSort?.value]);

  const totalFromApi = data?.dt?.total || 0;
  const hasMore = data?.dt ? products.length < data.dt.total : false;
  const isInitialLoading = isLoading && page === 1 && products.length === 0;
  const isLoadMore = isFetching && page > 1;

  const appliedFilters = useMemo(() => {
    const pills = [];
    selectedBrands.forEach((brand) => pills.push({
      key: `brand-${brand}`,
      label: `Thương hiệu: ${brand}`,
      onClear: () => updateParams({ brand: selectedBrands.filter((b) => b !== brand) }),
    }));
    if (categoryParam !== "all") {
      pills.push({
        key: "category",
        label: `Danh mục: ${categoryParam}`,
        onClear: () => updateParams({ category: null }),
      });
    }
    if (priceMinNumber !== undefined) {
      pills.push({
        key: "price-min",
        label: `Giá từ ${formatCurrency(priceMinNumber)}`,
        onClear: () => updateParams({ price_min: null }),
      });
    }
    if (priceMaxNumber !== undefined) {
      pills.push({
        key: "price-max",
        label: `Đến ${formatCurrency(priceMaxNumber)}`,
        onClear: () => updateParams({ price_max: null }),
      });
    }
    if (minRating > 0) {
      pills.push({
        key: "rating",
        label: `Từ ${minRating} ★`,
        onClear: () => updateParams({ rating: null }),
      });
    }
    return pills;
  }, [selectedBrands, categoryParam, priceMinNumber, priceMaxNumber, minRating, updateParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    updateParams({ q: searchValue.trim() || null });
  };

  const handlePriceApply = () => {
    const safeMin = priceDraft.min !== "" && !Number.isNaN(Number(priceDraft.min)) ? Math.max(Number(priceDraft.min), 0) : null;
    const safeMax = priceDraft.max !== "" && !Number.isNaN(Number(priceDraft.max)) ? Math.max(Number(priceDraft.max), 0) : null;
    updateParams({
      price_min: safeMin,
      price_max: safeMax,
    });
  };

  const handleBrandToggle = (brand) => {
    const next = new Set(selectedBrands);
    if (next.has(brand)) next.delete(brand);
    else next.add(brand);
    updateParams({ brand: Array.from(next) });
  };

  const handleResetFilters = () => {
    setProducts([]);
    setSearchParams({});
  };

  const handleLoadMore = () => updateParams({ page: page + 1 }, false);

  return (
    <div className="tps-product-filter-page">
      <Container>
        <div className="page-hero-card">
          <div>
            <p className="eyebrow"><IoFilterSharp /> Bộ lọc & sắp xếp</p>
            <h1>Danh sách sản phẩm</h1>
            <p className="subtitle">
              Tìm kiếm, lọc theo thương hiệu, khoảng giá và sắp xếp để khám phá sản phẩm phù hợp nhất.
            </p>
            <div className="stats">
              <Badge bg="primary" className="me-2">Hiển thị {displayProducts.length}</Badge>
              <Badge bg="light" text="dark">Tổng server {totalFromApi}</Badge>
            </div>
          </div>
          <div className="hero-action">
            <Button variant="outline-primary" onClick={() => refetch()} disabled={isFetching}>
              <IoRefresh /> Làm mới
            </Button>
          </div>
        </div>

        <div className="filter-layout">
          <aside className="filter-sidebar">
            <div className="filter-header">
              <div>
                <p className="eyebrow">Bộ lọc</p>
                <h3>Thu hẹp lựa chọn</h3>
              </div>
              <Button variant="link" className="reset-btn" onClick={handleResetFilters}>Xóa tất cả</Button>
            </div>

            <div className="filter-section">
              <div className="section-title">Danh mục</div>
              <div className="pill-list">
                <button
                  className={`pill ${categoryParam === "all" ? "active" : ""}`}
                  onClick={() => updateParams({ category: null })}
                  type="button"
                >
                  Tất cả
                </button>
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    className={`pill ${categoryParam === category ? "active" : ""}`}
                    onClick={() => updateParams({ category })}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="section-title">Thương hiệu</div>
              <div className="checkbox-list">
                {brandOptions.map((brand) => (
                  <label key={brand} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
                {brandOptions.length === 0 && (
                  <p className="muted">Chưa có dữ liệu thương hiệu.</p>
                )}
              </div>
            </div>

            <div className="filter-section">
              <div className="section-title">Khoảng giá</div>
              <div className="price-range">
                <div className="input-group">
                  <span>Từ</span>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="0"
                    value={priceDraft.min}
                    onChange={(e) => setPriceDraft((prev) => ({ ...prev, min: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <span>Đến</span>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="10.000.000"
                    value={priceDraft.max}
                    onChange={(e) => setPriceDraft((prev) => ({ ...prev, max: e.target.value }))}
                  />
                </div>
                <Button size="sm" variant="primary" onClick={handlePriceApply}>
                  <IoPricetagOutline /> Áp dụng
                </Button>
              </div>
            </div>

            <div className="filter-section">
              <div className="section-title">Đánh giá</div>
              <div className="pill-list">
                <button
                  type="button"
                  className={`pill ${minRating === 0 ? "active" : ""}`}
                  onClick={() => updateParams({ rating: null })}
                >
                  Tất cả
                </button>
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pill ${minRating === option.value ? "active" : ""}`}
                    onClick={() => updateParams({ rating: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="catalog-wrapper">
            <div className="toolbar">
              <form className="search-control" onSubmit={handleSearch}>
                <IoSearch />
                <input
                  type="text"
                  placeholder="Tìm theo tên, hashtag..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button type="submit" size="sm" variant="primary">Tìm kiếm</Button>
              </form>

              <div className="sort-control">
                <span>Sắp xếp</span>
                <Form.Select
                  size="sm"
                  value={activeSort?.value}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="summary">
                <IoFlash /> Đang hiển thị {displayProducts.length}/{totalFromApi} sản phẩm
              </div>
            </div>

            {appliedFilters.length > 0 && (
              <div className="active-filters">
                {appliedFilters.map((pill) => (
                  <button key={pill.key} type="button" className="filter-pill" onClick={pill.onClear}>
                    {pill.label} <span>×</span>
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>Không tải được danh sách sản phẩm. Vui lòng thử lại.</p>
                <Button size="sm" onClick={() => refetch()}>Thử lại</Button>
              </div>
            )}

            {isInitialLoading ? (
              <div className="skeleton-grid">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="skeleton-card" />
                ))}
              </div>
            ) : (
              <>
                {displayProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>Không có sản phẩm phù hợp với bộ lọc hiện tại.</p>
                    <Button variant="outline-primary" onClick={handleResetFilters}>Xóa bộ lọc</Button>
                  </div>
                ) : (
                  <div className="product-grid">
                    {displayProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="load-more">
              {hasMore && (
                <Button
                  variant="outline-primary"
                  onClick={handleLoadMore}
                  disabled={isLoadMore}
                >
                  {isLoadMore ? <Spinner size="sm" animation="border" /> : <IoArrowDownCircleOutline />}
                  <span>Xem thêm 15 sản phẩm</span>
                </Button>
              )}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const categorySlug = slugify(product?.category_name || "san-pham", { lower: true, locale: "vi", trim: true });
  const detailPath = `/san-pham/${categorySlug}/${product?._id}`;

  return (
    <Link className="product-card" to={detailPath}>
      <div className="thumb">
        {product?.image
          ? <img src={product.image} alt={product?.product_name} />
          : <div className="thumb-fallback">Chưa có hình</div>
        }
        {product?.brand_name && <span className="brand-chip">{product.brand_name}</span>}
      </div>
      <div className="info">
        <div className="meta-line">
          <span className="category">{product?.category_name}</span>
          <span className="rating"><IoStar /> {(product?.rating || 0).toFixed ? (product.rating || 0).toFixed(1) : product?.rating || "0"} ★</span>
        </div>
        <h3 className="name">{product?.product_name}</h3>
        <p className="desc">{product?.short_description}</p>
        <div className="price-line">
          <span className="price">{formatCurrency(product?.price_min || 0)}</span>
          {/* {product?.price_max && product?.price_max !== product?.price_min && (
            <span className="price-range">- {formatCurrency(product.price_max)}</span>
          )} */}
        </div>
        <div className="meta-bottom">
          <span><IoFlash /> {product?.quantity_sold || 0} đã bán</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductsFilterPage;
