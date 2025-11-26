import axios from 'axios';

import { toast } from 'react-toastify';

export const BASE_URL = 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data;
  }, (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error?.code === "ERR_NETWORK") return Promise.reject({ ec: -1, em: 'Lỗi mạng' })
    console.log(error);
    return error.response && error?.response?.data && Promise.reject(error?.response?.data);
  });

export const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
export const getUserToken = () => JSON.parse(sessionStorage.getItem('user'))?.token || null;

export const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers, redirect }) => {
    let setTimeoutIds = [];
    const { showSuccessToast, showErrorToast, useMessageFromResponse, showOverlay, autoCloseOverlay } = axiosBaseQueryUtil.behaviors;
    const { flowMessages, message, overlay, callbackfn } = axiosBaseQueryUtil;
    let overlayInstance;
    try {
      if (showOverlay && typeof overlay === 'function') overlayInstance = overlay();

      flowMessages.forEach(currFM => {
        const id = setTimeout(() => (typeof overlayInstance?.update === 'function') && overlayInstance.update(currFM.message), currFM.delay || 500);
        setTimeoutIds.push(id);
      });
      let token = getUserToken();
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        withCredentials: true, // nếu cần cookie
      })
      if (typeof callbackfn === 'function') callbackfn(result);
      if (showSuccessToast) toast.success(useMessageFromResponse ? result?.em || message.success : message.success);
      return { data: result }
    } catch (axiosError) {
      if (typeof callbackfn === 'function') callbackfn(axiosError, true);
      if (showErrorToast) toast.error(useMessageFromResponse ? axiosError?.em || message.error : message.error);
      return { error: axiosError }
    } finally {
      setTimeoutIds.forEach(id => clearTimeout(id));
      if (autoCloseOverlay && typeof overlayInstance?.close === 'function') overlayInstance.close();
      axiosBaseQueryUtil.resetDefaultBehaviors();
    }
  }

/**
 * Điều chỉnh ui khi sử dụng axios trong redux-toolkit query
 */
export const axiosBaseQueryUtil = {
  behaviors: {
    showSuccessToast: false,
    showErrorToast: false,
    showOverlay: false,
    useMessageFromResponse: false,
    autoCloseOverlay: true,
  },
  overlay: null,
  callbackfn: null,
  flowMessages: [],
  message: {
    success: 'Thao tác thành công',
    error: 'Đã xảy ra lỗi',
  },
  /**
   * @param {{ 
   * showSuccessToast:  boolean; 
   * showErrorToast:    boolean; 
   * showOverlay:       boolean; 
   * useMessageFromResponse: boolean;
   * }} newBehaviors
   */
  set configBehaviors(newBehaviors) {
    this.behaviors = { ...this.behaviors, ...newBehaviors };
  },

  /**
   * Bật hoặc tắt tất cả behaviors
   * @param {boolean} value
   */
  toggleAllBehaviors(value, except = []) {
    this.behaviors = {
      showSuccessToast: except.includes('showSuccessToast') ? this.behaviors.showSuccessToast : value,
      showErrorToast: except.includes('showErrorToast') ? this.behaviors.showErrorToast : value,
      showOverlay: except.includes('showOverlay') ? this.behaviors.showOverlay : value,
      useMessageFromResponse: except.includes('useMessageFromResponse') ? this.behaviors.useMessageFromResponse : value,
      autoCloseOverlay: except.includes('autoCloseOverlay') ? this.behaviors.autoCloseOverlay : value,
    };
  },

  resetDefaultBehaviors() {
    this.toggleAllBehaviors(false, ['autoCloseOverlay']);
    this.message = {
      success: 'Thao tác thành công',
      error: 'Đã xảy ra lỗi',
    };
    this.flowMessages = [];
    this.overlay = null;
    this.callbackfn = null;
  },

  /**
   * @param {{ success: string; error: string; }} newMessage
   */
  set setMessage(newMessage) {
    this.message = { ...this.message, ...newMessage };
  },
}