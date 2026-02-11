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
import Loading from "../loading";
import NotifyError from "../NotifyError";

const PIE_COLORS = ["#2563EB", "#0EA5E9", "#14B8A6", "#22C55E", "#84CC16", "#F59E0B", "#EF4444", "#8B5CF6", "#F43F5E", "#64748B"];
const money = (v) => `${Number(v || 0).toFixed(2)} $`;

export default function TopProductsDashboardCharts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topProduct, setTopProduct] = useState(null);
  const [topByUnits, setTopByUnits] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTopProductsReport({ limit: 10 });
      setTopProduct(res?.top_product || null);
      setTopByUnits(res?.top_by_units || []);
      setTopCategories(res?.top_categories || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load top products charts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pieData = useMemo(
    () => topByUnits.map((row) => ({ name: row.product, value: Number(row.units_sold || 0) })),
    [topByUnits]
  );

  const categoryData = useMemo(
    () => topCategories.map((row) => ({ name: row.category, units: Number(row.units_sold || 0), revenue: Number(row.revenue || 0) })),
    [topCategories]
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Product Card</h2>
        {topProduct ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500 uppercase">Product</div>
              <div className="text-base font-bold text-slate-900">{topProduct.product}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500 uppercase">Units Sold</div>
              <div className="text-base font-semibold text-slate-900">{Number(topProduct.units_sold || 0)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500 uppercase">Revenue</div>
              <div className="text-base font-semibold text-slate-900">{money(topProduct.revenue)}</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400">No top product data.</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Top 10 Products Sold</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={45}>
                  {pieData.map((_, idx) => (
                    <Cell key={`pie-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Units"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Top Categories by Sales</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === "units" ? value : money(value), name === "units" ? "Units" : "Revenue"]} />
                <Legend />
                <Bar dataKey="units" name="Units Sold" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}

