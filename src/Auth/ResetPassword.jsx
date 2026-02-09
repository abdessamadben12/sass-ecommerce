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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    if (!token || !email) {
      setError("Lien de reinitialisation invalide.")
      return
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.")
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
      setMessage(res.data?.message || "Mot de passe reinitialise.")
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur de reinitialisation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Reinitialiser le mot de passe
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Choisissez un nouveau mot de passe.
        </p>

        {message ? (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded p-2">
            {message}
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
              Nouveau mot de passe
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded py-2 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "En cours..." : "Reinitialiser"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-gray-700 underline">
            Retour au login
          </Link>
        </div>
      </div>
    </div>
  )
}
