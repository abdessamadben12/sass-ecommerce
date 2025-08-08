import React, { use, useEffect, useState } from 'react';
import { Send, Paperclip, X, Image, FileText, Shield } from 'lucide-react';
import { getTicketById, replayTicketMessage } from '../../../services/ServicesAdmin/TicketService';
import { useParams } from 'react-router-dom';
import NotifyError from '../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../components/ui/NotifySucces';
import Loading from '../../../components/ui/loading';

const ReplyTicket = ({handleFerme,ticket,isAjouter}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {id}=useParams();
  const [sucess, setSucess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type.startsWith('image/') ? 'image' : 'document',
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };
  useEffect(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 400)
  },[])
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };
  const handleSubmit =async () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('message', message);
    formData.append('ticket_id',id);
    formData.append("user_id",ticket.user.id)
    attachments.forEach(attachment => {
      formData.append('attachments[]', attachment.file);
    });
    await replayTicketMessage(formData,setError,setSucess)
      setMessage('');
      setAttachments([]);
      setIsSubmitting(false);
      handleFerme();
      isAjouter()
  };
  const getFileIcon = (type) => {
    return type === 'image' ? 
      <Image className="w-4 h-4 text-blue-600" /> : 
      <FileText className="w-4 h-4 text-gray-600" />;
  };
  return (
  isLoading ? <Loading/> :   <div className=' bg-white min-w-[50%] mx-auto   border border-gray-200 rounded-lg'>
    <div className='flex justify-end p-2' onClick={handleFerme}><X size={25} className='text-gray-500 cursor-pointer' /></div>
   <div className=" p-6  ">
      {/* Header */}
      <div className="mb-6">
       <div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Reply</h2>
        <p className="text-sm text-gray-500">Respond to this ticket</p>
      </div>
      {/* Message Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply here..."
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        />
        <p className="text-xs text-gray-500 mt-1">
          {message.length} characters
        </p>
      </div>
      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Paperclip className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Choose Files</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
            />
          </label>
          <span className="text-xs text-gray-500">
            Max 10MB per file
          </span>
        </div>
      </div>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Attached Files ({attachments.length})
          </p>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(attachment.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {attachment.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Reply
            </>
          )}
        </button>
      </div>

     <NotifyError message={error} onClose={()=>setError(false)} isVisible={error == null ? false : true}  />
      
{sucess.etats && <NotifySuccess sucess={sucess.etats} message={sucess.message} onClose={() => setSucess(false)} />}    </div></div> 

  );
};

export default ReplyTicket;