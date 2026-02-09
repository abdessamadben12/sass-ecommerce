import axios from "axios"

export const axiosConfig = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
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

export const getCsrfTocken = async () =>
  await axios.get("http://localhost:8000/sanctum/csrf-cookie").then((res) => res.data)

