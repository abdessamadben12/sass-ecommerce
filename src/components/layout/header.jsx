import {
  Bell,
  Settings,
  Menu,
  ChevronDown,
  Search,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationCard } from "../ui/NotificationCard";
import { logoutAdmin } from "../../Auth/loginAdmin";
import { getAuthUser } from "../../Auth/authStore";

export function Header({ title = "Dashboard", onToggleSidebar, notifications, numberNotification }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const notifRef = useRef(null);
  const adminRef = useRef(null);
  const navigate = useNavigate();
  const admin = getAuthUser();

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-l-2 border-gray-400 shadow-md sticky top-0 z-40 px-4 sm:px-6 py-5 bg-indigo-900">
      <div className="flex items-center space-x-4 ">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-indigo-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden md:flex flex-1 mx-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full border-[1px] border-gray-500 rounded p-2 text-sm focus:outline-none focus:ring focus:shadow-lg focus:border-blue-300 bg-indigo-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-2 transform -translate-y-6" />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-gray-500 hover:text-indigo-600 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {numberNotification}
            </span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50">
              <NotificationCard
                notifications={notifications}
                numberNot={numberNotification}
                onViewAll={() => navigate("/admin/notifications")}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/admin/setting")}
          className="text-gray-500 hover:text-indigo-600 focus:outline-none"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="relative text-gray-500 " ref={adminRef}>
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className="flex items-center space-x-1 focus:outline-none"
          >
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-800" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-500">
              {admin?.name || "Admin"}
            </span>
            <ChevronDown className="w-4 h-4 text-indigo-600" />
          </button>
          {adminOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
              <ul className="text-sm text-gray-700">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate("/admin/profile")}
                >
                  Mon profil
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate("/admin/setting")}
                >
                  Parametres
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={async () => {
                    await logoutAdmin();
                    navigate("/login");
                  }}
                >
                  Deconnexion
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
