import React, { useEffect, useMemo, useState } from "react";
import DynamicTable from "../../../components/ui/DynamicTable";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import NotifyError from "../../../components/ui/NotifyError";
import Pagination from "../../../components/ui/pagination";
import Loading from "../../../components/ui/loading";
import { RefreshCcw, SearchIcon } from "lucide-react";
import { getTransaction } from "../../../services/ServicesAdmin/TransactionService";
import { useAppSettings } from "../../../context/AppSettingsContext";

const statusMap = ["Pending", "Success", "Failed"];

const statusBadge = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "success") return "text-green-700 bg-green-100";
  if (key === "pending") return "text-yellow-700 bg-yellow-100";
  if (key === "failed") return "text-red-700 bg-red-100";
  return "text-slate-700 bg-slate-100";
};

const typeBadge = (type) => {
  const key = String(type || "");
  if (key === "+") return "text-emerald-700 bg-emerald-100";
  if (key === "-") return "text-rose-700 bg-rose-100";
  return "text-slate-700 bg-slate-100";
};

export function AllTransaction() {
  const { formatCurrency } = useAppSettings();
  const [inputSerch, setInputSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [dataOrders, setDataOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");

  const TransactionColumns = useMemo(
    () => [
      {
        key: "trx",
        label: "Trx",
        render: (transaction) => <span className="font-semibold text-slate-700">{transaction.trx ?? transaction.id}</span>,
      },
      {
        key: "user.name",
        label: "User Name",
        render: (transaction) => transaction.user?.name ?? "--",
      },
      {
        key: "amount",
        label: "Amount",
        render: (transaction) => formatCurrency(transaction.amount ?? 0),
      },
      {
        key: "trx_type",
        label: "Type",
        render: (transaction) => (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadge(transaction.trx_type)}`}>
            {transaction.trx_type ?? "--"}
          </span>
        ),
      },
      {
        key: "remark",
        label: "Remark",
        render: (transaction) => transaction.remark ?? "--",
      },
      {
        key: "status",
        label: "Status",
        render: (transaction) => (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(transaction.status)}`}>
            {transaction.status ?? "--"}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Date",
        render: (transaction) => (transaction?.created_at ? String(transaction.created_at).slice(0, 10) : "--"),
      },
    ],
    [formatCurrency]
  );

  const fetchTransactions = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await getTransaction(
        status === "all" ? null : status,
        inputSerch,
        selectedPeriod?.start || null,
        selectedPeriod?.end || null,
        page,
        perPage,
        setError
      );
      setDataOrders(data?.data || []);
      setTotalPages(data?.last_page || 1);
      setCurrentPage(data?.current_page || page);
      setPerPage(data?.per_page || perPage);
    } finally {
      setLoading(false);
    }
  };

  const handleRange = (start, end) => {
    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];
    setSelectedPeriod({ start: formattedStart, end: formattedEnd });
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchTransactions(1);
  };

  const handleReset = async () => {
    setStatus("all");
    setInputSearch("");
    setSelectedPeriod(null);
    setCurrentPage(1);
    await fetchTransactions(1);
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, perPage, status, selectedPeriod]);

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">All Transactions</h1>
        <p className="text-slate-500 text-sm">Manage all transaction requests from users.</p>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-end">
          <div className="xl:col-span-3">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Filter by status</label>
            <select
              name="status"
              onChange={(e) => setStatus(e.target.value)}
              value={status}
              className="w-full border border-slate-300 rounded-md p-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All</option>
              {statusMap.map((statusItem, index) => (
                <option key={index} value={statusItem.toLowerCase()}>
                  {statusItem}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-3">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Search</label>
            <input
              type="text"
              value={inputSerch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Search by transaction ID"
            />
          </div>

          <div className="xl:col-span-4">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Date range</label>
            <DateRangePicker
              strokePeriods={handleRange}
              searchCallback={handleSearch}
              NotIcon={true}
              containerClassName="p-0 max-w-none"
            />
          </div>

          <div className="xl:col-span-2 flex gap-2 sm:justify-end">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none bg-[#008ECC] text-white font-semibold rounded-md px-4 py-2.5 flex justify-center items-center gap-2 hover:bg-[#007bb3]"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={handleReset}
              className="rounded-md bg-slate-100 text-slate-700 px-3 py-2.5 hover:bg-slate-200"
              title="Reset filters"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-2 sm:p-3">
        <DynamicTable
          data={dataOrders}
          columns={TransactionColumns}
          actions={{
            viewPath: "/admin/detaill-transaction",
          }}
          emptyMessage="No transactions found for current filters."
        />
      </section>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={error !== null} />

      <div className="pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </div>
    </div>
  );
}
