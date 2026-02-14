import { useEffect, useMemo, useState } from 'react';
import { Eye, FileText, Pencil, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteTemplate, getTemplates } from '../../../services/ServicesAdmin/TemplateService';
import Pagination from '../../../components/ui/pagination';
import Loading from '../../../components/ui/loading';
import CardConfirmation from '../../../components/ui/CardConfirmation';
import NotifyError from '../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../components/ui/NotifySucces';

const AllTemplate = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getTemplates(typeFilter || null, () => {}, currentPage, perPage);
        const items = Array.isArray(res?.data) ? res.data : [];

        if (!isMounted) return;
        setTemplates(items);
        setCurrentPage(Number(res?.current_page || currentPage));
        setPerPage(Number(res?.per_page || perPage));
        setTotalPages(Number(res?.last_page || 1));
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Erreur de chargement des templates.');
        setTemplates([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [typeFilter, currentPage, perPage]);

  const typeOptions = useMemo(() => {
    const values = new Set((templates || []).map((t) => t?.type).filter(Boolean));
    return Array.from(values).sort();
  }, [templates]);

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate(selectedTemplate.id);
      setOpenDeleteModal(false);
      setTemplates((prev) => prev.filter((item) => item.id !== selectedTemplate.id));
      setSuccess('Template supprime avec succes.');
      setSelectedTemplate(null);
    } catch (err) {
      setOpenDeleteModal(false);
      setError(err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mes Templates</h1>

      <div className="mb-4 flex flex-wrap justify-end gap-3">
        <button
          onClick={() => navigate('/admin/setting-create-templates')}
          className="rounded bg-blue-600 p-2 text-sm font-semibold text-white hover:bg-blue-700"
          type="button"
        >
          Add Template
        </button>

        <select
          className="rounded border border-gray-300 p-2 text-sm font-semibold"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Types</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
                <p className="mb-2 line-clamp-2 text-sm text-gray-600">{template.content}</p>
                {Array.isArray(template.variables) && template.variables.length > 0 && (
                  <p className="text-xs text-gray-500">Variables: {template.variables.join(', ')}</p>
                )}
                <span className="mt-2 inline-block w-fit rounded-full bg-slate-300 px-2 py-1 text-sm">
                  {template.type}
                </span>
              </div>

              <div className="ml-2 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/templates-update/${template.id}`)}
                  className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-sm text-white hover:bg-indigo-600"
                  type="button"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/admin/detaill-template/${template.id}`)}
                  className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                  type="button"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => navigate(`/admin/email-marketing?template_id=${template.id}`)}
                  className="flex items-center gap-1 rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600"
                  type="button"
                >
                  <Send className="h-3 w-3" />
                  Mail
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setOpenDeleteModal(true);
                  }}
                  className="flex items-center gap-1 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  title="Supprimer"
                  type="button"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !error && (
        <div className="py-12 text-center text-gray-500">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>Aucun template disponible</p>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, totalPages)}
        setCurrentPage={setCurrentPage}
        perPage={perPage}
        setPerPage={(value) => setPerPage(Number(value))}
      />

      {openDeleteModal && selectedTemplate && (
        <CardConfirmation
          title="Delete This Template Permanently"
          message="Are you sure you want to delete this template? This action cannot be undone."
          confirmed={handleDelete}
          isVisible={setOpenDeleteModal}
          nameButton="Delete Template"
        />
      )}

      <NotifyError message={error} onClose={() => setError('')} isVisible={!!error} />
      {success && <NotifySuccess sucess={true} message={success} onClose={() => setSuccess('')} />}
    </div>
  );
};

export default AllTemplate;
