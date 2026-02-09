import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import { loginAdmin } from "./loginAdmin"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/admin/dashbord"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!recaptchaToken) {
        setError("Veuillez valider le reCAPTCHA.")
        setLoading(false)
        return
      }
      await loginAdmin(email, password, recaptchaToken)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err?.response?.data?.message || "Email ou mot de passe invalide."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-md p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 mb-4">
          Admin Access
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">
          Connectez-vous pour acceder au dashboard.
        </p>

        {!siteKey ? (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded p-2">
            La cle reCAPTCHA est manquante. Definis `VITE_RECAPTCHA_SITE_KEY`.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="••••••••"
            />
          </div>

          {siteKey ? (
            <div>
              <ReCAPTCHA sitekey={siteKey} onChange={(t) => setRecaptchaToken(t || "")} />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !siteKey}
            className="w-full bg-gray-900 text-white rounded py-2 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/forgot-password" className="text-gray-700 underline">
            Mot de passe oublie ?
          </Link>
        </div>
      </div>
    </div>
  )
}
