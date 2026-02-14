import React, { useState, useEffect } from 'react';
import {  
  Variable, 
  Tag, 
  Plus, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateDetaill, updateTemplate } from '../../../services/ServicesAdmin/TemplateService';
import Loading from '../../../components/ui/loading';

const TemplateUpdateForm = () => {
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    content: '',
    type: 'email_campaign',
    category: '',
    tags: [],
    version: '1.0',
    isPublic: false,
    variables: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [error,setError]=useState(null)
  const [success,setSuccess]=useState(false)
  const { id } = useParams();
  const navigate = useNavigate();

  // Types de templates disponibles
  const templateTypes = [
    { value: 'email_welcome', label: 'Email bienvenue' },
    { value: 'email_notification', label: 'Email notification' },
    { value: 'email_campaign', label: 'Email campaign' },
    { value: 'email_admin', label: 'Email admin' },
    { value: 'email_reset_password', label: 'Email reset password' },
    { value: 'email_order_confirmation', label: 'Email confirmation commande' },
    { value: 'invoice', label: 'Facture' },
    { value: 'quote', label: 'Devis' },
    { value: 'receipt', label: 'Recu' },
    { value: 'pdf_report', label: 'Rapport PDF' },
    { value: 'web_header', label: 'Web header' },
    { value: 'web_footer', label: 'Web footer' },
  ];
  // Charger le template existant
  useEffect(() => {
    const loadTemplate = async () => {
        if (!id) return;
        setLoading(true);
        const res=await getTemplateDetaill(id,setErrors,setSuccess)
        setTemplate(res);
        setLoading(false)
    }
    loadTemplate();
  }, [id]);
  // Extraire automatiquement les variables du contenu
  const extractVariables = (content) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }
    
    return variables;
  };

  // Gérer les changements dans le contenu
  const handleContentChange = (value) => {
    const extractedVariables = extractVariables(value);
    setTemplate({
      ...template,
      content: value,
      variables: extractedVariables
    });
  };

  // Ajouter un tag
  const addTag = () => {
    template?.tags ==null && setTemplate({...template,tags:[...newTag.trim()]})
    if (newTag?.trim()) {
      setTemplate({
        ...template,
        tags: [...template?.tags, newTag?.trim()]
      });
      setNewTag('');

    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove) => {
    setTemplate({
      ...template,
      tags: template?.tags.filter(tag => tag !== tagToRemove)
    });
  };
  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!template?.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!template?.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarder le template
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    setSaving(true);
      await updateTemplate(template,id,setErrors,setSuccess)
      setSaving(false);
      setTimeout(()=>{
       return setSuccess(null)
      },4000)
  };

  // Aperçu du template rendu
  const renderPreview = () => {
    let rendered = template?.content;
    template?.variables?.forEach(variable => {
      rendered = rendered.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `[${variable}]`);
    });
    return rendered;
  };

  if (loading) {
    return (
      <Loading/>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6 overflow-auto  h-full ">
      {/* Messages d'état */}
      {success && (
        <div className="mb-6 p-4  bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Template mis à jour avec succès !</span>
        </div>
      )}
      {errors?.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{errors.submit}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du template *
              </label>
              <input
                type="text"
                value={template?.name}
                onChange={(e) => setTemplate({...template, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom du template"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={template?.type}
                onChange={(e) => setTemplate({...template, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={template?.description}
              onChange={(e) => setTemplate({...template, description: e.target.value})}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Description du template"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {template?.tags?.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
    </div>

        {/* Contenu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contenu du template</h2>
            {template?.variables.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Variable className="w-4 h-4" />
                {template?.variables.length} variable{template?.variables.length > 1 ? 's' : ''} détectée{template?.variables.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {!previewMode ? (
            <div>
              <textarea
                value={template?.content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={12}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contenu du template... Utilisez {{variable}} pour les variables dynamiques"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {renderPreview()}
              </pre>
            </div>
          )}

          {/* Variables détectées */}
          {template?.variables.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Variables détectées automatiquement :</h3>
              <div className="flex flex-wrap gap-2">
                {template?.variables.map((variable, index) => (
                  <code key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {`{{${variable}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Update
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateUpdateForm;
