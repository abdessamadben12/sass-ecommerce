import { axiosConfig } from "../ConfigueAxios";

export const allCategory=async(current,perPage,setError)=>await axiosConfig.get("/categorie?page="+current+"&per_page="+perPage).then(res=>res.data).catch(err=>setError({etats:true,message:err.message}))
export const categoryByName=async(setError)=>await axiosConfig.get("category-by-name").then(res=>res.data).catch(err=>setError({etats:false,message:err.message})) 
export const CategoryDetaill=async(id,setError)=>await axiosConfig.get("/categorie/"+id).then(res=>res.data)
.catch(err=>setError({etats:true,message:err.message}))

export const getParentCategory=async(id,setError)=>await axiosConfig.get("/parent-categorie/")
.then(res=>res.data).catch(err=>setError({etats:true,message:err.message}))

export const putCategory=async(id,data,setError)=>await axiosConfig.post("/categorie/"+id,data,{
    headers:{
        "Content-Type":"multipart/form-data"
    }
}).then(res=>res.data).catch(err=>setError(err.message))
export const addCategory=async(data,setError,setSucess)=>await axiosConfig.post("/categorie/",data,{
    headers:{
        "Content-Type":"multipart/form-data"
    }
})
.then(res=>setSucess({etats:true,message:res.data.message})).catch(err=>setError({etats:true,message:err.message}))

export const deleteCategory=async(id,setError,setSucess)=>await axiosConfig.delete("/categorie/"+id)
.then(res=>setSucess({etats:true,message:res.data.message}))
.catch(err=>setError({etats:true,message:err.message}))