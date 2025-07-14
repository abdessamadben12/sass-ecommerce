
import { axiosConfig } from "../ConfigueAxios";

export const getActiveUser = async (currentPage,nbrUserPerPage,role,name,setError) => await axiosConfig.
get(`/admin/users/user-active?page=${currentPage}&per_page=${nbrUserPerPage}&role=${role}&name=${name}`)
.then(res => res.data).catch(err => setError(err.message));

export const getBannedUser = async (currentPage,nbrUserPerPage,role,name,setError) => await axiosConfig.get(`/admin/users/user-banned?page=${currentPage}&per_page=${nbrUserPerPage}&role=${role}&name=${name}`).then(res => res.data)
.catch(err => setError(err.message));

export const getUnverifiedUsers = async (currentPage,nbrUserPerPage,role,name,setError) => await axiosConfig.get(`/admin/users/user-unverified?page=${currentPage}&per_page=${nbrUserPerPage}&role=${role}&name=${name}`).then(res => res.data)
.catch(err => setError(err.message));

export const getUserById = async (id,setError) => await axiosConfig.get(`/admin/users/${id}`).then(res => res.data)
.catch(err =>setError(err.message));

export const updateUser = async (data,id,setSucess,setError) => await axiosConfig.put(`/admin/users/${id}`,data).then(res =>setSucess({message:res.data.message,show:true}))
    .catch(err =>{
        const errors = err.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstMessage = errors[firstKey]?.[0] || err.message;
      setError(firstMessage);
    } else {
      setError(err.response?.data?.message || "An error occurred.");
    }
    });
export const addBalnaceUser=async(data,setSucess,setError)=>{
    return await axiosConfig.put(`/admin/users/addBalance/${data.id}`,data).then(res=>setSucess({message:res.data.message,show:true})).
    catch(err=>{
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstMessage = errors[firstKey]?.[0] || err.message;
      setError(firstMessage);
    } else {
      setError(err.message|| "An error occurred.");
    }
    })
}

export const deleteUsers = async (id,setError,setSucess) => await axiosConfig.delete(`/admin/users/${id}`).then(res => setSucess(res.data))
.catch(err => setError(err.message));
