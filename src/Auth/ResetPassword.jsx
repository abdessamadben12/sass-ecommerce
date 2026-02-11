import { useState, useMemo } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { axiosConfig } from "../services/ConfigueAxios"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => searchParams.get("token") || "", [searchParams])
  const email = useMemo(() => searchParams.get("email") || "", [searchParams])

  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const BRAND_COLOR = "#008ECC"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!token || !email) {
      setError("Invalid or expired reset link.")
      return
    }
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await axiosConfig.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setMessage(res.data?.message || "Password reset successfully.")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white border-t-8" style={{ borderTopColor: BRAND_COLOR }}>
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-none shadow-none">
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Reset Password
          </h1>
          <div className="h-1 w-12 mt-2" style={{ backgroundColor: BRAND_COLOR }} />
          <p className="text-gray-500 mt-4 text-sm">
            Please enter your new password below.
          </p>
        </header>

        <div aria-live="polite">
          {message && (
            <div className="mb-4 p-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded-none">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-none">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? "#cccccc" : BRAND_COLOR }}
            className="w-full text-white font-bold py-3 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" style={{ color: BRAND_COLOR }} className="text-xs font-bold uppercase tracking-widest hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}