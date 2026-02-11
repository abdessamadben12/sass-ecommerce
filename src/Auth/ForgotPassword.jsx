import { useState } from "react"
import { axiosConfig } from "../services/ConfigueAxios"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const BRAND_COLOR = "#008ECC"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const res = await axiosConfig.post("/auth/forgot-password", { email })
      setMessage(res.data?.message || "Reset link has been sent to your email.")
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white border-t-8" style={{ borderTopColor: BRAND_COLOR }}>
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-none shadow-none">
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Forgot Password
          </h1>
          <div className="h-1 w-12 mt-2" style={{ backgroundColor: BRAND_COLOR }} />
          <p className="text-gray-500 mt-4 text-sm">
            Enter your email address and we'll send you a link to reset your password.
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
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? "#cccccc" : BRAND_COLOR }}
            className="w-full text-white font-bold py-3 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" style={{ color: BRAND_COLOR }} className="text-xs font-bold uppercase tracking-widest hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}