import React, { useEffect, useState } from 'react';
import { Download, Filter, Calendar, Search, ArrowUpDown } from "lucide-react";
import DynamicTable from '../../../../components/ui/DynamicTable';
import { getShops, exportShopsCsv } from '../../../../services/ServicesAdmin/ShopProductsServices';
import Pagination from '../../../../components/ui/pagination';
import Loading from '../../../../components/ui/loading';
import NotifyError from '../../../../components/ui/NotifyError';

const shopColumns = [
  { key: "name", label: "Nom du Shop" ,
    render: (shop) => (
      <div className="flex items-center gap-2">
        {shop.shop_name}
        </div>)
  },
  {
    key: "user.name",
    label: "Propriétaire",
    render: (shop) => {
      const name = shop.user?.name || "--";
      const initial = name !== "--" ? name.charAt(0).toUpperCase() : "?";
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold border border-slate-200">
              {initial}
            </div>
            {shop.user?.avatar ? (
              <img
                src={shop.user.avatar}
                alt={name}
                className="absolute inset-0 w-8 h-8 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </div>
          <span className="font-medium text-slate-700">{name}</span>
        </div>
      );
    },
  },
  { key: "products_count", label: "Produits" },
  {
    key: "status",
    label: "Statut",
    render: (shop) => {
      const styles = {
        active: "text-emerald-700 bg-emerald-200 border-emerald-100",
        inactive: "text-slate-600 bg-slate-200 border-slate-100",
        pending: "text-amber-700 bg-amber-200 border-amber-100",
        suspended: "text-rose-700 bg-rose-200 border-rose-100",
      };
      const current = styles[shop.status] || styles.inactive;
      return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${current} capitalize`}>
          {shop.status}
        </span>
      );
    },
  },
];

export default function AllShop() {
  const [shops, setShops] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPaga, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [name, setName] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const Shops = await getShops({
        page,
        per_page: perPage,
        name,
        status: status === "all" ? null : status,
        sort_by: sortBy,
        sort_dir: sortDir,
        date_from: dateFrom || null,
        date_to: dateTo || null,
      }, setError);
      setShops(Shops?.data || []);
      setTotalPage(Shops?.last_page || 1);
      setLoading(false);
    };
    fetchData();
  }, [perPage, page, status, name, sortBy, sortDir, dateFrom, dateTo]);

  const handleExport = async () => {
    const blob = await exportShopsCsv({
      name,
      status: status === "all" ? null : status,
      sort_by: sortBy,
      sort_dir: sortDir,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    });
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shops.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 bg-[#fcfcfd] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestion des Boutiques</h1>
          <p className="text-slate-500 text-sm">Surveillez et gérez les performances des vendeurs</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#008ECC] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#005f73] transition-all shadow-lg shadow-slate-200"
        >
          <Download size={18} />
          Exporter CSV
        </button>
      </div>

      {/* Main Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
          <Menustatus handleStatus={setStatus} status={status} />
          
          <div className="relative w-full xl:w-80 px-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une boutique..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Advanced Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 mt-2 border-t border-gray-50">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Trier par</label>
            <div className="relative flex items-center">
                <ArrowUpDown className="absolute left-3 w-4 h-4 text-slate-400" />
                <select
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                >
                <option value="created_at">Date de création</option>
                <option value="total_sales">Ventes totales</option>
                <option value="total_revenue">Revenu total</option>
                <option value="average_rating">Note moyenne</option>
                </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Ordre</label>
            <select
              className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Du</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                type="date"
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Au</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                type="date"
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loading /></div>
        ) : (
          <>
            <DynamicTable
              data={shops}
              columns={shopColumns}
              actions={{ viewPath: "/admin/shops-details" }}
            />
            {shops.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 font-medium">Aucune boutique trouvée</p>
              </div>
            )}
          </>
        )}
        
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPaga} 
        setCurrentPage={setPage} 
        perPage={perPage} 
        setPerPage={setPerPage} 
      />

      <NotifyError message={error} onClose={() => setError(null)} isVisible={error !== null} />
    </div>
  );
}

const Menustatus = ({ handleStatus, status }) => {
  const tabs = [
    { id: "all", label: "Tous" },
    { id: "active", label: "Actifs" },
    { id: "inactive", label: "Inactifs" },
    { id: "pending", label: "En attente" },
    { id: "suspended", label: "Suspendus" },
  ];

  return (
    <div className="flex p-1 gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleStatus(tab.id)}
          className={`
            px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap
            ${status === tab.id 
              ? "bg-[#0ea5e9] text-white shadow-md shadow-blue-100" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
