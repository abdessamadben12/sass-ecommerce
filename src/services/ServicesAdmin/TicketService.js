import { axiosConfig } from "../ConfigueAxios";

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Request failed";

export const getAllTickets = async (name,sortBy,status,currentPage, nbrTicketPerPage, setError) => {
    try {
        const res = await axiosConfig.get(`/admin/tickets?page=${currentPage}&per_page=${nbrTicketPerPage}&status=${status}&search=${name}&sort_by=${sortBy}`)
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}

export const getTicketById = async (id, setError) => {
    try {
        const res = await axiosConfig.get(`/admin/ticket-detaill/${id}`)
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}


export const deleteTicket = async (id, setError,setSucess) => {
    try {
        const res = await axiosConfig.delete(`/admin/delete-ticket/${id}`)
        setSucess({etats:true,message:res.data.message})
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}
export const   UpdateTicket=async(data,id,setError,setSucess)=>{
    try {
        const res = await axiosConfig.put(`/admin/update-ticket/${id}`,data,{
            headers:{
                'Content-Type':'application/json'
            }
        })
        setSucess({etats:true,message:res.data.message})
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}       


export const replayTicketMessage =async(data,setError,setSucess)=>{
    try {
        const res = await axiosConfig.post("/admin/create-reply-ticket",data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        setSucess({etats:true,message:res.data.message || "Message sent"})
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}
export const deleteMessage = async (id, setError, setSucess) => {
    try {
        const res = await axiosConfig.delete(`/admin/delete-reply-ticket/${id}`)
        setSucess({etats:true,message:res.data.message})
        return res.data
    } catch (err) {
        setError(getErrorMessage(err))
        throw err
    }
}
