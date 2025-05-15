import Axios from "axios";
import Cookies from "js-cookie";
import configs from "@/constants/config";

const axiosInstance = Axios.create({
  timeout: 3 * 60 * 1000,
  baseURL: configs.API_DOMAIN,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // eslint-disable-next-line no-param-reassign
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const logout = () => {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  window.location.href = "/";
};
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const originalConfig = error.config;
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }
    return Axios.post(`${configs.API_DOMAIN}/idol/auth/request-access-token`, {
      refreshToken,
    })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data.data;
          Cookies.set("token", data.accessToken);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return Axios(originalConfig);
        } else {
          logout();
          return Promise.reject(error);
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      });
  }
);

export const sendGet = (url: string, params?: any) =>
  axiosInstance.get(url, { params }).then((res) => res.data);
export const sendPost = (url: string, params?: any, queryParams?: any) =>
  axiosInstance
    .post(url, params, { params: queryParams })
    .then((res) => res.data);
export const sendPut = (url: string, params?: any) =>
  axiosInstance.put(url, params).then((res) => res.data);
export const sendPatch = (url: string, params?: any) =>
  axiosInstance.patch(url, params).then((res) => res.data);
export const sendDelete = (url: string, params?: any) =>
  axiosInstance.delete(url, { params }).then((res) => res.data);
