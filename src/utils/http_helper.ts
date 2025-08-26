import axios from "axios";
import Router from "next/router";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCurrentDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // add leading zero
  const day = String(now.getDate()).padStart(2, "0"); // add leading zero

  return `${year}-${month}-${day}`;
};

export const getEpochValue = (date: string) => {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getTime() / 1000) * 1000; // Convert to seconds
}

export const convertDateTime = (input: string) => {
  if (!input) return "";
  // Clean input to valid ISO (remove extra microseconds)
  const cleanInput = input.replace(/\.\d+Z$/, "Z");

  const date = new Date(cleanInput);

  // Manually build string using UTC getters
  const month = date.getUTCMonth() + 1; // months 0-11
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  let hour = date.getUTCHours();
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");

  // AM/PM format
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;

  const dateString = `${month}/${day}/${year}  ${hour}:${minute}:${second} ${ampm}`;
  return dateString;
};

export const getCurrentTimeMin = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // add leading zero
  const day = String(now.getDate()).padStart(2, "0"); // add leading zero

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const convertDateTimeMin = (input: string) => {
  if (!input) return "";
  // Clean input to valid ISO (remove extra microseconds)
  const cleanInput = input.replace(/\.\d+Z$/, "Z");

  const date = new Date(cleanInput);

  // Manually build string using UTC getters
  const month = date.getMonth() + 1; // months 0-11
  const day = date.getDate();
  const year = date.getFullYear();

  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");

  const dateString = `${year}-${month}-${day} ${hour}:${minute}`;
  return dateString;
};

export const uploader = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

uploader.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const lng = localStorage.getItem('locale');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.Locale = lng;
  }
  return config;
});

uploader.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      Router.push("/auth/signin");
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const lng = localStorage.getItem('locale');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.Locale = lng;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      Router.push("/auth/signin");
    }

    return Promise.reject(error);
  }
);

export default api;
