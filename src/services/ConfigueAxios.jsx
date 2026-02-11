import axios from "axios"

export const axiosBase = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
})

export const axiosConfig = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
})

axiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("auth_token", token)
  } else {
    localStorage.removeItem("auth_token")
  }
}

export const getCsrfToken = async () => {
  await axiosBase.get("/sanctum/csrf-cookie")
}
