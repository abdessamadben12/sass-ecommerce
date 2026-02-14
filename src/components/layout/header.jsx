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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setNotifOpen(false);
      setAdminOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const badgeCount = numberNotification > 99 ? "99+" : numberNotification;

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
          type="button"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="truncate text-base font-bold tracking-tight text-slate-800 sm:text-lg md:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setAdminOpen(false);
            }}
            className={`rounded-xl p-2.5 transition-all ${
              notifOpen ? "bg-blue-50 text-[#0ea5e9]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
            aria-label="Open notifications"
            aria-expanded={notifOpen}
            type="button"
          >
            <Bell size={20} />
            {numberNotification > 0 && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {badgeCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200 animate-in fade-in zoom-in-95 duration-200">
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
          className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
          aria-label="Open settings"
          type="button"
        >
          <Settings size={20} />
        </button>

        <div className="mx-1 hidden h-8 w-[1px] bg-slate-100 sm:block" />

        <div className="relative" ref={adminRef}>
          <button
            onClick={() => {
              setAdminOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl p-1.5 transition-all ${
              adminOpen ? "bg-slate-50" : "hover:bg-slate-50"
            }`}
            aria-label="Open profile menu"
            aria-expanded={adminOpen}
            type="button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0ea5e9] shadow-md shadow-blue-100">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold leading-tight text-slate-700">{admin?.name || "Administrator"}</p>
              <p className="text-[11px] font-medium text-slate-400">Online</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`}
            />
          </button>

          {adminOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl shadow-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="mb-2 border-b border-slate-50 px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</p>
              </div>
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0ea5e9]"
                onClick={() => navigate("/admin/profile")}
                type="button"
              >
                My profile
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0ea5e9]"
                onClick={() => navigate("/admin/setting")}
                type="button"
              >
                Settings
              </button>
              <div className="my-1 border-t border-slate-50" />
              <button
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                onClick={async () => {
                  await logoutAdmin();
                  navigate("/login");
                }}
                type="button"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

