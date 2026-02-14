import { useEffect, useState } from "react";
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
} from "../../../services/ServicesAdmin/MarketingModuleService";

export default function Campaigns() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "email",
    status: "draft",
    target_type: "subscribers",
  });
  const [error, setError] = useState("");

  const load = async () => {
    const res = await getCampaigns();
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createCampaign(form);
      setForm({ name: "", type: "email", status: "draft", target_type: "subscribers" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Error.");
    }
  };

  const remove = async (id) => {
    await deleteCampaign(id);
    load();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Campaigns</h1>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="email">Email</option>
            <option value="banner">Banner</option>
            <option value="push">Push</option>
            <option value="sms">SMS</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            value={form.target_type}
            onChange={(e) => setForm({ ...form, target_type: e.target.value })}
          >
            <option value="subscribers">Subscribers</option>
            <option value="users">Users</option>
            <option value="all_users">All Users</option>
          </select>
          <button className="bg-[#008ECC] text-white rounded px-3 py-2">Add</button>
        </form>
        {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Type</th>
              <th className="py-2">Status</th>
              <th className="py-2">Target</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2">{c.name}</td>
                <td className="py-2">{c.type}</td>
                <td className="py-2">{c.status}</td>
                <td className="py-2">{c.target_type}</td>
                <td className="py-2">
                  <button
                    className="text-red-600 text-xs"
                    onClick={() => remove(c.id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

