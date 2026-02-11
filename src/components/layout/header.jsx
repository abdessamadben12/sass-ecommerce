import { Bell, Settings, Menu, ChevronDown, User } from "lucide-react";
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
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 px-10 py-10 z-40 flex h-20 items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100  sm:px-10">
      
      {/* — Gauche : Menu Mobile & Titre — */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
      </div>

      {/* — Droite : Actions & Profil (Input supprimé) — */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`p-2.5 rounded-xl transition-all ${
              notifOpen ? "bg-blue-50 text-[#0ea5e9]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            <Bell size={20} />
            {numberNotification > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {numberNotification}
              </span>
            )}
          </button>
          
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <NotificationCard
                notifications={notifications}
                numberNot={numberNotification}
                onViewAll={() => navigate("/admin/notifications")}
              />
            </div>
          )}
        </div>

        {/* Paramètres */}
        <button
          onClick={() => navigate("/admin/setting")}
          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Settings size={20} />
        </button>

        {/* Separator vertical (optionnel, pour séparer visuellement les icônes du profil) */}
        <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

        {/* Profil Admin */}
        <div className="relative" ref={adminRef}>
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className={`flex items-center gap-3 p-1.5 rounded-xl transition-all ${
              adminOpen ? "bg-slate-50" : "hover:bg-slate-50"
            }`}
          >
            <div className="w-9 h-9 bg-[#0ea5e9] rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-tight">
                {admin?.name || "Administrateur"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">En ligne</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Menu déroulant Admin */}
          {adminOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 mb-2 border-b border-slate-50">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Compte</p>
              </div>
              <button
                className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0ea5e9] transition-colors"
                onClick={() => navigate("/admin/profile")}
              >
                Mon profil
              </button>
              <button
                className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0ea5e9] transition-colors"
                onClick={() => navigate("/admin/setting")}
              >
                Paramètres
              </button>
              <div className="my-1 border-t border-slate-50"></div>
              <button
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                onClick={async () => {
                  await logoutAdmin();
                  navigate("/login");
                }}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}