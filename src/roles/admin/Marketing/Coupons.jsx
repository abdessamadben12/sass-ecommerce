import { useEffect, useState } from "react";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
} from "../../../services/ServicesAdmin/MarketingModuleService";

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 0,
    status: "draft",
    applies_to: "all",
  });
  const [error, setError] = useState("");

  const load = async () => {
    const res = await getCoupons();
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createCoupon(form);
      setForm({ code: "", type: "percent", value: 0, status: "draft", applies_to: "all" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Error.");
    }
  };

  const remove = async (id) => {
    await deleteCoupon(id);
    load();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Coupons</h1>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="expired">Expired</option>
          </select>
          <button className="bg-[#008ECC] text-white rounded px-3 py-2">Add</button>
        </form>
        {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Code</th>
              <th className="py-2">Type</th>
              <th className="py-2">Value</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2">{c.code}</td>
                <td className="py-2">{c.type}</td>
                <td className="py-2">{c.value}</td>
                <td className="py-2">{c.status}</td>
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

