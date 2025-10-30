import { closeOverlay, overlay } from 'utils/overlay-manager';
import axios from 'axios';

import { toast } from 'react-toastify';
import Wobbling from 'Admin/components/layout/wobbling';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log('AXIOS RESPONSE', response.data);
    return response && response.data;
  }, (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log('AXIOS ERROR', error);
    // return Promise.reject(error) && error.response && error?.response?.data;
    return error.response && error?.response?.data;
  });

export const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    let overlayTimeout;
    try {
      overlay(
        <>
          <Wobbling />
          <div className="mt-2">Đang xử lý...</div>
        </>
      )
      overlayTimeout = setTimeout(() => {
        overlay(
        <>
          <Wobbling />
          <div className="mt-2">Vui lòng chờ...</div>
        </>
      )
      }, 3000);
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        // withCredentials: true, // nếu cần cookie
      })
      clearTimeout(overlayTimeout);
      if (result?.ec === 0) {
        toast.success(result?.em || 'Thao tác thành công!');
      } else {
        console.error('THAT BAI', result.em)
        toast.error(result?.em || 'Thao tác thất bại!');
      }
      return { data: result }
    } catch (axiosError) {
      const err = axiosError
      console.log(err)
      toast.error(err.em || 'Thao tác thất bại!');
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    } finally {
      clearTimeout(overlayTimeout);
      closeOverlay();
    }
  }