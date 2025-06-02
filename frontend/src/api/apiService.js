import axiosInstance from './axiosInstance';

const get = async (url, config = {}) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

const post = async (url, data, config = {}) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

const patch = async (url, data, config = {}) => {
  const response = await axiosInstance.patch(url, data, config);
  return response.data;
};

const del = async (url, config = {}) => {
  const response = await axiosInstance.delete(url, config);
  return response.data;
};

export { get, post, patch, del };