import { useEffect, useState } from "react";
import {
  getReferralCodes,
  createReferralCode,
  getReferralInvites,
  getReferralRewards,
} from "../../../services/ServicesAdmin/MarketingModuleService";

export default function Referrals() {
  const [codes, setCodes] = useState([]);
  const [invites, setInvites] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    code: "",
    reward_type: "credit",
    reward_value: 0,
  });

  const load = async () => {
    const codesRes = await getReferralCodes();
    const invitesRes = await getReferralInvites();
    const rewardsRes = await getReferralRewards();
    setCodes(codesRes.data || []);
    setInvites(invitesRes.data || []);
    setRewards(rewardsRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createReferralCode(form);
      setForm({ user_id: "", code: "", reward_type: "credit", reward_value: 0 });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Error.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Referrals</h1>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="User ID"
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.reward_type}
            onChange={(e) => setForm({ ...form, reward_type: e.target.value })}
          >
            <option value="credit">Credit</option>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={form.reward_value}
            onChange={(e) => setForm({ ...form, reward_value: Number(e.target.value) })}
          />
          <button className="bg-[#008ECC] text-white rounded px-3 py-2">Add</button>
        </form>
        {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
      </div>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Codes</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">User</th>
              <th className="py-2">Code</th>
              <th className="py-2">Reward</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2">{c.user_id}</td>
                <td className="py-2">{c.code}</td>
                <td className="py-2">
                  {c.reward_type} {c.reward_value}
                </td>
              </tr>
            ))}
            {codes.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No codes found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Invites</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Inviter</th>
              <th className="py-2">Invitee</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="py-2">{i.inviter_id}</td>
                <td className="py-2">{i.invitee_email || i.invitee_user_id}</td>
                <td className="py-2">{i.status}</td>
              </tr>
            ))}
            {invites.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No invites found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Rewards</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">User</th>
              <th className="py-2">Type</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.user_id}</td>
                <td className="py-2">{r.type}</td>
                <td className="py-2">{r.amount}</td>
                <td className="py-2">{r.status}</td>
              </tr>
            ))}
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No rewards found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

