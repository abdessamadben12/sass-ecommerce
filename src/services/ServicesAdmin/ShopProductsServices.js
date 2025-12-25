import { axiosConfig } from "../ConfigueAxios";

export const  getShops=async(name=null,status,page,per_page,setError)=>await axiosConfig.get
(`/admin/shops?page=${page}&per_page=${per_page}&name=${name}&status=${status}`).then(res=>res.data).catch(err=>setError(err.message))
export const getStatistiqueShop=async(id,setError)=>await axiosConfig.get(`/admin/shops/statistique/${id}`)
.then(res=>res.data).catch(err=>setError(err.message))

export const getShop=async(id,setError)=>await axiosConfig.get(`admin/shops/${id}`)
.then(res=>res.data).catch(err=>setError(err.message))






// les services de products
export const  getProducts=async(filter,meta,setError)=>await axiosConfig.get
(`/admin/products?page=${meta?.page}&per_page=${meta?.per_page}&serch=${filter?.name}&status=${filter?.status}&category_id=${filter?.category_id}&price_min=${filter.min_price || 0}&price_max=${filter.max_price || 0}&license_id=${filter.license_id}&sort=${filter?.sort}`)
.then(res=>res.data).catch(err=>setError(err.message))

export const getProductDetaill=async(id,setError)=>await axiosConfig.get(`/admin/products/${id}`).then(res=>res.data).catch(err=>setError({etats:false,message:err.message}))
export  const updateStatuProduct=async(id,status,setError)=>await axiosConfig.put(`/admin/products/${id}/status`,{status}).then(res=>res.data).catch(err=>setError(err.message))

export const getPendingProducts=async(setError)=>await axiosConfig.get(`/admin/products/test-pending`)
.then(res=>res.data)
.catch(err=>setError({etats:true,message:err.message}))

export const putStatusProduct=async(id,status,reason,setSuccess,setError)=>await axiosConfig.put(`/admin/products/${id}/${status}`,{reason})    
.then(res=>setSuccess({etats:true,message:res.data.message}))
.catch(err=>setError(err.message))

export const getFileFormats=async(setError)=>await axiosConfig.get(`/admin/file-formats`).then(res=>res.data).catch(err=>setError({etats:true,message:err.message}))
export const  putFileFormat=async(id,data,setSuccess,setError)=>await axiosConfig.put(`/admin/file-formats/${id}`,data).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))
export const  postFileFormat=async(data,setSuccess,setError)=>await axiosConfig.post(`/admin/file-formats`,data).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))
export const  deleteFileFormat=async(id,setSuccess,setError)=>await axiosConfig.delete(`/admin/file-formats/${id}`).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))

// product settings
export const getProductSettings=async(setError)=>await axiosConfig.get(`/admin/product-settings`).then(res=>res.data).catch(err=>setError({etats:true,message:err.message}))
export const postProductSettings=async(data,setSuccess,setError)=>await axiosConfig.post(`/admin/product-settings`,data).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))
export const deleteProductSettings=async(id,setSuccess,setError)=>await axiosConfig.delete(`/admin/product-settings/${id}`).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))

// licenses
export const getLicenses=async(setError)=>await axiosConfig.get(`/admin/licenses`).then(res=>res.data).catch(err=>setError({etats:true,message:err.message}))
export const postLicense=async(data,setSuccess,setError)=>await axiosConfig.post(`/admin/licenses`,data).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.response.data.message}))
export const putLicense=async(id,data,setSuccess,setError)=>await axiosConfig.put(`/admin/licenses/${id}`,data).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.response.data.message}))
export const deleteLicense=async(id,setSuccess,setError)=>await axiosConfig.delete(`/admin/licenses/${id}`).then(res=>setSuccess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.response.data.message}))

// shop products
export const putStatusShop=async(id,status,setSuccess,setError)=>await axiosConfig.put(`/admin/shops/status/${id}`,{status})
.then(res=>setSuccess({etats:true,message:res.data.message}))
.catch(err=>setError({etats:true,message:err.response.data.message}))

