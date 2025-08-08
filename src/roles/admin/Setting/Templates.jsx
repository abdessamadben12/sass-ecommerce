import React, { useState } from 'react';
import { creerTemplate } from '../../../services/ServicesAdmin/TemplateService';
import NotifyError from '../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../components/ui/NotifySucces';

const TemplateCreator = () => {
const [error,setError]=useState(null)
const [sucess,setSucess]=useState(null)
const [template, setTemplate] = useState({
    name: '',
    type: '',
    subtype: '',
    output_format: 'html',
    description: '',
    content: '',
    css_content: '',
    variables: [],
    tags: [],


    target_audience: 'customer',
    language: 'fr',
    is_default: false,
    is_public: false
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'string',
    required: false,
    description: ''
  });

  const templateTypes = [
    { value: 'invoice', label: 'Facture', category: 'Documents' },
    { value: 'quote', label: 'Devis', category: 'Documents' },
    { value: 'receipt', label: 'Reçu', category: 'Documents' },
    { value: 'email_welcome', label: 'Email Bienvenue', category: 'Emails' },
    { value: 'email_notification', label: 'Email Notification', category: 'Emails' },
    { value: 'web_header', label: 'En-tête Web', category: 'Web' },
    { value: 'web_footer', label: 'Pied de page', category: 'Web' },
    { value: 'pdf_report', label: 'Rapport PDF', category: 'Export' }
  ];

  const outputFormats = [
    { value: 'html', label: 'HTML' },
    { value: 'pdf', label: 'PDF' },
    { value: 'text', label: 'Texte' },
    { value: 'json', label: 'JSON' }
  ];

  const variableTypes = [
    { value: 'string', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Booléen' },
    { value: 'email', label: 'Email' }
  ];

  const templateExamples = {
    invoice: '<div class="invoice">\n  <h1>FACTURE N° {{invoice.number}}</h1>\n  <p>Client: {{client.name}}</p>\n  <p>Total: {{invoice.total}}€</p>\n</div>',
    email_welcome: '<div class="email">\n  <h1>Bienvenue {{user.name}} !</h1>\n  <p>{{email.message}}</p>\n</div>',
    web_footer: '<footer class="footer">\n  <p>{{company.name}} - {{current_year}}</p>\n</footer>'
  };

  const updateTemplate = (field, value) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const addVariable = () => {
    if (newVariable.name) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable, id: Date.now() }]
      }));
      setNewVariable({ name: '', type: 'string', required: false, description: '' });
    }
  };

  const removeVariable = (id) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.id !== id)
    }));
  };

  const loadTemplateExample = () => {
    if (template.type && templateExamples[template.type]) {
      updateTemplate('content', templateExamples[template.type]);
    }
  };

  const addTag = (tag) => {
    if (tag && !template.tags.includes(tag)) {
      updateTemplate('tags', [...template.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    updateTemplate('tags', template.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    const res=await creerTemplate(template)
    console.log(res)
    
  }

  const tabs = [
    { id: 'basic', name: 'Informations', icon: '📝' },
    { id: 'content', name: 'Contenu', icon: '🎨' },
    { id: 'variables', name: 'Variables', icon: '🔧' },
    { id: 'settings', name: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎨 Créer un Template</h1>
          <p className="text-gray-600">Créez et configurez un nouveau template pour votre système</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du Template*
                      </label>
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => updateTemplate('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Facture Standard"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de Template*
                      </label>
                      <select
                        value={template.type}
                        onChange={(e) => updateTemplate('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Sélectionner un type</option>
                        {Object.entries(
                          templateTypes.reduce((acc, type) => {
                            if (!acc[type.category]) acc[type.category] = [];
                            acc[type.category].push(type);
                            return acc;
                          }, {})
                        ).map(([category, types]) => (
                          <optgroup key={category} label={category}>
                            {types.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format de Sortie
                      </label>
                      <select
                        value={template.output_format}
                        onChange={(e) => updateTemplate('output_format', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {outputFormats.map(format => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audience Cible
                      </label>
                      <select
                        value={template.target_audience}
                        onChange={(e) => updateTemplate('target_audience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="customer">Client</option>
                        <option value="vendor">Vendeur</option>
                        <option value="admin">Admin</option>
                        <option value="all">Tous</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={template.description}
                      onChange={(e) => updateTemplate('description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Décrivez l'utilisation de ce template..."
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={template.is_default}
                        onChange={(e) => updateTemplate('is_default', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Template par défaut</span>
                    </label>

                    {/* <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={template.is_public}
                        onChange={(e) => updateTemplate('is_public', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public</span>
                    </label> */}
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Contenu du Template</h3>
                    {template.type && templateExamples[template.type] && (
                      <button
                        type="button"
                        onClick={loadTemplateExample}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        📋 Charger un exemple
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code HTML/Template*
                    </label>
                    <textarea
                      value={template.content}
                      onChange={(e) => updateTemplate('content', e.target.value)}
                      rows="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="<div>Votre template ici...</div>"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS Personnalisé
                    </label>
                    <textarea
                      value={template.css_content}
                      onChange={(e) => updateTemplate('css_content', e.target.value)}
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder=".invoice { font-family: Arial; }"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {template.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tapez un tag et appuyez sur Entrée"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'variables' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Variables du Template</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-700 mb-3">Ajouter une Variable</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={newVariable.name}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom (ex: user.name)"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={newVariable.type}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {variableTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newVariable.description}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newVariable.required}
                            onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-sm">Requis</span>
                        </label>
                        <button
                          type="button"
                          onClick={addVariable}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          + Ajouter
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {template.variables.map(variable => (
                      <div key={variable.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {`{{${variable.name}}}`}
                            </code>
                            <span className="text-sm text-gray-600">{variable.type}</span>
                            {variable.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                Requis
                              </span>
                            )}
                          </div>
                          {variable.description && (
                            <p className="text-sm text-gray-500 mt-1">{variable.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariable(variable.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    
                    {template.variables.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Aucune variable définie</p>
                        <p className="text-sm">Les variables permettent de personnaliser le template</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Paramètres Avancés</h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Conseils d'Utilisation</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Utilisez {`{{variable}}`} pour insérer des données dynamiques</li>
                      <li>• {`{% for item in items %} ... {% endfor %}`} pour les boucles</li>
                      <li>• {`{% if condition %} ... {% endif %}`} pour les conditions</li>
                      <li>• {`{{value | filter}}`} pour appliquer des filtres</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                * Champs obligatoires
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                   Add Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
     <NotifyError message={error} onClose={()=>setError(false)} isVisible={error == null ? false : true}  />
      {sucess?.etats && <NotifySuccess message={sucess?.message} sucess={sucess.etats} onClose={()=>setSucess(false)}/>}
    </div>
  );
};

export default TemplateCreator;