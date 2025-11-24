import axios from "axios";
import { BASE_URL, getUserToken } from "./axios-config";

const uploadClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const buildHeaders = () => {
  const token = getUserToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const postFormData = async (url, formData) => {
  const response = await uploadClient.post(url, formData, {
    headers: {
      ...buildHeaders(),
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });

  return response.data;
};

export const uploadSingleImageApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return postFormData("/upload/image", formData);
};

export const uploadMultipleImagesApi = async (files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("image", file));
  return postFormData("/upload/images", formData);
};

export const dataURLtoFile = (dataUrl, filename) => {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
};
