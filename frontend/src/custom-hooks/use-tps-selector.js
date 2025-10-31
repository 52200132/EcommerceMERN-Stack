import { useSelector, shallowEqual } from "react-redux";

/**
 * Custom hook giúp chọn (hoặc loại bỏ) các property từ một nhánh của Redux state.
 *
 * @param {function} selectorBase - Hàm selector cơ bản (ví dụ: state => state.product)
 * @param {object} options - Tuỳ chọn cho hook
 * @param {string[]} [options.excludeProps=[]] - Danh sách key muốn loại trừ khỏi state
 * @param {string[]} [options.includeProps=[]] - Danh sách key muốn giữ lại (ưu tiên hơn exclude)
 * @returns {object} - Object chứa các property được chọn
 *
 * Ghi chú:
 * - Chỉ nên dùng `excludeProps` hoặc `includeProps`, không nên dùng cả hai cùng lúc.
 * - `useSelector` đảm bảo hook sẽ tự re-render khi phần state liên quan thay đổi.
 */
export const useTpsSelector = (selectorBase, options = {}) => {
  const {
    excludeProps = [],
    includeProps = [],
  } = options;

  const selected = useSelector(
    (state) => {
      if (typeof selectorBase !== 'function') return {}
      const base = selectorBase(state);
      const propKeys = Object.keys(base || {});

      let selectedKeys;
      if (includeProps.length > 0) {
        selectedKeys = propKeys.filter((key) =>
          includeProps.includes(key)
        );
      } else if (excludeProps.length > 0) {
        selectedKeys = propKeys.filter(
          (key) => !excludeProps.includes(key)
        );
      } else {
        selectedKeys = propKeys;
      }

      const result = {};
      for (const key of selectedKeys) {
        result[key] = base[key];
      }

      return result;
    },
    shallowEqual,
  );

  return selected;
};
