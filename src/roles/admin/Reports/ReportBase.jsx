import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ReportBase({
  title,
  description,
  columns,
  rows,
  statusOptions,
  chartKey,
  chartLabel,
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [pendingStatus, setPendingStatus] = useState("all");

  const filteredRows = useMemo(() => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const availableDates = new Set(rows.map((r) => r.date).filter(Boolean));
    return rows.filter((row) => {
      const rowDate = row.date ? new Date(row.date) : null;
      const matchesStatus = status === "all" ? true : row.status === status;

      const fromExists = from ? availableDates.has(from) : true;
      const toExists = to ? availableDates.has(to) : true;
      const datesExist = fromExists && toExists;

      const matchesFrom = fromDate && rowDate ? rowDate >= fromDate : true;
      const matchesTo = toDate && rowDate ? rowDate <= toDate : true;
      return matchesStatus && datesExist && matchesFrom && matchesTo;
    });
  }, [rows, from, to, status]);

  const applyFilters = () => {
    setFrom(pendingFrom);
    setTo(pendingTo);
    setStatus(pendingStatus);
  };

  const chartData = filteredRows.map((row) => ({
    name: row.date,
    value: Number(row[chartKey]) || 0,
  }));

  // Fonction interne pour styliser les badges de statut sans changer les data
  const renderStatusBadge = (value) => {
    const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    const style = styles[value] || "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-2 text-lg">{description}</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Barre de Filtres */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date de début</label>
              <input
                type="date"
                value={pendingFrom}
                onChange={(e) => setPendingFrom(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date de fin</label>
              <input
                type="date"
                value={pendingTo}
                onChange={(e) => setPendingTo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filtrer par statut</label>
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={applyFilters}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Filtrer
            </button>
          </div>
        </div>

        {/* Section Graphique */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
            {chartLabel}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Tableau */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {columns.map((col) => (
                    <th key={col.key} className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                      Aucun résultat pour ces filtres.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {columns.map((col) => (
                        <td key={col.key} className="py-4 px-6 text-sm text-slate-600">
                          {col.key === "status" ? (
                             renderStatusBadge(row[col.key])
                          ) : col.key === "amount" ? (
                            <span className="font-semibold text-slate-900">{row[col.key]} €</span>
                          ) : (
                            row[col.key] ?? "-"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
