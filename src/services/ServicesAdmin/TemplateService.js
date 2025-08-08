
import { axiosConfig } from "../ConfigueAxios"

export const creerTemplate=async(template,setError,setSuccess)=>{
  return await axiosConfig.post("/admin/templates/create-template",template)
  .then((res)=>setSuccess({etats:true,message:res.data.message})).
  catch(err=>setError(err.message))

}
export const getTemplates=async(type=null,setError)=>{
  return await axiosConfig.get("/admin/templates/get-templates?type="+type).then(res=>res.data).catch(err=>setError(err.message))

}
export const getTemplateDetaill=async(id,setError)=>{
  return await axiosConfig.get("/admin/templates/"+id).then(res=>res.data).catch(err=>setError(err.message))

}
export const  updateTemplate=async (data,id,setError,setSuccess)=>await axiosConfig.put("/admin/templates/update-template/"+id,data)
.then(res=>setSuccess({etats:true,message:res.data.message}))
.catch(err=>setError(err.message))