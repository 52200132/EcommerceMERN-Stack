import { store } from 'redux-tps/store'; // Cập nhật đường dẫn đúng

/**
 * Custom hook giúp lấy state từ Redux store mà không subscribe (không gây re-render)
 *
 * @param {function} selectorBase - Hàm selector cơ bản (ví dụ: state => state.product)
 * @param {object} options - Tuỳ chọn cho hook
 * @param {string[]} [options.excludeProps=[]] - Danh sách key muốn loại trừ khỏi state
 * @param {string[]} [options.includeProps=[]] - Danh sách key muốn giữ lại (ưu tiên hơn exclude)
 * @returns {object} - Object chứa các property được chọn
 *
 * Ghi chú:
 * - Hook này KHÔNG subscribe vào Redux store, nên không trigger re-render
 * - Phù hợp để lấy giá trị state tại thời điểm gọi (ví dụ: trong event handler)
 * - Nếu cần component tự động re-render khi state thay đổi, dùng `useTpsSelector`
 */
export const useTpsGetState = (selectorBase, options = {}) => {
  const {
    excludeProps = [],
    includeProps = [],
  } = options;


  if (typeof selectorBase !== 'function') return {};

  const state = store.getState();
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
};