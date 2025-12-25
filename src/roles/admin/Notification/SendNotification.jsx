import { useEffect, useMemo, useState } from "react";

/**
 * SendNotification.jsx
 * - Formulaire contrôlé
 * - Audience: all | specific
 * - Modal de sélection d'utilisateurs avec recherche
 * - Validation + gestion des états
 */
export default function SendNotification() {
  const [form, setForm] = useState({
    subject: "",
    type: "email",       // 'email' | 'system'
    audience: "all",     // 'all' | 'specific'
    message: "",
  });

  const [selectedUsers, setSelectedUsers] = useState([]); // [id, id, ...]
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userPickerOpen, setUserPickerOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "audience" && value === "all") {
      setSelectedUsers([]);
    }
  };

  const validate = () => {
    if (!form.subject.trim()) return "L’objet est requis.";
    if (!form.message.trim()) return "Le message est requis.";
    if (form.audience === "specific" && selectedUsers.length === 0)
      return "Sélectionne au moins un utilisateur.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      // ⚠️ Remplace l’URL par ton endpoint côté backend
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject.trim(),
          type: form.type,
          audience: form.audience,
          users: form.audience === "specific" ? selectedUsers : "all",
          message: form.message, // si tu autorises HTML, valide côté serveur
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Une erreur est survenue.");
      }

      setSuccess(true);
      setForm((f) => ({ ...f, subject: "", message: "" }));
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Send Notification</h1>

      <div className="bg-white p-4 rounded-md shadow">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Object
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Objet du message"
              value={form.subject}
              onChange={handleChange}
              className="mt-1 p-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 p-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="email">Email</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Audience */}
          <div className="flex flex-col gap-2">
            <label htmlFor="audience" className="text-sm font-medium text-gray-700">
              Audience
            </label>
            <div className="flex items-center gap-2">
              <select
                id="audience"
                name="audience"
                value={form.audience}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === "specific") setUserPickerOpen(true);
                }}
                className="mt-1 p-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="specific">Utilisateurs spécifiques…</option>
              </select>

              {form.audience === "specific" && (
                <button
                  type="button"
                  onClick={() => setUserPickerOpen(true)}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Choisir ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Ton message (HTML autorisé si géré côté serveur)"
              value={form.message}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <span className="text-xs text-gray-500">
              Le HTML peut définir le style (bold, italic, underline, etc.). Valide et nettoie côté serveur.
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
              Notification envoyée avec succès.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Send"}
          </button>
        </form>
      </div>

      {/* Modal de sélection d'utilisateurs */}
      <UserPickerModal
        open={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    </div>
  );
}

/** Modal de sélection d’utilisateurs */
function UserPickerModal({ open, onClose, selectedUsers, setSelectedUsers }) {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Doe" },
    { id: 3, name: "John Smith" },
    { id: 4, name: "Jane Smith" },
    { id: 5, name: "Ali Ben" },
    { id: 6, name: "Sara Noor" },
    { id: 7, name: "Mehdi O." },
    { id: 8, name: "Aya L." },
  ]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Exemple pour fetcher depuis ton API :
  // useEffect(() => {
  //   if (!open) return;
  //   setLoading(true);
  //   fetch('/api/users')
  //     .then(r => r.json())
  //     .then(data => setUsers(data))
  //     .catch(() => {})
  //     .finally(() => setLoading(false));
  // }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, search]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filtered.map((u) => u.id);
    setSelectedUsers((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearAll = () => setSelectedUsers([]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Sélectionner des utilisateurs</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 p-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            type="text"
            placeholder="Rechercher par nom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={selectAllFiltered}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            Tout sélectionner (filtré)
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            Tout effacer
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Chargement…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
            {filtered.map((user) => {
              const checked = selectedUsers.includes(user.id);
              const inputId = `pick-user-${user.id}`;
              return (
                <label
                  key={user.id}
                  htmlFor={inputId}
                  className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer ${
                    checked ? "border-indigo-400 bg-indigo-50" : "border-gray-300"
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={() => toggleUser(user.id)}
                  />
                  <span className="text-sm text-gray-800">{user.name}</span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-500 py-8">
                Aucun résultat.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Sélectionnés : {selectedUsers.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}
