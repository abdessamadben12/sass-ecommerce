import React, { useState } from "react";
import { getAuthUser } from "../../../Auth/authStore";
import { logoutAdmin } from "../../../Auth/loginAdmin";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "../../../services/ServicesAdmin/ServicesDashbord";
import NotifyError from "../../../components/ui/NotifyError";
import { NotifySuccess } from "../../../components/ui/NotifySucces";
import { useAppSettings } from "../../../context/AppSettingsContext";

export default function AdminProfile() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const { appName, logoUrl } = useAppSettings();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ etats: false, message: "" });
  const [success, setSuccess] = useState({ etats: false, message: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      await createAdminUser(form);
      setSuccess({ etats: true, message: "Admin created successfully" });
      setShowForm(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError({ etats: true, message: err?.response?.data?.message || "Failed to create admin" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={appName || "Logo"} className="h-8 w-8 object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">
                  {(appName || "APP").slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Profile</h1>
            <p className="text-slate-500 text-sm">Manage your account information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 border border-slate-900 text-slate-900 text-sm hover:bg-slate-50"
            >
              Add Admin
            </button>
            <button
              onClick={async () => {
                await logoutAdmin();
                navigate("/login");
              }}
              className="px-4 py-2 bg-[#008ECC] text-white text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Name</p>
            <p className="text-sm font-semibold text-slate-900">{user?.name || "Admin"}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Email</p>
            <p className="text-sm font-semibold text-slate-900">{user?.email || "-"}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Role</p>
            <p className="text-sm font-semibold text-slate-900">{user?.role || "Admin"}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">ID</p>
            <p className="text-sm font-semibold text-slate-900">{user?.id || "-"}</p>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">Account Created</p>
          <p className="text-sm font-semibold text-slate-900">{user?.created_at || "-"}</p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 shadow-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Create Admin</h2>
            <p className="text-xs text-slate-500 mt-1">This form always creates a user with role: admin.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500">Name</label>
                <input
                  className="w-full border px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Email</label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Password</label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 text-sm"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border text-sm"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-[#008ECC] text-white text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {success?.etats && <NotifySuccess message={success.message} sucess={success.etats} onClose={() => setSuccess({ etats: false, message: "" })} />}
      {error?.etats && <NotifyError message={error.message} title={"Error"} isVisible={error.etats} onClose={() => setError({ etats: false, message: "" })} />}
    </div>
  );
}
