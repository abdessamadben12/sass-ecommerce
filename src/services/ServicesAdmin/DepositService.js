import { axiosConfig } from "../ConfigueAxios"

export const DepositService = async(setError)=>{
    return await axiosConfig.get("/admin/deposit").then(res=>res.data)
    .catch(err=>{
        setError(err.message)
    })
}