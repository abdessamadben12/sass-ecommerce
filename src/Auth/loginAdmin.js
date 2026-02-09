import { axiosConfig, setAuthToken } from "../services/ConfigueAxios"
import { saveAuth, clearAuth } from "./authStore"

export const loginAdmin = async (email, password, recaptchaToken) => {
  const response = await axiosConfig.post("/auth/login", {
    email,
    password,
    recaptcha_token: recaptchaToken,
  })
  const { token, user } = response.data
  setAuthToken(token)
  saveAuth({ token, user })
  return { token, user }
}

export const logoutAdmin = async () => {
  try {
    await axiosConfig.post("/auth/logout")
  } finally {
    setAuthToken(null)
    clearAuth()
  }
}





