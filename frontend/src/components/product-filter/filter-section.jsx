import { useEffect, useMemo, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useSearchParams } from "react-router-dom";

import filterOptions, { LABTOP_SLUG } from "./filter";

const normalizeVariantFilters = (rawValue) => {
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

const serializeVariantFilters = (filters) => {
  const compact = filters
    .map((item) => ({
      attribute: item.attribute,
      values: Array.from(new Set(item.values))
    }))
    .filter((item) => item.attribute && item.values.length);
  return compact.length ? JSON.stringify(compact) : null;
};

const getFieldByAttribute = (fields = [], attribute) => fields.find((f) => f.attribute === attribute);
const getDefaultPriceRange = (fields = []) => getFieldByAttribute(fields, "price")?.values || [0, 0];

const FilterSection = ({ categorySlug, brandOptions = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const config = filterOptions[categorySlug] || filterOptions[LABTOP_SLUG];

  const selectedBrands = useMemo(() => new Set(searchParams.getAll("brand")), [searchParams]);
  const priceMinParam = searchParams.get("price_min");
  const priceMaxParam = searchParams.get("price_max");
  const priceMinValue = priceMinParam !== null && priceMinParam !== "" ? Number(priceMinParam) : null;
  const priceMaxValue = priceMaxParam !== null && priceMaxParam !== "" ? Number(priceMaxParam) : null;
  const priceMinNumber = Number.isFinite(priceMinValue) ? priceMinValue : null;
  const priceMaxNumber = Number.isFinite(priceMaxValue) ? priceMaxValue : null;
  const variantFiltersFromUrl = useMemo(
    () => normalizeVariantFilters(searchParams.get("variants_filters")),
    [searchParams]
  );

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [brandDraft, setBrandDraft] = useState(new Set(selectedBrands));
  const [variantDrafts, setVariantDrafts] = useState(() => {
    const draft = {};
    config?.filterFields?.forEach((field) => {
      if (field.type === "multiple" && field.attribute !== "brand") {
        const existing = variantFiltersFromUrl.find((vf) => vf.attribute === field.attribute);
        draft[field.attribute] = new Set(existing?.values || []);
      }
    });
    return draft;
  });
  const [priceDraft, setPriceDraft] = useState(() => {
    const [minDefault, maxDefault] = getDefaultPriceRange(config?.filterFields);
    return {
      min: priceMinNumber ?? minDefault,
      max: priceMaxNumber ?? maxDefault
    };
  });
  const appliedVariantSelections = useMemo(() => {
    const next = {};
    variantFiltersFromUrl.forEach((vf) => {
      next[vf.attribute] = new Set(vf.values);
    });
    return next;
  }, [variantFiltersFromUrl]);

  useEffect(() => setBrandDraft(new Set(selectedBrands)), [selectedBrands]);

  useEffect(() => {
    const draft = {};
    config?.filterFields?.forEach((field) => {
      if (field.type === "multiple" && field.attribute !== "brand") {
        const existing = variantFiltersFromUrl.find((vf) => vf.attribute === field.attribute);
        draft[field.attribute] = new Set(existing?.values || []);
      }
    });
    setVariantDrafts(draft);
  }, [variantFiltersFromUrl, config]);

  useEffect(() => {
    const [minDefault, maxDefault] = getDefaultPriceRange(config?.filterFields);
    setPriceDraft({
      min: priceMinNumber ?? minDefault,
      max: priceMaxNumber ?? maxDefault
    });
  }, [priceMinNumber, priceMaxNumber, config]);

  const updateParams = (entries, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
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
  };

  const handleToggleValue = (attribute, value, isBrand = false) => {
    if (isBrand) {
      setBrandDraft((prev) => {
        const next = new Set(prev);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
      });
      return;
    }
    setVariantDrafts((prev) => {
      const next = { ...prev };
      next[attribute] = new Set(next[attribute] || []);
      if (next[attribute].has(value)) next[attribute].delete(value);
      else next[attribute].add(value);
      return next;
    });
  };

  const applyBrand = () => {
    updateParams({ brand: Array.from(brandDraft) });
    setActiveOverlay(null);
  };

  const applyVariants = () => {
    const payload = Object.entries(variantDrafts)
      .map(([attribute, set]) => ({ attribute, values: Array.from(set) }))
      .filter((item) => item.values.length);
    updateParams({ variants_filters: serializeVariantFilters(payload) });
    setActiveOverlay(null);
  };

  const applyPrice = () => {
    let safeMin = Number.isFinite(Number(priceDraft.min)) ? Math.max(Number(priceDraft.min), 0) : null;
    let safeMax = Number.isFinite(Number(priceDraft.max)) ? Math.max(Number(priceDraft.max), 0) : null;
    if (safeMin !== null && safeMax !== null && safeMin > safeMax) {
      [safeMin, safeMax] = [safeMax, safeMin];
    }
    updateParams({
      price_min: safeMin,
      price_max: safeMax
    });
    setActiveOverlay(null);
  };

  const clearSingleFilter = (attribute) => {
    if (attribute === "brand") {
      setBrandDraft(new Set());
      updateParams({ brand: null });
      return;
    }
    if (attribute === "price") {
      const [minDefault, maxDefault] = getDefaultPriceRange(config?.filterFields);
      setPriceDraft({ min: minDefault, max: maxDefault });
      updateParams({ price_min: null, price_max: null });
      return;
    }
    const updatedDrafts = { ...variantDrafts, [attribute]: new Set() };
    setVariantDrafts(updatedDrafts);
    const payload = Object.entries(updatedDrafts)
      .map(([attributeKey, set]) => ({ attribute: attributeKey, values: Array.from(set) }))
      .filter((item) => item.values.length);
    updateParams({ variants_filters: serializeVariantFilters(payload) });
  };

  const activeFilters = useMemo(() => {
    const list = [];
    if (selectedBrands.size) {
      list.push({
        key: "brand",
        label: `Thương hiệu: ${Array.from(selectedBrands).join(" | ")}`,
        attribute: "brand"
      });
    }
    if (priceMinNumber !== null || priceMaxNumber !== null) {
      const rangeLabel = `Giá ${priceMinNumber !== null ? `từ ${priceMinNumber.toLocaleString("vi-VN")}₫` : ""}${priceMinNumber !== null && priceMaxNumber !== null ? " - " : ""}${priceMaxNumber !== null ? `đến ${priceMaxNumber.toLocaleString("vi-VN")}₫` : ""}`;
      list.push({
        key: "price",
        label: rangeLabel,
        attribute: "price"
      });
    }
    variantFiltersFromUrl.forEach((vf) => {
      const label = getFieldByAttribute(config?.filterFields, vf.attribute)?.label || vf.attribute;
      list.push({
        key: `vf-${vf.attribute}`,
        label: `${label}: ${vf.values.join(" | ")}`,
        attribute: vf.attribute
      });
    });
    return list;
  }, [selectedBrands, priceMinNumber, priceMaxNumber, variantFiltersFromUrl, config]);

  const renderFieldValues = (field) => {
    if (field.attribute === "price") {
      return (
        <div className="price-slider">
          <div className="slider-row">
            <span>Giá thấp nhất</span>
            <RangeSlider
              value={priceDraft.min ?? field.values?.[0]}
              min={field.values?.[0]}
              max={field.values?.[1]}
              step={500000}
              tooltip="auto"
              tooltipLabel={(val) => `${val.toLocaleString("vi-VN")}₫`}
              onChange={(e) => setPriceDraft((prev) => ({ ...prev, min: Number(e.target.value) }))}
            />
          </div>
          <div className="slider-row">
            <span>Giá cao nhất</span>
            <RangeSlider
              value={priceDraft.max ?? field.values?.[1]}
              min={field.values?.[0]}
              max={field.values?.[1]}
              step={500000}
              tooltip="auto"
              tooltipLabel={(val) => `${val.toLocaleString("vi-VN")}₫`}
              onChange={(e) => setPriceDraft((prev) => ({ ...prev, max: Number(e.target.value) }))}
            />
          </div>
          <div className="price-note">Kéo thanh trượt để chọn khoảng giá phù hợp.</div>
        </div>
      );
    }

    const valueSource = field.attribute === "brand"
      ? Array.from(new Set([...(field.values || []), ...(brandOptions || [])]))
      : field.values || [];
    const sortedValues = [...valueSource].sort((a, b) => String(a).localeCompare(String(b), "vi", { sensitivity: "base" }));
    const selectedSet = field.attribute === "brand" ? brandDraft : variantDrafts[field.attribute] || new Set();

    return (
      <div className="pill-list mb-0">
        {sortedValues.map((value) => {
          const isActive = selectedSet.has(value);
          return (
            <button
              key={`${field.attribute}-${value}`}
              type="button"
              className={`pill ${isActive ? "active" : ""}`}
              onClick={() => handleToggleValue(field.attribute, value, field.attribute === "brand")}
            >
              {value}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="filter-panel">
      <div className="filter-section mb-2">
        {config?.filterFields?.map((field) => (
          <OverlayTrigger
            key={field.attribute}
            placement="bottom-start"
            trigger="click"
            rootClose
            show={activeOverlay === field.attribute}
            overlay={(
              <Popover className="filter-popover">
                <Popover.Body>
                  <div className="filter-popover__title">{field.label}</div>
                  {renderFieldValues(field)}
                  <div className="feild-filter-actions">
                    <Button
                      variant="outline-secondary"
                      className="close-button"
                      onClick={() => setActiveOverlay(null)}
                    >
                      Đóng
                    </Button>
                    <Button
                      className="apply-button"
                      onClick={field.attribute === "brand"
                        ? applyBrand
                        : field.attribute === "price"
                          ? applyPrice
                          : applyVariants}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </Popover.Body>
              </Popover>
            )}
          >
            <div
              className={`filter-field ${activeOverlay === field.attribute || (field.attribute === "brand"
                ? selectedBrands.size > 0
                : field.attribute === "price"
                  ? priceMinNumber !== null || priceMaxNumber !== null
                  : (appliedVariantSelections[field.attribute] || new Set()).size > 0) ? "active" : ""}`}
              onClick={() => setActiveOverlay((prev) => (prev === field.attribute ? null : field.attribute))}
            >
              <span className="field-label">{field.label}</span>
            </div>
          </OverlayTrigger>
        ))}
      </div>

      {activeFilters.length > 0 && (
        <div className="filter-active">
          <div className="filter-active__label">Đang lọc:</div>
          <div className="filter-active__chips">
            {activeFilters.map((item) => (
              <button
                key={item.key}
                type="button"
                className="filter-pill"
                onClick={() => clearSingleFilter(item.attribute)}
              >
                {item.label} <span>×</span>
              </button>
            ))}
          </div>
          <Button variant="link" className="filter-active__reset" onClick={() => {
            setBrandDraft(new Set());
            setVariantDrafts({});
            const [minDefault, maxDefault] = getDefaultPriceRange(config?.filterFields);
            setPriceDraft({ min: minDefault, max: maxDefault });
            updateParams({
              brand: null,
              variants_filters: null,
              price_min: null,
              price_max: null
            });
          }}>
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
