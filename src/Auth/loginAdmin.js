import { axiosConfig, setAuthToken } from "../services/ConfigueAxios"
import { saveAuth, clearAuth } from "./authStore"

export const loginAdmin = async (email, password, recaptchaToken, otp = "", challengeId = "") => {
  const response = await axiosConfig.post("/auth/login", {
    email,
    password,
    recaptcha_token: recaptchaToken,
    otp,
    challenge_id: challengeId,
  })
  const data = response.data
  const { token, user } = data

  if (token && user) {
    setAuthToken(token)
    saveAuth({ token, user })
  }

  return data
}

export const logoutAdmin = async () => {
  try {
    await axiosConfig.post("/auth/logout")
  } finally {
    setAuthToken(null)
    clearAuth()
  }
}





