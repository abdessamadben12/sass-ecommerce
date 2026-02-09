import { useEffect, useState } from "react";
import {
  getPromotions,
  createPromotion,
  deletePromotion,
} from "../../../services/ServicesAdmin/MarketingModuleService";

export default function Promotions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "banner",
    status: "draft",
    starts_at: "",
    ends_at: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    const res = await getPromotions();
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createPromotion(form);
      setForm({ name: "", type: "banner", status: "draft", starts_at: "", ends_at: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur.");
    }
  };

  const remove = async (id) => {
    await deletePromotion(id);
    load();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Promotions</h1>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="event">Event</option>
            <option value="launch">Launch</option>
            <option value="banner">Banner</option>
            <option value="featured">Featured</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />
          <button className="bg-gray-900 text-white rounded px-3 py-2">
            Ajouter
          </button>
        </form>
        {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Nom</th>
              <th className="py-2">Type</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Début</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.type}</td>
                <td className="py-2">{p.status}</td>
                <td className="py-2">{p.starts_at || "-"}</td>
                <td className="py-2">
                  <button
                    className="text-red-600 text-xs"
                    onClick={() => remove(p.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Aucun élément.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
