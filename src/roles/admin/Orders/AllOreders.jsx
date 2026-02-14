import React, { useEffect, useMemo, useState } from "react";
import DynamicTable from "../../../components/ui/DynamicTable";
import InputSearch from "../../../components/ui/InputSearch";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import NotifyError from "../../../components/ui/NotifyError";
import Pagination from "../../../components/ui/pagination";
import Loading from "../../../components/ui/loading";
import Card from "../../../components/ui/card";
import { CheckCircle, Clock, CreditCard, RefreshCcw, ShoppingCart } from "lucide-react";
import { getOrders, StatisticsOrders } from "../../../services/ServicesAdmin/ordersServices";
import { useAppSettings } from "../../../context/AppSettingsContext";

const getStatusBadgeClass = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "completed") return "text-green-700 bg-green-100";
  if (key === "pending") return "text-yellow-700 bg-yellow-100";
  if (key === "paid") return "text-blue-700 bg-blue-100";
  if (key === "shipped") return "text-violet-700 bg-violet-100";
  if (key === "canceled" || key === "cancelled") return "text-red-700 bg-red-100";
  return "text-slate-700 bg-slate-100";
};

export default function AllOrders() {
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
  const [statistics, setStatistics] = useState({});

  const OrdersColumns = useMemo(
    () => [
      {
        key: "order_id",
        label: "Order ID",
        render: (order) => <span className="font-semibold text-slate-700">#{order.id}</span>,
      },
      {
        key: "product",
        label: "Nbr Products",
        render: (order) => order.order_items_count,
      },
      {
        key: "buyer.name",
        label: "Buyer",
        render: (order) => order.user?.name ?? "--",
      },
      {
        key: "total_price",
        label: "Total Price",
        render: (order) => formatCurrency(order?.total_price ?? 0),
      },
      {
        key: "status",
        label: "Status",
        render: (order) => (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
            {order.status || "--"}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Date of Order",
        render: (order) => (order?.created_at ? String(order.created_at).slice(0, 10) : "--"),
      },
    ],
    [formatCurrency]
  );

  const fetchOrders = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await getOrders(
        inputSerch,
        status === "all" ? null : status,
        selectedPeriod?.start,
        selectedPeriod?.end,
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

  const fetchStats = async () => {
    const statisticsData = await StatisticsOrders(setError);
    setStatistics(statisticsData || {});
  };

  const handleRange = (start, end) => {
    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];
    setSelectedPeriod({ start: formattedStart, end: formattedEnd });
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchOrders(1);
  };

  const handleResetFilters = async () => {
    setInputSearch("");
    setSelectedPeriod(null);
    setStatus("all");
    setCurrentPage(1);
    await fetchOrders(1);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, perPage, status]);

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">All Orders</h1>
        <p className="text-slate-500 text-sm">Manage all order requests from users.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card
          title="Total Orders"
          value={statistics?.total_orders || 0}
          icon={<ShoppingCart />}
          bgColor="bg-blue-100 text-blue-700"
          borderColor="border border-blue-200"
        />
        <Card
          title="Total Revenue"
          value={formatCurrency(statistics?.total_sales || 0)}
          icon={<CreditCard />}
          bgColor="bg-blue-100 text-blue-700"
          borderColor="border border-blue-200"
        />
        <Card
          title="Confirmed Orders"
          value={statistics?.total_completed_orders || 0}
          icon={<CheckCircle />}
          bgColor="bg-green-100 text-green-700"
          borderColor="border border-green-200"
        />
        <Card
          title="Pending Orders"
          value={statistics?.total_pending_orders || 0}
          icon={<Clock />}
          bgColor="bg-yellow-100 text-yellow-700"
          borderColor="border border-yellow-200"
        />
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-end">
          <div className="xl:col-span-3">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Filter by status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="xl:col-span-4">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Date range</label>
            <DateRangePicker
              strokePeriods={handleRange}
              searchCallback={handleSearch}
              containerClassName="p-0 max-w-none"
            />
          </div>

          <div className="xl:col-span-3">
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Search</label>
            <InputSearch
              placeholder="Search by buyer / shop"
              inputSerch={inputSerch}
              setInputSearch={setInputSearch}
              searchCallback={handleSearch}
            />
          </div>

          <div className="xl:col-span-2 flex gap-2 sm:justify-end">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none rounded-md border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Apply
            </button>
            <button
              onClick={handleResetFilters}
              className="rounded-md bg-sky-600 px-3 py-2.5 text-white hover:bg-sky-700"
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
          columns={OrdersColumns}
          actions={{
            viewPath: "/admin/detaill-order",
          }}
          emptyMessage="No orders found for current filters."
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





