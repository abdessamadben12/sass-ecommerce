import { axiosConfig } from "../ConfigueAxios"

export const DepositService = async(status,inputSerach,StartDate,endDate,page,perPage,setError)=>{
    return await axiosConfig.get("/admin/deposits", {
        params: {
            search: inputSerach,
            start_date: StartDate,
            end_date: endDate,
            status: status,
            page: page,
            per_page: perPage
        }
    }).then(res=>res.data)
    .catch(err=>{
        setError(err.message)
    })
}