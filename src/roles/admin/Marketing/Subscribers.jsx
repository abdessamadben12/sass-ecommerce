import { useEffect, useState } from "react";
import { getSubscribers } from "../../../services/ServicesAdmin/SubscribersService";
import NotifyError from "../../../components/ui/NotifyError";
import Pagination from "../../../components/ui/pagination";
import Loading from "../../../components/ui/loading";

export default function Subscribers() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubscribers = async (pageOverride = currentPage) => {
    setLoading(true);
    try {
      const res = await getSubscribers({
        query: search,
        page: pageOverride,
        perPage,
      });

      setItems(res?.subscribers?.data || []);
      setTotal(res?.total || 0);
      setTotalPages(res?.subscribers?.last_page || 1);
      setCurrentPage(res?.subscribers?.current_page || 1);
      setPerPage(res?.subscribers?.per_page || 10);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, perPage]);

  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchSubscribers(1);
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold text-gray-700">Subscribers</h1>
      <p className="text-gray-500 text-sm mb-6">Manage newsletter subscribers list.</p>

      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search by email..."
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <button
          className="border rounded px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 text-sm text-slate-700 font-medium">
          Total: {total}
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 border-b">ID</th>
              <th className="text-left px-4 py-3 border-b">Email</th>
              <th className="text-left px-4 py-3 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{row.id}</td>
                  <td className="px-4 py-3 border-b">{row.email}</td>
                  <td className="px-4 py-3 border-b">{row.created_at?.split("T")[0] || "--"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="translate-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={error !== null} />
    </div>
  );
}
