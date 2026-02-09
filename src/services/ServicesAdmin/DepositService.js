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

export const getDepositById = async (id) =>
    axiosConfig.get(`/admin/deposits/${id}`).then((res) => res.data);

export const approveDeposit = async (id) =>
    axiosConfig.post(`/admin/deposits/${id}/approve`).then((res) => res.data);

export const rejectDeposit = async (id, reason) =>
    axiosConfig.post(`/admin/deposits/${id}/reject`, { reason }).then((res) => res.data);
