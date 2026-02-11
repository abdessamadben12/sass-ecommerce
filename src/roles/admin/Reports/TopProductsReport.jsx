import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getTopProductsReport } from "../../../services/ServicesAdmin/ReportsService";
import Loading from "../../../components/ui/loading";
import NotifyError from "../../../components/ui/NotifyError";

const currency = (v) => `${Number(v || 0).toFixed(2)} $`;
const PIE_COLORS = ["#2563EB", "#0EA5E9", "#14B8A6", "#22C55E", "#84CC16", "#F59E0B", "#EF4444", "#8B5CF6", "#F43F5E", "#64748B"];

function TopTable({ title, rows, orderBy }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">#</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Units Sold</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Revenue</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">No data found.</td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${orderBy}-${row.product_id}-${idx}`} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{idx + 1}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{row.product}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{Number(row.units_sold || 0)}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{currency(row.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{Number(row.orders_count || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TopProductsReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topUnits, setTopUnits] = useState([]);
  const [topRevenue, setTopRevenue] = useState([]);
  const [topProduct, setTopProduct] = useState(null);
  const [topCategories, setTopCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTopProductsReport({ from, to, limit: 10 });
      setTopUnits(res?.top_by_units || []);
      setTopRevenue(res?.top_by_revenue || []);
      setTopProduct(res?.top_product || null);
      setTopCategories(res?.top_categories || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load top products report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pieData = useMemo(
    () => topUnits.map((row) => ({ name: row.product, value: Number(row.units_sold || 0) })),
    [topUnits]
  );

  const categoryData = useMemo(
    () => topCategories.map((row) => ({ name: row.category, units: Number(row.units_sold || 0), revenue: Number(row.revenue || 0) })),
    [topCategories]
  );

  return loading ? (
    <Loading />
  ) : (
    <div className="p-4 md:p-8 bg-[#F1F5F9] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Top Products Report</h1>
          <p className="text-slate-500 mt-1 text-lg">Top 10 sold products and top 10 by revenue.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={fetchData}
              className="h-[42px] px-4 rounded-xl bg-[#008ECC] text-white hover:bg-[#007BB5] transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Product Card</h2>
            {topProduct ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-500">Product</div>
                <div className="text-xl font-bold text-slate-900">{topProduct.product}</div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500 uppercase">Units Sold</div>
                    <div className="text-lg font-semibold text-slate-900">{Number(topProduct.units_sold || 0)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500 uppercase">Revenue</div>
                    <div className="text-lg font-semibold text-slate-900">{currency(topProduct.revenue)}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 uppercase">Orders Count</div>
                  <div className="text-lg font-semibold text-slate-900">{Number(topProduct.orders_count || 0)}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400">No top product available.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Top 10 Products Sold (Pie)</h2>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={55}>
                    {pieData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Units"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Categories Containing Best-Selling Products</h2>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 12, right: 12, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === "units" ? value : currency(value), name === "units" ? "Units" : "Revenue"]} />
                <Legend />
                <Bar dataKey="units" name="Units Sold" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TopTable title="Top 10 by Units Sold" rows={topUnits} orderBy="units" />
        <TopTable title="Top 10 by Revenue" rows={topRevenue} orderBy="revenue" />
      </div>
      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}
