import { AxiosHeaders } from "axios";
import { axiosConfig } from "../ConfigueAxios";

export const getAllTickets = async (name,sortBy,status,currentPage, nbrTicketPerPage, setError) => {
    return await axiosConfig.get(`/admin/tickets?page=${currentPage}&per_page=${nbrTicketPerPage}&status=${status}&name=${name}&sort_by=${sortBy}`)
        .then(res => res.data)
        .catch(err => setError(err.message));
}

export const getTicketById = async (id, setError) => {
    return await axiosConfig.get(`/admin/ticket-detaill/${id}`)
        .then(res => res.data)
        .catch(err => setError(err.message));
}


export const deleteTicket = async (id, setError,setSucess) => {
    return await axiosConfig.delete(`/admin/delete-ticket/${id}`)
        .then(res => setSucess({etats:true,message:res.data.message}))
        .catch(err => setError(err.message));
}
export const   UpdateTicket=async(data,id,setError,setSucess)=>{
    return await axiosConfig.put(`/admin/update-ticket/${id}`,data,{
        headers:{
            'Content-Type':'application/json'
        }
    }).then(res=>setSucess({etats:true,message:res.data.message})).catch(err=>setError(err.message))
}       


export const replayTicketMessage =async(data,setError,setSucess)=>{
    return await axiosConfig.post("/admin/create-reply-ticket",data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res=>setSucess({etats:true,message:"Message Sended"})).catch(err=>setError(err.message));

}
  export const deleteMessage=async(id,setError,setSucess)=>await axiosConfig.delete(`/admin/delete-reply-ticket/${id}`).then(res=>setSucess({etats:true,message:res.data.message}))
  .catch(err=>setError(err.message))