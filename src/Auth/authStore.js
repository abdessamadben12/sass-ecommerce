export const saveAuth = ({ token, user }) => {
  if (token) localStorage.setItem("auth_token", token)
  if (user) localStorage.setItem("auth_user", JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export const getAuthToken = () => localStorage.getItem("auth_token")

export const getAuthUser = () => {
  const raw = localStorage.getItem("auth_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const isAuthed = () => Boolean(getAuthToken())
