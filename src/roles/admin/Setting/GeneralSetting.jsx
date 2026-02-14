import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Mail,
  Percent,
  Cloud,
  CreditCard,
  Eye,
  UploadCloud,
  Save,
  Globe
} from "lucide-react";
import {
  getGeneralSettings,
  updateGeneralSettings,
  getEmailSettings,
  updateEmailSettings,
  getCommissionSettings,
  updateCommissionSettings,
  getStorageSettings,
  updateStorageSettings,
  getPoliciesSettings,
  updatePoliciesSettings,
  getNotificationsSettings,
  updateNotificationsSettings,
  getMaintenanceSettings,
  updateMaintenanceSettings,
  getSeoSettings,
  updateSeoSettings,
  getPaymentSettings,
  updatePaymentSettings,
  uploadLogo,
  uploadFavicon,
} from "../../../services/ServicesAdmin/SettingsService";
import { getTemplates } from "../../../services/ServicesAdmin/TemplateService";
import NotifyError from "../../../components/ui/NotifyError";
import { NotifySuccess } from "../../../components/ui/NotifySucces";
import { useAppSettings } from "../../../context/AppSettingsContext";

export default function GeneralSetting() {
  const navigate = useNavigate();
  const { refreshSettings } = useAppSettings();
  const [tab, setTab] = useState("general");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailTemplates, setEmailTemplates] = useState([]);

  const generalDefaults = {
    app_name: "", app_url: "", frontend_url: "", support_email: "",
    logo_url: "", favicon_url: "", default_currency: "USD",
  };
  const emailDefaults = {
    is_enabled: true, driver: "smtp", host: "", port: "", username: "",
    password: "", encryption: "", from_address: "", from_name: "", reply_to: "",
  };
  const commissionDefaults = {
    platform_percent: 0, seller_percent: 0, buyer_fee_percent: 0, min_withdrawal: 0,
  };
  const storageDefaults = {
    provider: "local", endpoint: "", region: "", bucket: "",
    access_key: "", secret_key: "", public_url: "", max_upload_mb: 50, allowed_mimes: "",
  };
  const paymentDefaults = {
    provider: "default", is_enabled: false, currency: "USD",
    platform_fee_percent: 0, min_withdrawal: 0, config: "{}",
  };
  const policiesDefaults = {
    terms_of_use: "",
    privacy_policy: "",
    legal_notice: "",
  };
  const notificationsDefaults = {
    alerts_enabled: "true",
    alerts_email: "",
    system_emails_enabled: "true",
  };
  const maintenanceDefaults = {
    maintenance_mode: "false",
    maintenance_message: "",
  };
  const seoDefaults = {
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_base: "",
    robots: "index,follow",
    robots_url: "",
    sitemap_url: "",
  };

  const [general, setGeneral] = useState(generalDefaults);
  const [email, setEmail] = useState(emailDefaults);
  const [commission, setCommission] = useState(commissionDefaults);
  const [storage, setStorage] = useState(storageDefaults);
  const [payment, setPayment] = useState(paymentDefaults);
  const [policies, setPolicies] = useState(policiesDefaults);
  const [notifications, setNotifications] = useState(notificationsDefaults);
  const [maintenance, setMaintenance] = useState(maintenanceDefaults);
  const [seo, setSeo] = useState(seoDefaults);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, e, c, s, p, pol, noti, maint, seoData] = await Promise.all([
          getGeneralSettings(),
          getEmailSettings(),
          getCommissionSettings(),
          getStorageSettings(),
          getPaymentSettings(),
          getPoliciesSettings(),
          getNotificationsSettings(),
          getMaintenanceSettings(),
          getSeoSettings(),
        ]);
        const templatesRes = await getTemplates(null, () => {});
        const templatesItems = templatesRes?.data || [];
        setEmailTemplates(
          templatesItems.filter((tpl) => String(tpl?.type || "").startsWith("email_"))
        );
        setGeneral({ ...generalDefaults, ...g });
        setEmail({ ...emailDefaults, ...e });
        setCommission({ ...commissionDefaults, ...c });
        setStorage({
          ...storageDefaults,
          ...s,
          allowed_mimes: Array.isArray(s?.allowed_mimes)
            ? s.allowed_mimes.join(",")
            : s?.allowed_mimes || "",
        });
        setPolicies({ ...policiesDefaults, ...pol });
        setNotifications({ ...notificationsDefaults, ...noti });
        setMaintenance({ ...maintenanceDefaults, ...maint });
        setSeo({ ...seoDefaults, ...seoData });
        if (Array.isArray(p) && p.length) {
          const first = p[0];
          setPayment({
            ...paymentDefaults,
            ...first,
            config: first?.config ? JSON.stringify(first.config) : "{}",
          });
        } else {
          setPayment(paymentDefaults);
        }
      } catch (err) {
        setError(err?.message || "Erreur de chargement.");
      }
    };
    load();
  }, []);

  const saveGeneral = async () => {
    setError(""); setSuccess("");
    try {
      await updateGeneralSettings(general);
      await refreshSettings();
      setSuccess("Paramètres généraux enregistrés.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setError(""); setSuccess("");
    try {
      const res = await uploadLogo(file);
      setGeneral((prev) => ({ ...prev, logo_url: res.logo_url }));
      await refreshSettings();
      setSuccess("Logo mis à jour.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const handleFaviconUpload = async (file) => {
    if (!file) return;
    setError(""); setSuccess("");
    try {
      const res = await uploadFavicon(file);
      setGeneral((prev) => ({ ...prev, favicon_url: res.favicon_url }));
      await refreshSettings();
      setSuccess("Favicon mis à jour.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveEmail = async () => {
    setError(""); setSuccess("");
    try {
      await updateEmailSettings({ ...email, port: email.port ? Number(email.port) : null });
      setSuccess("Paramètres email enregistrés.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveCommission = async () => {
    setError(""); setSuccess("");
    try {
      await updateCommissionSettings(commission);
      setSuccess("Commissions enregistrées.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveStorage = async () => {
    setError(""); setSuccess("");
    try {
      const payload = {
        ...storage,
        max_upload_mb: Number(storage.max_upload_mb || 0),
        allowed_mimes: storage.allowed_mimes
          ? storage.allowed_mimes.split(",").map((m) => m.trim()).filter(Boolean)
          : [],
      };
      await updateStorageSettings(payload);
      setSuccess("Stockage enregistré.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const savePayment = async () => {
    setError(""); setSuccess("");
    try {
      const parsed = payment.config ? JSON.parse(payment.config) : {};
      await updatePaymentSettings({ ...payment, config: parsed });
      setSuccess("Paiement enregistré.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const savePolicies = async () => {
    setError(""); setSuccess("");
    try {
      await updatePoliciesSettings(policies);
      setSuccess("Politiques enregistrées.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveNotifications = async () => {
    setError(""); setSuccess("");
    try {
      await updateNotificationsSettings(notifications);
      setSuccess("Notifications enregistrées.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveMaintenance = async () => {
    setError(""); setSuccess("");
    try {
      await updateMaintenanceSettings(maintenance);
      setSuccess("Maintenance enregistrée.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const saveSeo = async () => {
    setError(""); setSuccess("");
    try {
      if (seo.robots_url && !/^https?:\/\/.+/i.test(seo.robots_url)) {
        setError("Robots File URL must start with http:// or https://");
        return;
      }
      if (seo.sitemap_url && !/^https?:\/\/.+/i.test(seo.sitemap_url)) {
        setError("Sitemap File URL must start with http:// or https://");
        return;
      }
      await updateSeoSettings(seo);
      setSuccess("SEO enregistré.");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const tabs = [
    { id: "general", label: "Général", icon: <Settings size={18} /> },
    { id: "payment", label: "Paiements", icon: <CreditCard size={18} /> },
    { id: "policies", label: "Politiques", icon: <Globe size={18} /> },
    { id: "email", label: "Email", icon: <Mail size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Mail size={18} /> },
    { id: "email_templates", label: "Templates Email", icon: <Mail size={18} /> },
    { id: "maintenance", label: "Maintenance", icon: <Settings size={18} /> },
    { id: "seo", label: "SEO", icon: <Globe size={18} /> },
    { id: "commission", label: "Commission", icon: <Percent size={18} /> },
    { id: "storage", label: "Stockage", icon: <Cloud size={18} /> },
    { id: "current", label: "Aperçu", icon: <Eye size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuration Système</h1>
          <p className="text-gray-500 mt-1">Gérez les paramètres globaux de votre plateforme.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-[#008ECC] text-white shadow-lg shadow-blue-100"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {tab === "general" && (
              <Section title="Paramètres Généraux" icon={<Globe className="text-[#008ECC]" />}>
                <Field label="Nom de l'App" value={general.app_name} onChange={(v) => setGeneral({ ...general, app_name: v })} />
                <Field label="URL Backend" value={general.app_url} onChange={(v) => setGeneral({ ...general, app_url: v })} />
                <Field label="URL Frontend" value={general.frontend_url} onChange={(v) => setGeneral({ ...general, frontend_url: v })} />
                <Field label="Email Support" value={general.support_email} onChange={(v) => setGeneral({ ...general, support_email: v })} />
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Logo de la plateforme</label>
                    {general.logo_url && <img src={general.logo_url} alt="Logo" className="h-12 mb-3 rounded" />}
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                    />
                    <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-600">
                      <UploadCloud size={16} /> Choisir un logo
                    </label>
                  </div>

                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Favicon</label>
                    {general.favicon_url && <img src={general.favicon_url} alt="Favicon" className="h-8 mb-3 rounded" />}
                    <input
                      type="file"
                      id="favicon-upload"
                      className="hidden"
                      onChange={(e) => handleFaviconUpload(e.target.files?.[0])}
                    />
                    <label htmlFor="favicon-upload" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-600">
                      <UploadCloud size={16} /> Choisir un favicon
                    </label>
                  </div>
                </div>

                <Field label="Devise par défaut" value={general.default_currency} onChange={(v) => setGeneral({ ...general, default_currency: v })} />
                <SaveButton onClick={saveGeneral} />
              </Section>
            )}

            {tab === "email" && (
              <Section title="Configuration SMTP" icon={<Mail className="text-[#008ECC]" />}>
                <Field label="Driver" value={email.driver} onChange={(v) => setEmail({ ...email, driver: v })} />
                <Field label="Hôte" value={email.host} onChange={(v) => setEmail({ ...email, host: v })} />
                <Field label="Port" value={email.port} onChange={(v) => setEmail({ ...email, port: v })} />
                <Field label="Utilisateur" value={email.username} onChange={(v) => setEmail({ ...email, username: v })} />
                <Field label="Mot de passe" type="password" value={email.password} onChange={(v) => setEmail({ ...email, password: v })} />
                <Field label="Encryption" value={email.encryption} onChange={(v) => setEmail({ ...email, encryption: v })} />
                <Field label="Adresse d'envoi" value={email.from_address} onChange={(v) => setEmail({ ...email, from_address: v })} />
                <Field label="Nom d'envoi" value={email.from_name} onChange={(v) => setEmail({ ...email, from_name: v })} />
                <SaveButton onClick={saveEmail} />
              </Section>
            )}

            {tab === "email_templates" && (
              <Section title="Templates Email" icon={<Mail className="text-[#008ECC]" />}>
                <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">
                    Gerer les templates utilises par le module Email Marketing.
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Templates email trouves: <span className="font-semibold">{emailTemplates.length}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/all-templates")}
                      className="rounded-lg bg-[#008ECC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0077aa]"
                    >
                      Voir tous les templates
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/setting-create-templates")}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Creer un template email
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/email-marketing")}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Ouvrir Email Marketing
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  {emailTemplates.slice(0, 8).map((tpl) => (
                    <div key={tpl.id} className="rounded-lg border border-gray-200 bg-white p-3">
                      <p className="text-sm font-semibold text-gray-800">{tpl.name}</p>
                      <p className="text-xs text-gray-500">{tpl.type}</p>
                    </div>
                  ))}
                  {emailTemplates.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun template email configure.</p>
                  )}
                </div>
              </Section>
            )}

            {tab === "commission" && (
              <Section title="Gestion des Commissions" icon={<Percent className="text-[#008ECC]" />}>
                <Field label="Part Plateforme (%)" type="number" value={commission.platform_percent} onChange={(v) => setCommission({ ...commission, platform_percent: v })} />
                <Field label="Part Vendeur (%)" type="number" value={commission.seller_percent} onChange={(v) => setCommission({ ...commission, seller_percent: v })} />
                <Field label="Frais Acheteur (%)" type="number" value={commission.buyer_fee_percent} onChange={(v) => setCommission({ ...commission, buyer_fee_percent: v })} />
                <Field label="Retrait Minimum" type="number" value={commission.min_withdrawal} onChange={(v) => setCommission({ ...commission, min_withdrawal: v })} />
                <SaveButton onClick={saveCommission} />
              </Section>
            )}

            {tab === "storage" && (
              <Section title="Stockage Cloud" icon={<Cloud className="text-[#008ECC]" />}>
                <Field label="Fournisseur" value={storage.provider} onChange={(v) => setStorage({ ...storage, provider: v })} />
                <Field label="Endpoint" value={storage.endpoint} onChange={(v) => setStorage({ ...storage, endpoint: v })} />
                <Field label="Région" value={storage.region} onChange={(v) => setStorage({ ...storage, region: v })} />
                <Field label="Bucket" value={storage.bucket} onChange={(v) => setStorage({ ...storage, bucket: v })} />
                <Field label="Clé d'accès" value={storage.access_key} onChange={(v) => setStorage({ ...storage, access_key: v })} />
                <Field label="Clé secrète" type="password" value={storage.secret_key} onChange={(v) => setStorage({ ...storage, secret_key: v })} />
                <Field label="Max Upload (MB)" type="number" value={storage.max_upload_mb} onChange={(v) => setStorage({ ...storage, max_upload_mb: v })} />
                <Field label="Mimes autorisés (csv)" value={storage.allowed_mimes} onChange={(v) => setStorage({ ...storage, allowed_mimes: v })} />
                <SaveButton onClick={saveStorage} />
              </Section>
            )}

            {tab === "payment" && (
              <Section title="Paiements & Passerelles" icon={<CreditCard className="text-[#008ECC]" />}>
                <Field label="Fournisseur" value={payment.provider} onChange={(v) => setPayment({ ...payment, provider: v })} />
                <Field label="Devise" value={payment.currency} onChange={(v) => setPayment({ ...payment, currency: v })} />
                <Field label="Frais Plateforme (%)" type="number" value={payment.platform_fee_percent} onChange={(v) => setPayment({ ...payment, platform_fee_percent: v })} />
                <div className="md:col-span-2">
                   <Field label="Configuration (JSON)" value={payment.config} onChange={(v) => setPayment({ ...payment, config: v })} />
                </div>
                <SaveButton onClick={savePayment} />
              </Section>
            )}

            {tab === "policies" && (
              <Section title="Politiques & Légalité" icon={<Globe className="text-[#008ECC]" />}>
                <TextArea label="CGU" value={policies.terms_of_use} onChange={(v) => setPolicies({ ...policies, terms_of_use: v })} />
                <TextArea label="Politique de confidentialité" value={policies.privacy_policy} onChange={(v) => setPolicies({ ...policies, privacy_policy: v })} />
                <TextArea label="Mentions légales" value={policies.legal_notice} onChange={(v) => setPolicies({ ...policies, legal_notice: v })} />
                <SaveButton onClick={savePolicies} />
              </Section>
            )}

            {tab === "notifications" && (
              <Section title="Notifications & Emails" icon={<Mail className="text-[#008ECC]" />}>
                <BooleanField label="Alertes activ?es" value={notifications.alerts_enabled} onChange={(v) => setNotifications({ ...notifications, alerts_enabled: v })} />
                <Field label="Email des alertes" value={notifications.alerts_email} onChange={(v) => setNotifications({ ...notifications, alerts_email: v })} />
                <BooleanField label="Emails syst?me" value={notifications.system_emails_enabled} onChange={(v) => setNotifications({ ...notifications, system_emails_enabled: v })} />
                <SaveButton onClick={saveNotifications} />
              </Section>
            )}

            {tab === "maintenance" && (
              <Section title="Maintenance" icon={<Settings className="text-[#008ECC]" />}>
                <BooleanField label="Mode maintenance" value={maintenance.maintenance_mode} onChange={(v) => setMaintenance({ ...maintenance, maintenance_mode: v })} />
                <TextArea label="Message de maintenance" value={maintenance.maintenance_message} onChange={(v) => setMaintenance({ ...maintenance, maintenance_message: v })} />
                <SaveButton onClick={saveMaintenance} />
              </Section>
            )}

            {tab === "seo" && (
              <Section title="SEO & Visibilité" icon={<Globe className="text-[#008ECC]" />}>
                <Field label="Meta Title" value={seo.meta_title} onChange={(v) => setSeo({ ...seo, meta_title: v })} />
                <TextArea label="Meta Description" value={seo.meta_description} onChange={(v) => setSeo({ ...seo, meta_description: v })} />
                <Field label="Meta Keywords" value={seo.meta_keywords} onChange={(v) => setSeo({ ...seo, meta_keywords: v })} />
                <Field label="Canonical Base" value={seo.canonical_base} onChange={(v) => setSeo({ ...seo, canonical_base: v })} />
                <Field label="Robots Meta (index,follow)" value={seo.robots} onChange={(v) => setSeo({ ...seo, robots: v })} />
                <Field label="Robots File URL" value={seo.robots_url} onChange={(v) => setSeo({ ...seo, robots_url: v })} />
                <Field label="Sitemap File URL" value={seo.sitemap_url} onChange={(v) => setSeo({ ...seo, sitemap_url: v })} />
                <SaveButton onClick={saveSeo} />
              </Section>
            )}

            {tab === "current" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                   <Eye className="text-[#008ECC]" />
                   <h2 className="text-xl font-bold text-gray-800">Récapitulatif des réglages</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#008ECC] uppercase text-xs tracking-wider">Application</h3>
                    <Key label="App Name" value={general.app_name} />
                    <Key label="Default Currency" value={general.default_currency} />
                    <h3 className="font-bold text-[#008ECC] uppercase text-xs tracking-wider mt-6">Email</h3>
                    <Key label="Host" value={email.host} />
                    <Key label="From" value={email.from_address} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#008ECC] uppercase text-xs tracking-wider">Finances</h3>
                    <Key label="Platform %" value={`${commission.platform_percent}%`} />
                    <Key label="Min Withdrawal" value={commission.min_withdrawal} />
                    <h3 className="font-bold text-[#008ECC] uppercase text-xs tracking-wider mt-6">Stockage</h3>
                    <Key label="Provider" value={storage.provider} />
                    <Key label="Bucket" value={storage.bucket} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <NotifyError message={error} onClose={() => setError("")} isVisible={!!error} />
        {success && (
          <NotifySuccess message={success} sucess={true} onClose={() => setSuccess("")} />
        )}
      </div>
    </div>
  );
}

// --- Sous-composants stylisés ---

function Section({ title, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#008ECC]/20 focus:border-[#008ECC] outline-none transition-all bg-white"
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Entrez ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function BooleanField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <select
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#008ECC]/20 focus:border-[#008ECC] outline-none transition-all bg-white"
        value={String(value ?? "true")}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </div>
  );
}
function SaveButton({ onClick }) {
  return (
    <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#008ECC] hover:bg-[#0077aa] text-white text-sm font-bold transition-all transform active:scale-95 shadow-md shadow-blue-100"
      >
        <Save size={18} /> Enregistrer les modifications
      </button>
    </div>
  );
}

function Key({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">
        {value || "--"}
      </span>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 md:col-span-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-h-[140px] focus:ring-2 focus:ring-[#008ECC]/20 focus:border-[#008ECC] outline-none transition-all bg-white"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Entrez ${label.toLowerCase()}...`}
      />
    </div>
  );
}
