import { useEffect, useMemo, useState } from "react";
import { sendMarketingEmail, searchMarketingRecipients } from "../../../services/ServicesAdmin/MarketingService";
import NotifyError from "../../../components/ui/NotifyError";
import { NotifySuccess } from "../../../components/ui/NotifySucces";
import { getTemplates } from "../../../services/ServicesAdmin/TemplateService";

export default function EmailMarketing() {
  const [form, setForm] = useState({
    subject: "",
    content: "",
    target: "subscribers",
    userIds: "",
    recipientQuery: "",
    selectedRecipients: [],
    templateId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const parseUserIds = (raw) =>
    raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v) && v > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const payload = {
        subject: form.subject,
        content: form.content,
        target: form.target,
      };
      if (form.target === "users") {
        const idsFromInput = parseUserIds(form.userIds);
        const idsFromSelected = form.selectedRecipients
          .filter((r) => r.type === "user")
          .map((r) => r.id);
        payload.user_ids = Array.from(new Set([...idsFromInput, ...idsFromSelected]));
      }
      if (form.target === "subscribers") {
        const emails = form.selectedRecipients
          .filter((r) => r.type === "subscriber")
          .map((r) => r.email);
        if (emails.length > 0) {
          payload.subscriber_emails = emails;
        }
      }
      const res = await sendMarketingEmail(payload);
      setSuccess(res?.message || "Email envoyé.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'envoi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadTemplates = async () => {
      try {
        setTemplateLoading(true);
        const res = await getTemplates(null, () => {});
        const items = res?.data || res?.items || res || [];
        const emailTemplates = (items?.data || items).filter((t) =>
          String(t.type || "").startsWith("email_")
        );
        if (isMounted) setTemplates(emailTemplates);
      } finally {
        if (isMounted) setTemplateLoading(false);
      }
    };
    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.recipientQuery && form.recipientQuery !== "") return;
    const type = form.target === "subscribers" ? "subscribers" : "users";
    if (form.target === "all_users") {
      setRecipientOptions([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await searchMarketingRecipients(type, form.recipientQuery);
        setRecipientOptions(res?.items || []);
      } catch (err) {
        setRecipientOptions([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [form.recipientQuery, form.target]);

  const recipientDatalistId = useMemo(
    () => (form.target === "subscribers" ? "subscriber-options" : "user-options"),
    [form.target]
  );

  const addRecipientFromQuery = () => {
    if (!form.recipientQuery) return;
    const match = recipientOptions.find(
      (opt) => opt.email?.toLowerCase() === form.recipientQuery.toLowerCase()
    );
    if (!match) return;
    setForm((prev) => {
      const exists = prev.selectedRecipients.some(
        (r) => r.type === match.type && r.email === match.email
      );
      if (exists) return { ...prev, recipientQuery: "" };
      return {
        ...prev,
        selectedRecipients: [...prev.selectedRecipients, match],
        recipientQuery: "",
      };
    });
  };

  const removeRecipient = (email) => {
    setForm((prev) => ({
      ...prev,
      selectedRecipients: prev.selectedRecipients.filter((r) => r.email !== email),
    }));
  };

  const onSelectTemplate = (templateId) => {
    const tpl = templates.find((t) => String(t.id) === String(templateId));
    setForm((prev) => ({
      ...prev,
      templateId,
      content: tpl?.content || prev.content,
      subject: prev.subject || tpl?.name || prev.subject,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Email Marketing</h1>
        <p className="text-sm text-gray-500">
          Envoyer une campagne email vers des utilisateurs ou des abonnés.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => onChange("subject", e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Titre de la campagne"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cible
            </label>
            <select
              value={form.target}
              onChange={(e) => onChange("target", e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="subscribers">Subscribers</option>
              <option value="users">Users spécifiques (IDs)</option>
              <option value="all_users">All Users</option>
            </select>
          </div>

          {form.target !== "all_users" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche par email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list={recipientDatalistId}
                  value={form.recipientQuery}
                  onChange={(e) => onChange("recipientQuery", e.target.value)}
                  onBlur={addRecipientFromQuery}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="taper un email..."
                />
                <button
                  type="button"
                  onClick={addRecipientFromQuery}
                  className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm"
                >
                  Ajouter
                </button>
              </div>
              <datalist id={recipientDatalistId}>
                {recipientOptions.map((opt) => (
                  <option key={`${opt.type}-${opt.email}`} value={opt.email} />
                ))}
              </datalist>
              {form.selectedRecipients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.selectedRecipients
                    .filter((r) =>
                      form.target === "subscribers" ? r.type === "subscriber" : r.type === "user"
                    )
                    .map((r) => (
                      <button
                        key={`${r.type}-${r.email}`}
                        type="button"
                        onClick={() => removeRecipient(r.email)}
                        className="text-xs bg-gray-100 border rounded-full px-3 py-1 hover:bg-gray-200"
                      >
                        {r.email} x
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {form.target === "users" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User IDs (optionnel, séparés par des virgules)
              </label>
              <input
                type="text"
                value={form.userIds}
                onChange={(e) => onChange("userIds", e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="ex: 12, 15, 33"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template email
            </label>
            <select
              value={form.templateId}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">{templateLoading ? "Chargement..." : "Aucun template"}</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu (HTML autorisé)
            </label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => onChange("content", e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="<h1>Bonjour !</h1><p>Offre spéciale...</p>"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded px-5 py-2 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
      {success && (
        <NotifySuccess message={success} sucess={true} onClose={() => setSuccess(null)} />
      )}
    </div>
  );
}
