import { axiosConfig } from "../ConfigueAxios";

export const getLicensesByName=async(setError)=>await axiosConfig.get("license-by-name")
.then(res=>res.data).catch(err=>setError({etats:false,message:err.message}))