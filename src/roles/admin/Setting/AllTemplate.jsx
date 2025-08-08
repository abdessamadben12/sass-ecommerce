import React, { useState, useEffect, use } from 'react';
import { Copy, Eye, FileText, Trash2, Share2, Download, X } from 'lucide-react';
import { getTemplates } from '../../../services/ServicesAdmin/TemplateService';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/ui/pagination';
import Loading from '../../../components/ui/loading';
import CardConfirmation from '../../../components/ui/CardConfirmation';
const AllTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateData, setTemplateData] = useState({});
  const [copied, setCopied] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);
  const [loading,setLoading]=useState(false)
  const [currentPage,setCurrentPage]=useState(1)
  const [per_page,setPerPage]=useState(10)
  const [total,setTotal]=useState(0)
  const [error,setError]=useState(null)
  const [sucess,setSuccess]=useState(null)
  const [modelConfim,setModelConfim]=useState(false)
  const navigate=useNavigate()
  const type=[
    {label:"Email",value:"mail"},
    {label:"Email",value:"mail"},
    {label:"Email",value:"mail"},
  ]
  // Charger les templates
  useEffect(() => {
    setLoading(true)
   const ftechData=async()=>{
    const res=await getTemplates()
    setCurrentPage(res.current_page)
   setTotal(res.last_page)
   setPerPage(res.per_page)
   setTemplates(res.data)
   setLoading(false)
   console.log(templates)

   }
   ftechData()
  }, [currentPage,per_page,typeFilter]);

  // Supprimer un template
  const deleteTemplate = (id) => {
   
    //   const updatedTemplates = templates.filter(t => t.id !== id);
    //   setTemplates(updatedTemplates);
    //   saveToStorage(updatedTemplates);
    //   setSelectedTemplate(null);
      alert(id)

    
  };

  // Remplacer les variables
  const renderTemplate = (template, data) => {
    let rendered = template.content;
    template.variables.forEach(variable => {
      const value = data[variable] || `{{${variable}}}`;
      rendered = rendered.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });
    return rendered;
  };

  // Copier le texte
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
   loading ? <Loading/>: <div className="max-w-4xl mx-auto p-6 relative">
      <h1 className="text-2xl font-bold mb-6">Mes Templates</h1>
      
      {/* Liste des templates */}
      <div className="space-y-4">
        <div className='flex justify-end gap-4 '>
            <button
            onClick={()=>navigate("/admin/setting-create-templates")}
             className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold'>Add Template</button>
            <select className='p-3 rounded font-semibold' onChange={(e)=>setTypeFilter(e.target.value)} name="" id="">
            <option value={null}>All Status</option>

                {type.map((item,key)=><option key={key} value={item.value}>{item.label}</option>)}

            </select>
        </div>
        {templates?.map(template => (
          <div key={template.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-2 'line-clamp-2">{template.content}</p>
                {template.variables.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Variables: {template.variables.join(', ')}
                  </p>
                )}
                <span className='text-sm font-sm mt-2 bg-slate-300 px-2 py-1 translate-y-2 block w-fit rounded-full'>{template.type}</span>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={()=>navigate("/admin/detaill-template/"+template.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button
                  onClick={() => setModelConfim(true)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center gap-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun template disponible</p>
        </div>
      )}

      {/* Modal d'utilisation */}

      <Pagination currentPage={currentPage} totalPages={total} setCurrentPage={currentPage} perPage={per_page} setPerPage={setPerPage}/>
      {modelConfim && <CardConfirmation title={"Delete This Template Permanently"} message={"Are you sure you want to delete this template? This action cannot be undone."}
         confirmed={()=>deleteTemplate(selectedTemplate.id)} isVisible={setModelConfim}
       nameButton={"Delete Template"}/>}
       
       {sucess?.etats && <NotifySuccess sucess={sucess.etats} message={sucess.message} onClose={() => setSuccess(false)} />}   
       

    </div> 
  );
};

export default AllTemplate;