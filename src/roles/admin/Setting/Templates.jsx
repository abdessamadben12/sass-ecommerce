import React, { useState } from 'react';
import { creerTemplate } from '../../../services/ServicesAdmin/TemplateService';
import NotifyError from '../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../components/ui/NotifySucces';

const TEMPLATE_TYPES = [
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'email_admin', label: 'Email Admin' },
  { value: 'email_welcome', label: 'Email Welcome' },
  { value: 'email_notification', label: 'Email Notification' },
  { value: 'email_reset_password', label: 'Email Reset Password' },
  { value: 'email_order_confirmation', label: 'Email Order Confirmation' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'quote', label: 'Quote' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'pdf_report', label: 'PDF Report' },
  { value: 'web_header', label: 'Web Header' },
  { value: 'web_footer', label: 'Web Footer' },
];

export default function TemplateCreator() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'email_campaign',
    subtype: '',
    output_format: 'html',
    description: '',
    content: '<h1>Hello {{name}}</h1>\n<p>Your email is {{email}}</p>',
    variablesInput: 'name,email',
    tagsInput: 'marketing',
    target_audience: 'all',
    is_default: false,
  });

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const variables = form.variablesInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const tags = form.tagsInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      type: form.type,
      subtype: form.subtype || null,
      output_format: form.output_format,
      description: form.description || null,
      content: form.content,
      variables,
      tags,
      target_audience: form.target_audience,
      is_default: form.is_default,
    };

    try {
      await creerTemplate(payload, setError, setSuccess);
      setSuccess({ etats: true, message: 'Template created successfully.' });
    } catch {
      // handled by service callbacks
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Create Template</h1>
          <p className="mt-1 text-sm text-gray-600">Single form to create an admin template quickly.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Template Name*</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Template Type*</label>
              <select
                value={form.type}
                onChange={(e) => onChange('type', e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subtype</label>
              <input
                type="text"
                value={form.subtype}
                onChange={(e) => onChange('subtype', e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="optional"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Output Format</label>
              <select
                value={form.output_format}
                onChange={(e) => onChange('output_format', e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="html">HTML</option>
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Audience</label>
              <select
                value={form.target_audience}
                onChange={(e) => onChange('target_audience', e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-7">
              <input
                id="is_default"
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => onChange('is_default', e.target.checked)}
              />
              <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                Set as default template
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
                rows={2}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Variables (comma separated)</label>
              <input
                type="text"
                value={form.variablesInput}
                onChange={(e) => onChange('variablesInput', e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="name,email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(e) => onChange('tagsInput', e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="marketing,admin"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Template Content*</label>
              <textarea
                value={form.content}
                onChange={(e) => onChange('content', e.target.value)}
                rows={12}
                className="w-full rounded border px-3 py-2 font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>

      <NotifyError message={error?.message || error} onClose={() => setError(null)} isVisible={!!error} />
      {success?.etats && (
        <NotifySuccess
          message={success.message}
          sucess={success.etats}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}
