import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMarketingEmailTemplates,
  sendMarketingEmail,
  searchMarketingRecipients,
} from "../../../services/ServicesAdmin/MarketingService";
import NotifyError from "../../../components/ui/NotifyError";
import { NotifySuccess } from "../../../components/ui/NotifySucces";

export default function EmailMarketing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    subject: "",
    content: "",
    target: "subscribers",
    userIds: "",
    recipientQuery: "",
    selectedRecipients: [],
    templateId: "",
    adminIds: "",
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

      if (form.templateId) {
        payload.template_id = Number(form.templateId);
      }

      if (form.target === "users") {
        const idsFromInput = parseUserIds(form.userIds);
        const idsFromSelected = form.selectedRecipients.filter((r) => r.type === "user").map((r) => r.id);
        payload.user_ids = Array.from(new Set([...idsFromInput, ...idsFromSelected]));
      }

      if (form.target === "admins") {
        const idsFromInput = parseUserIds(form.adminIds);
        const idsFromSelected = form.selectedRecipients.filter((r) => r.type === "admin").map((r) => r.id);
        const adminIds = Array.from(new Set([...idsFromInput, ...idsFromSelected]));
        if (adminIds.length > 0) {
          payload.admin_ids = adminIds;
        }
      }

      if (form.target === "subscribers") {
        const emails = form.selectedRecipients.filter((r) => r.type === "subscriber").map((r) => r.email);
        if (emails.length > 0) {
          payload.subscriber_emails = emails;
        }
      }

      const res = await sendMarketingEmail(payload);
      setSuccess(res?.message || "Email sent.");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to send email.";
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
        const res = await getMarketingEmailTemplates();
        const items = res?.data || [];
        const emailTemplates = items.filter((t) => {
          const type = String(t?.type || "").toLowerCase();
          return type.startsWith("email_") || type === "email" || type.includes("email");
        });
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
    const templateIdFromUrl = searchParams.get("template_id");
    if (!templateIdFromUrl || templates.length === 0) return;
    onSelectTemplate(templateIdFromUrl);
  }, [searchParams, templates]);

  useEffect(() => {
    const type = form.target === "subscribers" ? "subscribers" : form.target === "admins" ? "admins" : "users";
    if (form.target === "all_users") {
      setRecipientOptions([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        const res = await searchMarketingRecipients(type, form.recipientQuery);
        setRecipientOptions(res?.items || []);
      } catch {
        setRecipientOptions([]);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [form.recipientQuery, form.target]);

  const recipientDatalistId = useMemo(
    () =>
      form.target === "subscribers"
        ? "subscriber-options"
        : form.target === "admins"
          ? "admin-options"
          : "user-options",
    [form.target]
  );

  const addRecipientFromQuery = () => {
    if (!form.recipientQuery) return;
    const match = recipientOptions.find((opt) => opt.email?.toLowerCase() === form.recipientQuery.toLowerCase());
    if (!match) return;

    setForm((prev) => {
      const exists = prev.selectedRecipients.some((r) => r.type === match.type && r.email === match.email);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Email Marketing</h1>
        <p className="text-sm text-gray-500">Send an email campaign to users or subscribers.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => onChange("subject", e.target.value)}
              required={!form.templateId}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Campaign title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Target</label>
            <select
              value={form.target}
              onChange={(e) => onChange("target", e.target.value)}
              className="w-full rounded border bg-white px-3 py-2"
            >
              <option value="subscribers">Subscribers</option>
              <option value="users">Specific users (IDs)</option>
              <option value="admins">Specific admins (IDs)</option>
              <option value="all_users">All Users</option>
            </select>
          </div>

          {form.target !== "all_users" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search by email</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list={recipientDatalistId}
                  value={form.recipientQuery}
                  onChange={(e) => onChange("recipientQuery", e.target.value)}
                  onBlur={addRecipientFromQuery}
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="type an email..."
                />
                <button
                  type="button"
                  onClick={addRecipientFromQuery}
                  className="rounded border bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                >Add</button>
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
                      form.target === "subscribers"
                        ? r.type === "subscriber"
                        : form.target === "admins"
                          ? r.type === "admin"
                          : r.type === "user"
                    )
                    .map((r) => (
                      <button
                        key={`${r.type}-${r.email}`}
                        type="button"
                        onClick={() => removeRecipient(r.email)}
                        className="rounded-full border bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">User IDs (optional, comma-separated)</label>
              <input
                type="text"
                value={form.userIds}
                onChange={(e) => onChange("userIds", e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="ex: 12, 15, 33"
              />
            </div>
          )}

          {form.target === "admins" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Admin IDs (optional, comma-separated)</label>
              <input
                type="text"
                value={form.adminIds}
                onChange={(e) => onChange("adminIds", e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="ex: 1, 2"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email template</label>
            <div className="flex gap-2">
              <select
                value={form.templateId}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="w-full rounded border bg-white px-3 py-2"
              >
                <option value="">{templateLoading ? "Loading..." : "No template"}</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.type})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => navigate("/admin/all-templates")}
                className="rounded border bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
              >Manage</button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content (HTML allowed)</label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => onChange("content", e.target.value)}
              required={!form.templateId}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="<h1>Hello!</h1><p>Special offer...</p>"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-gray-900 px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
      {success && <NotifySuccess message={success} sucess={true} onClose={() => setSuccess(null)} />}
    </div>
  );
}


