import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  User,
  MessageCircle,
  Paperclip,
  Download,
  Eye,
  Send,
  CheckCircle,
  Image,
  FileText,
  Delete,
  LifeBuoy,
  FileWarning,
  Sparkles,
  Trash,
  MailOpen,
  Mail,
} from 'lucide-react';
import ReplyTicket from './ReplyTicket';
import { deleteMessage, deleteTicket, getTicketById, UpdateTicket } from '../../../services/ServicesAdmin/TicketService';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosConfig } from '../../../services/ConfigueAxios';
import Loading from '../../../components/ui/loading';
import CardConfirmation from '../../../components/ui/CardConfirmation';
import NotifyError from '../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../components/ui/NotifySucces';
const TicketDetail = () => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTickets] = useState({})
  const [loading, setLoading] = useState(false);
  const [expanded,setExpanded]=useState({status:false,id:null})
  const [showSupprimer,setSupprimer]=useState(false)
  const [sucess,setSucess]=useState({etats:false,message:null})
  const [updating,setUpdating]=useState(false)
  const [isAjouter,setAjouter]=useState(false)
  const [deleted,setDeleted]=useState(false)
  const [statusValue, setStatusValue] = useState('new')
  const [priorityValue, setPriorityValue] = useState('medium')
  const {id}=useParams()
  const navigate = useNavigate();

 useEffect(() => {
    const fetchTicket = async () => {
        setLoading(true);
        const data =await getTicketById(id,setError)
        setTickets(data)
        if (data?.status) setStatusValue(data.status)
        if (data?.priority) setPriorityValue(data.priority)
        setLoading(false);
    }
        fetchTicket()
}, [id,isAjouter,deleted])
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-orange-100 text-orange-800 border-orange-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'closed': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
     const icons = {
      'support': <LifeBuoy className="w-5 h-5 text-blue-500" />,
      'feature_request': <Sparkles className="w-5 h-5 text-yellow-500" />,
      'report': <FileWarning className="w-5 h-5 text-red-500" />
    };
    if(type) return icons[type] || <FileText className="w-5 h-5 text-gray-500" />;
    else return <FileText className="w-5 h-5 text-gray-500" />
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };
  const getAttachmentUrl = (attachment) => {
    return attachment?.url || attachment?.path || '';
  };
  const apiBase = axiosConfig?.defaults?.baseURL?.replace(/\/api$/, '') || 'http://localhost:8000';
  const handleDelete=async()=>{
    try {
      await deleteTicket(id,setError,setSucess)
      setSupprimer(false)
      setTimeout(()=>{
        navigate('/admin/all-tickets')
      },2000)
    } catch (_) {
      // error already handled in service
    }
  }
  const handleUpate=async(e)=>{
    e.preventDefault()
    const dataForm={
      status: statusValue,
      priority: priorityValue
    }
    setUpdating(true);
    try {
      await UpdateTicket(dataForm,id,setError,setSucess)
      const data = await getTicketById(id,setError)
      setTickets(data)
    } catch (_) {
      // error already handled in service
    } finally {
      setUpdating(false);
    }
    
  }
  const deleteReply = async (id) => {
    try {
      await deleteMessage(id,setError,setSucess)
      setDeleted(!deleted)
    } catch (_) {
      // error already handled in service
    }
    
  }
  return (  loading ? (<Loading/>) :    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(ticket.type)}</span>
                  <h1 className="text-xl font-semibold text-gray-900">{ticket.title}</h1>
                </div>
                <p className="text-sm text-gray-500">#{ticket?.ticket_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                    <CheckCircle className="w-4 h-4" />
                    {ticket?.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket?.priority ? ticket.priority.toUpperCase() : 'N/A'} PRIORITY
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReplyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Reply
                  </button>
                  {/* button de suppression */}
                  <button
                    onClick={() => setSupprimer(true)}
                    className="flex  items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"

                  >
                    <Delete size={25} />
                  
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </div>
              {/* Attachments */}
              {ticket.attachments?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Attachments ({ticket.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {ticket?.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button  
                          onClick={()=>navigate(`/file-view?url=${encodeURIComponent(getAttachmentUrl(attachment))}&type=${encodeURIComponent(attachment.type)}`)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        <a
                        href={`${apiBase}/api/download-file?url=${encodeURIComponent(attachment.path)}&name=${encodeURIComponent(attachment.name)}`}
                        className="p-1 text-gray-400 hover:text-green-600 rounded">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversation ({ticket.message_replay?.length})
                </h3>
              </div> 
              <div className="p-6 space-y-6 ">
               
                {ticket.message_replay?.map((reply) => (
                  <div
                    key={reply?.id}
                    className={`border-l-4 pl-4 bg-white  border-blue-100  rounded-r-lg p-4 text-wrap shadow`}>
                    <div className="flex items-center  ">
                <button
                  onClick={() => deleteReply(reply?.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                  title="Supprimer"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <span
                  className={`p-2 rounded-full cursor-text transition-colors duration-200 ${
                    reply?.is_read 
                      ? 'text-gray-400' 
                      : 'text-blue-600 '
                  }`}
                >
                  {reply?.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </span>
              </div>
                    <h1 className='font-medium text-gray-900 mb-2'>message:</h1>

                    
                   <div className=" flex flex-col items-start justify-between mb-4 bg-slate-100 p-4 rounded-md">
                    {/* message */}
                   <div className={`break-words whitespace-pre-wrap w-full `}>
                    <p className={`text-md text-gray-800 break-words ${expanded.status && expanded.id===reply.id ? 'line-clamp-none' : 'line-clamp-2'} whitespace-pre-wrap transition-all duration-300`}>          
      {reply?.message}
    </p>
      <span
        onClick={() => setExpanded({status:!expanded.status,id:reply?.id})}
        className="cursor-pointer flex justify-strat mt-2 text-blue-400 text-sm "
      >
        {expanded.status && expanded.id===reply?.id ? 'Réduire' : 'Lire plus'}
      </span>
  </div>
</div>
  {/* attachment  */}
  <h1 className='font-medium text-gray-900 mt-2 '> Attachments{" ("+reply.attachments?.length+")"}</h1>

  { reply?.attachments?.length > 0 && reply?.attachments?.map((attachment,key)=>{
    return <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-blue-300 transition-colors">
                              {getFileIcon(attachment.type)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{attachment.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors">
                              <Eye className="w-4 h-4" onClick={()=>navigate(`/file-view?url=${encodeURIComponent(getAttachmentUrl(attachment))}&type=${encodeURIComponent(attachment.type)}`)}/>
                            </button>
                            <a
                              href={`${apiBase}/api/download-file?url=${encodeURIComponent(attachment.path)}&name=${encodeURIComponent(attachment.name)}`}
                             className="p-2 text-slate-400 hover:text-green-600 rounded-lg hover:bg-white transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
  })}
    
              {/* ca finikk */}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
           <form>
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={priorityValue} onChange={(e) => setPriorityValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                      {(ticket?.assigned_user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{ticket?.assigned_user?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                <button 
                type='submit'
                onClick={(e)=>handleUpate(e)}
                className="flex items-center  gap-2 px-3 py-2 bg-blue-600 mt-2 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >{updating ? "Updateing..." : "Aplly"}</button>
              </div>
            </div>
           </form>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-800">
                  {(ticket?.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ticket.user?.name}</p>
                  <p className="text-sm text-gray-500">{ticket.user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">role:</span>
                  <span className="font-medium text-purple-600">{ticket.user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="text-gray-900">{formatDate(ticket.user?.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">status:</span>
                  <span
  className={`text-gray-900 px-2 py-0 rounded-full ${
    ticket?.user?.status === "active"
      ? "bg-green-200"
      : ticket.user?.status === "pending"
      ? "bg-yellow-200"
      : "bg-red-200"
  }`}
>
  {ticket.user?.status}
</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                onClick={()=>navigate(`/admin/detaill-user/${ticket.user?.id}`)}
                 className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  View Customer Profile
                </button>
              </div>
            </div>     
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 overflow-auto bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <ReplyTicket handleFerme={() => setShowReplyModal(false)} ticket={ticket} isAjouter={()=>setAjouter(!isAjouter) }/>
        </div>
      )}
      {showSupprimer && (<CardConfirmation title={"Delete Ticket"} message={"Are you sure you want to delete this ticket? This action cannot be undone ."} isVisible={()=>setSupprimer(false)} nameButton={"Delete Ticket"} confirmed={()=>handleDelete(id)}/> )}
        {sucess.etats && <NotifySuccess sucess={sucess.etats} message={sucess.message} onClose={() => setSucess(false)} />}    
        <NotifyError message={error} onClose={()=>setError(false)} isVisible={error == null ? false : true}  />
    </div>
  );
};

export default TicketDetail;
