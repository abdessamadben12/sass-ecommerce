import { Navigate, useLocation } from "react-router-dom"
import { isAuthed } from "./authStore"

export default function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
