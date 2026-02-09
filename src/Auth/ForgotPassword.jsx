import { useState } from "react"
import { axiosConfig } from "../services/ConfigueAxios"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const res = await axiosConfig.post("/auth/forgot-password", { email })
      setMessage(res.data?.message || "Email envoye.")
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Mot de passe oublie
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Entrez votre email pour recevoir un lien de reinitialisation.
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded py-2 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
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
