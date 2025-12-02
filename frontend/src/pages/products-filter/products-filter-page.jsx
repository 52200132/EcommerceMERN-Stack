import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Badge, Button, Container, Spinner } from "react-bootstrap";
import slugify from "slugify";
import { IoArrowDownCircleOutline, IoSearch, IoStar, IoFlash } from "react-icons/io5";

import { formatCurrency } from "#utils";
import { useGetProductFilterQuery } from "#services/product-services";
import { axiosInstance } from "services/axios-config";
import filterOptions, { LABTOP_SLUG } from "#components/product-filter/filter";
import FilterSection from "#components/product-filter/filter-section";

import "./products-filter-page.scss";

const PAGE_SIZE = 15;

const sortOptions = [
  { value: "quantity_sold_desc", label: "Phổ biến nhất", hint: "Ưu tiên sản phẩm bán chạy", server: true },
  { value: "name_asc", label: "Tên A → Z", server: true },
  { value: "name_desc", label: "Tên Z → A", server: true },
  { value: "price_asc", label: "Giá tăng dần", server: true },
  { value: "price_desc", label: "Giá giảm dần", server: true },
];

const parseVariantFilters = (rawValue) => {
  if (!rawValue) return [];
  try {
    const parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        attribute: typeof item?.attribute === "string" ? item.attribute.trim() : "",
        values: Array.isArray(item?.values) ? item.values.filter(Boolean) : []
      }))
      .filter((item) => item.attribute && item.values.length);
  } catch {
    return [];
  }
};

const ProductsFilterPage = () => {
  const { categorySlug = LABTOP_SLUG } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "all";
  const selectedBrands = searchParams.getAll("brand");
  const sortParam = searchParams.get("sort") || "quantity_sold_desc";
  const priceMinParam = searchParams.get("price_min") || "";
  const priceMaxParam = searchParams.get("price_max") || "";
  const ratingParam = searchParams.get("rating") || "";
  const variantFilters = useMemo(() => parseVariantFilters(searchParams.get("variants_filters")), [searchParams]);
  const filterConfig = filterOptions[categorySlug] || filterOptions[LABTOP_SLUG];

  const [searchValue, setSearchValue] = useState(qParam);
  const [products, setProducts] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  useEffect(() => setSearchValue(qParam), [qParam]);

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
  const variantFiltersKey = useMemo(() => JSON.stringify(variantFilters), [variantFilters]);

  const queryArgs = useMemo(() => {
    const apiPage = page > 1 ? 1 : page;
    const apiLimit = PAGE_SIZE * page;
    return {
      page: apiPage,
      limit: apiLimit,
      q: qParam || undefined,
      brand_names: selectedBrands.length ? selectedBrands : undefined,
      category_name: categoryParam !== "all" ? categoryParam : undefined,
      sort_by: activeSort?.server ? activeSort.value : undefined,
      price_min: priceMinNumber,
      price_max: priceMaxNumber,
      variants_filters: variantFilters.length ? JSON.stringify(variantFilters) : undefined,
    };
  }, [page, qParam, categoryParam, activeSort, priceMinNumber, priceMaxNumber, selectedBrands.join("|"), variantFilters]);

  const filterKey = useMemo(() => JSON.stringify({
    q: qParam,
    category: categoryParam,
    brands: [...selectedBrands].sort(),
    sort: activeSort?.value,
    priceMin: priceMinParam,
    priceMax: priceMaxParam,
    rating: minRating,
    variantFilters: variantFiltersKey,
  }), [qParam, categoryParam, selectedBrands.join("|"), activeSort?.value, priceMinParam, priceMaxParam, minRating, variantFiltersKey]);

  const { data, isLoading, isFetching, error, refetch } = useGetProductFilterQuery(queryArgs);

  useEffect(() => {
    setProducts([]);
  }, [filterKey]);

  useEffect(() => {
    if (!data?.dt) return;
    const incoming = data.dt.products || [];
    setProducts(incoming);
  }, [data]);

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
    variantFilters.forEach((vf) => {
      const label = filterConfig?.filterFields?.find((field) => field.attribute === vf.attribute)?.label || vf.attribute;
      pills.push({
        key: `vf-${vf.attribute}`,
        label: `${label}: ${vf.values.join(" | ")}`,
        onClear: () => {
          const next = variantFilters.filter((item) => item.attribute !== vf.attribute);
          updateParams({ variants_filters: next.length ? JSON.stringify(next) : null });
        },
      });
    });
    return pills;
  }, [selectedBrands, categoryParam, priceMinNumber, priceMaxNumber, minRating, variantFilters, filterConfig, updateParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    updateParams({ q: searchValue.trim() || null });
  };

  const handleResetFilters = () => {
    setProducts([]);
    setSearchParams({});
  };

  const handleLoadMore = () => updateParams({ page: page + 1 }, false);

  return (
    <div className="tps-product-filter-page">
      <Container>
        <FilterSection categorySlug={categorySlug} brandOptions={brandOptions} />
        <div className="page-hero-card mb-3">
          <div>
            <h1>Danh sách sản phẩm</h1>
            <p className="subtitle">
              Tìm kiếm, lọc theo thương hiệu, khoảng giá và sắp xếp để khám phá sản phẩm phù hợp nhất.
            </p>
            <div className="stats">
              <Badge bg="primary" className="me-2">Hiển thị {displayProducts.length}</Badge>
              <Badge bg="light" text="dark">Tổng {totalFromApi}</Badge>
            </div>
          </div>
        </div>

        <div className="catalog-wrapper">
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
              <div className="sort-options">
                {sortOptions.map((option) => {
                  const isActive = activeSort?.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`sort-pill ${isActive ? "active" : ""}`}
                      onClick={() => updateParams({ sort: option.value })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
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
        </div>
      </Container>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const categorySlug = slugify(product?.category_name || "san-pham", { lower: true, locale: "vi", trim: true });
  const productNameSlug = slugify(product?.product_name || "product", { lower: true, locale: "vi", trim: true });
  const detailPath = `/san-pham/${categorySlug}/${productNameSlug}`;

  return (
    <Link
      className="product-card" to={`${detailPath}`}
      state={{
        productId: product?._id,
      }}
    >
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
