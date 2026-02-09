import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserById } from "../../../../services/ServicesAdmin/userServices";
import NotifyError from "../../../../components/ui/NotifyError";

export default function UserLogins() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const response = await getUserById(id, setError);
      setData(response);
    };
    fetchUser();
  }, [id]);

  const user = data?.user;
  const lastLogin = user?.last_login_at;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Logins</h1>
        <Link
          to={`/admin/detaill-user/${id}`}
          className="text-sm text-gray-700 underline"
        >
          Retour au profil
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
            <p className="text-gray-800 font-medium">{user?.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Role</p>
            <p className="text-gray-800 font-medium">{user?.role || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Status</p>
            <p className="text-gray-800 font-medium">{user?.status || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Dernier login</p>
            <p className="text-gray-800 font-medium">
              {lastLogin ? lastLogin : "Aucun login enregistré"}
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          L'historique complet des connexions n'est pas encore disponible. Cette page
          affiche uniquement `last_login_at`.
        </div>
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}
