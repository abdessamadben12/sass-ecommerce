import { axiosConfig } from "../ConfigueAxios";

export const  getShops=async(name=null,status,page,per_page,setError)=>await axiosConfig.get
(`/admin/shops?page=${page}&per_page=${per_page}&name=${name}&status=${status}`).then(res=>res.data).catch(err=>setError(err.message))

export const  getProducts=async(name=null,status,page,per_page,setError)=>await axiosConfig.get
(`/admin/products?page=${page}&per_page=${per_page}&name=${name}&status=${status}`).then(res=>res.data).catch(err=>setError(err.message))

export const getShop=async(id,setError)=>await axiosConfig.get(`admin/shops/${id}`)
.then(res=>res.data).catch(err=>setError(err.message))