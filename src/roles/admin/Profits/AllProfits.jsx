import { useEffect, useMemo, useState } from "react";
import DynamicTable from "../../../components/ui/DynamicTable";
import Pagination from "../../../components/ui/pagination";
import NotifyError from "../../../components/ui/NotifyError";
import Loading from "../../../components/ui/loading";
import { getProfits } from "../../../services/ServicesAdmin/ProfitService";
import { useAppSettings } from "../../../context/AppSettingsContext";

export default function AllProfits() {
  const { formatCurrency } = useAppSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [platformPercent, setPlatformPercent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "all", from: "", to: "" });
  const [pending, setPending] = useState(filters);

  const fetchData = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProfits({
        ...filters,
        page,
        per_page: perPage,
      });
      const paginated = res?.rows || {};
      setRows(paginated?.data || []);
      setSummary(res?.summary || {});
      setPlatformPercent(Number(res?.platform_percent || 0));
      setCurrentPage(paginated?.current_page || page);
      setTotalPages(paginated?.last_page || 1);
      setPerPage(paginated?.per_page || perPage);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load profits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [filters, currentPage, perPage]);

  const columns = useMemo(
    () => [
      { key: "seller_name", label: "Seller", render: (row) => row.seller_name || "--" },
      { key: "seller_email", label: "Email", render: (row) => row.seller_email || "--" },
      { key: "shop_name", label: "Shop", render: (row) => row.shop_name || "--" },
      { key: "gross_sales", label: "Gross Sales", render: (row) => formatCurrency(row.gross_sales || 0) },
      { key: "platform_profit", label: "Platform Profit", render: (row) => formatCurrency(row.platform_profit || 0) },
      { key: "seller_profit", label: "Seller Profit", render: (row) => formatCurrency(row.seller_profit || 0) },
      { key: "orders_count", label: "Orders", render: (row) => row.orders_count || 0 },
      { key: "units_sold", label: "Units", render: (row) => row.units_sold || 0 },
    ],
    [formatCurrency]
  );

  const applyFilters = () => {
    setCurrentPage(1);
    setFilters(pending);
  };

  const resetFilters = () => {
    const defaultFilters = { search: "", status: "all", from: "", to: "" };
    setPending(defaultFilters);
    setCurrentPage(1);
    setFilters(defaultFilters);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Profits</h1>
        <p className="text-sm text-slate-500">List of seller profits with platform commission split.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase">Gross Sales</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary?.gross_sales || 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase">Platform Profit</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary?.platform_profit || 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase">Seller Profit</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary?.seller_profit || 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase">Orders</p>
          <p className="text-xl font-bold text-slate-800">{summary?.orders_count || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase">Platform Rate</p>
          <p className="text-xl font-bold text-slate-800">{platformPercent}%</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 p-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-end">
          <div className="xl:col-span-4">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Search seller / shop</label>
            <input
              value={pending.search}
              onChange={(e) => setPending({ ...pending, search: e.target.value })}
              className="w-full border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#008ECC] outline-none"
              placeholder="Name, email, shop..."
            />
          </div>
          <div className="xl:col-span-3">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Order status</label>
            <select
              value={pending.status}
              onChange={(e) => setPending({ ...pending, status: e.target.value })}
              className="w-full border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#008ECC] outline-none"
            >
              <option value="all">Finalized</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">From</label>
            <input
              type="date"
              value={pending.from}
              onChange={(e) => setPending({ ...pending, from: e.target.value })}
              className="w-full border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#008ECC] outline-none"
            />
          </div>
          <div className="xl:col-span-2">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">To</label>
            <input
              type="date"
              value={pending.to}
              onChange={(e) => setPending({ ...pending, to: e.target.value })}
              className="w-full border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#008ECC] outline-none"
            />
          </div>
          <div className="xl:col-span-1 flex gap-2">
            <button onClick={applyFilters} className="w-full bg-[#008ECC] text-white px-3 py-2.5 hover:bg-[#007bb3]">Apply</button>
            <button onClick={resetFilters} className="w-full border border-slate-300 px-3 py-2.5 hover:bg-slate-50">Reset</button>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 p-3">
        <DynamicTable
          data={rows}
          columns={columns}
          actions={{ viewPath: "/admin/profits" }}
          emptyMessage="No profit records found."
        />
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        perPage={perPage}
        setPerPage={setPerPage}
      />

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}

