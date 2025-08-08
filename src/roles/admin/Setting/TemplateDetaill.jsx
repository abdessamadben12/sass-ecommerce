import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Share2, 
  Variable, 
  Tag,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { getTemplateDetaill } from '../../../services/ServicesAdmin/TemplateService';
import { useNavigate, useParams } from 'react-router-dom';
import TemplateUpdateForm from './TemplateUpdate';

const TemplateDetaill = () => {
  const [template, setTemplate] = useState(null);
  const [templateData, setTemplateData] = useState({});
  const [renderedContent, setRenderedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [UpdateModel,setUpdateModel]=useState(false)
  const navigate=useNavigate();

  const { id } = useParams();

  // Charger le template
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getTemplateDetaill(id, setError);
        setTemplate(res);
        
        // Initialiser les données du template après chargement
        if (res && res.variables) {
          const initialData = {};
          res.variables.forEach(variable => {
            // Si c'est un objet avec une propriété name, utiliser variable.name
            const variableName = typeof variable === 'object' ? variable.name : variable;
            initialData[variableName] = '';
          });
          setTemplateData(initialData);
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement du template');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  // Remplacer les variables dans le template
  const renderTemplate = () => {
    if (!template || !template.content) return '';
    
    let rendered = template.content;
    
    if (template.variables && template.variables.length > 0) {
      template.variables.forEach(variable => {
        const variableName = typeof variable === 'object' ? variable.name : variable;
        const value = templateData[variableName] || `{{${variableName}}}`;
        rendered = rendered.replace(new RegExp(`\\{\\{${variableName}\\}\\}`, 'g'), value);
      });
    }
    
    setRenderedContent(rendered);
  };

  // Mettre à jour le rendu quand les données changent
  useEffect(() => {
    renderTemplate();
  }, [templateData, template]);

  // Copier le contenu
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6  relative">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">Erreur: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // État de chargement
  if (loading || !template) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Chargement du template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{template.name}</h1>
              <p className="text-gray-600">{template.description}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() =>navigate("/admin//templates-update/"+template.id)}

                className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Métadonnées */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{template.type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-medium">{template.version || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Variables</p>
              <p className="font-medium">{template.variables?.length || 0}</p>
            </div>
          </div>
          
          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {template.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
           <button
            onClick={() => setActiveTab('render')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'render' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Affichage
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'variables' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Variables ({template.variables?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Informations
          </button>
         
        </div>
        
        <div className="p-6">
          {/* Tab Aperçu */}
         
          
          {/* Tab Variables */}
          {activeTab === 'variables' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Variable className="w-5 h-5" />
                Variables du template
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Ce template contient {template.variables?.length || 0} variables qui peuvent être personnalisées :
                </p>
                {template.variables && template.variables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {template.variables.map((variable, index) => {
                      const variableName = typeof variable === 'object' ? variable.name : variable;
                      return (
                        <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
                          <code className="text-sm font-mono text-blue-600">{`{{${variableName}}}`}</code>
                          <p className="text-xs text-gray-500 mt-1">Variable à remplacer</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune variable trouvée dans ce template.</p>
                )}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Astuce : Les variables sont automatiquement détectées dans le contenu du template. 
                  Utilisez la syntaxe <code className="font-mono bg-blue-100 px-1">{`{{variable}}`}</code> pour créer une nouvelle variable.
                </p>
              </div>
            </div>
          )}

          {/* Tab Informations */}
          {activeTab === 'info' && (
            <div>
              <h3 className="font-semibold mb-4">Informations détaillées</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{template.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{template.version || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Créé le</p>
                    <p className="font-medium">{template.created_at ? new Date(template.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modifié le</p>
                    <p className="font-medium">{template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{template.description || 'Aucune description disponible'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Affichage comme interface */}
          {activeTab === 'render' && (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Affichage du template</h3>
                <p className="text-sm text-gray-600">
                  Visualisation du template comme une page HTML avec styles
                </p>
              </div>
              
              {/* Container pour l'iframe ou le rendu HTML */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
                  {/* Barre de navigateur simulée */}
                  <div className="bg-gray-200 px-4 py-2 flex items-center gap-3 border-b">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                      {template.name.toLowerCase().replace(/\s+/g, '-')}.html
                    </div>
                  </div>
                  
                  {/* Rendu HTML du template */}
                  <div className="p-8">
                    {/* Email Template */}
                    {template.type === 'email' && (
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                                <h1 style="color: #333; margin: 0;">${template.name}</h1>
                              </div>
                              <div style="background-color: white; padding: 30px; border: 1px solid #e9ecef;">
                                ${renderedContent.split('\n').map(line => 
                                  line.trim() ? `<p style="color: #333; line-height: 1.6; margin: 10px 0;">${line}</p>` : '<br/>'
                                ).join('')}
                              </div>
                              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
                                <p>© 2025 Entreprise. Tous droits réservés.</p>
                              </div>
                            </div>
                          `
                        }}
                      />
                    )}
                    {/* Default Template pour tous les autres types */}
                    {template.type !== 'email' && (
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: `
                            <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; background: white; padding: 40px;">
                              <h1 style="color: #1a202c; font-size: 32px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                                ${template.name}
                              </h1>
                              <div style="color: #2d3748; line-height: 1.8; font-size: 16px;">
                                ${renderedContent.split('\n').map(line => 
                                  line.trim() ? `<p style="margin: 16px 0;">${line}</p>` : '<br/>'
                                ).join('')}
                              </div>
                            </div>
                          `
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => copyToClipboard(renderedContent)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier le contenu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetaill;