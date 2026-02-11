import { useState, useRef } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import { loginAdmin } from "./loginAdmin"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const recaptchaRef = useRef(null)

  const from = location.state?.from?.pathname || "/admin/dashbord"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [requires2FA, setRequires2FA] = useState(false)
  const [challengeId, setChallengeId] = useState("")
  const [info, setInfo] = useState("")
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const BRAND_COLOR = "#008ECC"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")

    if (!recaptchaToken) {
      setError("Please verify the reCAPTCHA.")
      return
    }

    if (requires2FA && !otp.trim()) {
      setError("Please enter the verification code.")
      return
    }

    setLoading(true)
    try {
      const result = await loginAdmin(email, password, recaptchaToken, otp.trim(), challengeId)

      if (result?.requires_2fa) {
        setRequires2FA(true)
        setChallengeId(result?.challenge_id || "")
        setInfo(result?.message || "Verification code sent.")
        return
      }

      if (result?.token) {
        navigate(from, { replace: true })
        return
      }

      setError("Login failed. Please try again.")
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password.")
      if (!requires2FA) {
        recaptchaRef.current?.reset()
        setRecaptchaToken("")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white border-t-8" style={{ borderTopColor: BRAND_COLOR }}>
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-none shadow-none">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Admin Login
          </h1>
          <div className="h-1 w-12 mt-2" style={{ backgroundColor: BRAND_COLOR }} />
          <p className="text-gray-500 mt-4 text-sm">
            Enter your credentials to access the administrative dashboard.
          </p>
        </header>

        <div aria-live="polite">
          {!siteKey && (
            <div className="mb-4 p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-none">
              System Error: ReCAPTCHA site key is missing.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-none">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 text-sm bg-sky-50 border border-sky-200 text-sky-700 rounded-none">
              {info}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={requires2FA}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors disabled:bg-gray-100"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" style={{ color: BRAND_COLOR }} className="text-xs hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={requires2FA}
              placeholder="********"
              className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors disabled:bg-gray-100"
              style={{ borderRadius: "0px" }}
            />
          </div>

          {requires2FA && (
            <div>
              <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-none outline-none focus:border-[#008ECC] transition-colors"
                style={{ borderRadius: "0px" }}
              />
              <button
                type="button"
                className="mt-2 text-xs uppercase tracking-wider hover:underline"
                style={{ color: BRAND_COLOR }}
                onClick={() => {
                  setRequires2FA(false)
                  setOtp("")
                  setChallengeId("")
                  setInfo("")
                  recaptchaRef.current?.reset()
                  setRecaptchaToken("")
                }}
              >
                Use another account
              </button>
            </div>
          )}

          {siteKey && !requires2FA && (
            <div className="flex justify-start py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(t) => setRecaptchaToken(t || "")}
                style={{ borderRadius: "0px" }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !siteKey}
            style={{
              backgroundColor: loading || !siteKey ? "#cccccc" : BRAND_COLOR,
              borderRadius: "0px",
            }}
            className="w-full text-white font-bold py-3 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed border-none shadow-none"
          >
            {loading ? "Authenticating..." : requires2FA ? "Verify Code" : "Sign In"}
          </button>
        </form>

        <footer className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest text-center">
            Secured Administrative Portal &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  )
}
