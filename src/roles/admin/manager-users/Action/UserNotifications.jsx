import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNotification } from "../../../../services/ServicesAdmin/ServicesDashbord";
import NotifyError from "../../../../components/ui/NotifyError";

export default function UserNotifications() {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotification();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [id]);

  const userNotifications = useMemo(
    () => notifications.filter((n) => String(n.user_id) === String(id)),
    [notifications, id]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <Link
          to={`/admin/detaill-user/${id}`}
          className="text-sm text-gray-700 underline"
        >
          Retour au profil
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="text-gray-500 text-sm">Chargement...</div>
        ) : userNotifications.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Aucune notification pour cet utilisateur.
          </div>
        ) : (
          <div className="space-y-4">
            {userNotifications.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {item.time || item.created_at || ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}
