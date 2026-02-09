import React, { useEffect, useState } from "react";
import { getNotificationsList, getNotificationDetail, markNotificationRead, markAllNotificationsRead } from "../../../services/ServicesAdmin/ServicesDashbord";
import Pagination from "../../../components/ui/pagination";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchList = async () => {
    const data = await getNotificationsList({
      page,
      per_page: perPage,
      search: search || null,
      status: status === "all" ? null : status,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    });
    setItems(data?.data || []);
    setTotalPages(data?.last_page || 1);
  };

  useEffect(() => {
    fetchList();
  }, [page, perPage, search, status, dateFrom, dateTo]);

  const openNotification = async (id) => {
    const detail = await getNotificationDetail(id);
    setSelected(detail);
    if (detail?.is_read === false) {
      await markNotificationRead(id);
      fetchList();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
            <p className="text-slate-500 text-sm">Manage and review all notifications</p>
          </div>
          <button
            onClick={async () => {
              await markAllNotificationsRead();
              fetchList();
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Mark all as read
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search title or message"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm w-full md:w-64"
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-200 hover:bg-slate-50 ${
                    n.is_read ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900 truncate">{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{n.message}</p>
                  <span className="text-xs text-slate-400">{n.time}</span>
                </button>
              ))}
              {!items.length && (
                <div className="p-6 text-center text-slate-500">No notifications found</div>
              )}
            </div>
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} setCurrentPage={setPage} perPage={perPage} setPerPage={setPerPage} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-slate-200 rounded-xl p-6 min-h-[300px]">
              {selected ? (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selected.time}</p>
                  <div className="mt-4 text-slate-700 whitespace-pre-line">{selected.message}</div>
                  {selected.user ? (
                    <div className="mt-6 text-sm text-slate-500">
                      <span className="font-medium">User:</span> {selected.user?.name} ({selected.user?.email})
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-slate-500">Select a notification to view details.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
