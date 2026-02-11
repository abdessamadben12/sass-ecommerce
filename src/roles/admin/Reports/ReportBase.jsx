import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Pagination from "../../../components/ui/pagination";
import NotifyError from "../../../components/ui/NotifyError";
import Loading from "../../../components/ui/loading";

function ReportBase({
  title,
  description,
  columns,
  statusOptions,
  chartLabel,
  fetchReport,
  valueType = "number",
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [apiStatusOptions, setApiStatusOptions] = useState([]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReport({
        from,
        to,
        status,
        page: currentPage,
        perPage: Number(perPage),
      });

      const paginatedRows = res?.rows || {};
      setRows(paginatedRows?.data || []);
      setCurrentPage(paginatedRows?.current_page || 1);
      setPerPage(paginatedRows?.per_page || 10);
      setTotalPages(paginatedRows?.last_page || 1);
      setChartData((res?.chart || []).map((item) => ({ name: item.date, value: Number(item.value) || 0 })));
      setApiStatusOptions(res?.status_options || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [fetchReport, from, to, status, currentPage, perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadReport]);

  useEffect(() => {
    setCurrentPage(1);
  }, [from, to, status]);

  const finalStatusOptions = useMemo(() => {
    if (statusOptions?.length) return statusOptions;
    return apiStatusOptions;
  }, [statusOptions, apiStatusOptions]);

  const getStatusColor = (val) => {
    switch ((val || "").toLowerCase()) {
      case "paid":
      case "success":
      case "active":
      case "approved":
      case "authenticated":
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
      case "assigned":
      case "in_progress":
      case "shipped":
      case "draft":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
      case "failed":
      case "rejected":
      case "inactive":
      case "anonymous":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const renderCell = (row, col) => {
    if (typeof col.render === "function") return col.render(row);
    if (col.key === "status") {
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(row[col.key])}`}>
          {row[col.key] || "-"}
        </span>
      );
    }
    if (col.key === "amount" && valueType === "currency") {
      const v = Number(row[col.key] || 0);
      return <span className="font-bold text-slate-900">{v.toFixed(2)} $</span>;
    }
    return row[col.key] ?? "-";
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="p-4 md:p-8 bg-[#F1F5F9] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1 text-lg">{description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All</option>
                {finalStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{chartLabel}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {columns.map((col) => (
                    <th key={col.key} className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-10 text-center text-slate-400 font-medium">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id || `${row.date}-${row.status}-${row.source || "row"}`} className="hover:bg-slate-50 transition-colors">
                      {columns.map((col) => (
                        <td key={col.key} className="py-4 px-6 text-sm text-slate-700">
                          {renderCell(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}

export { ReportBase };
export default ReportBase;
