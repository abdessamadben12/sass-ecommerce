import { axiosConfig } from "../ConfigueAxios";

export const getWithdrawals = async (status, inputSerach, StartDate, endDate, page, perPage, setError) => {
  try {
    const response = await axiosConfig.get('/admin/withdrawals', { 
         params: {
            search: inputSerach,
            start_date: StartDate,
            end_date: endDate,
            status: status,
            page: page,
            current_page: page,
            per_page: perPage
        }
     });
    return response.data;
  } catch (error) {
    setError(error.message);
    return { data: [], last_page: 1, current_page: 1, per_page: 10 };
  }
}

export const getWithdrawalById = async (id) =>
  axiosConfig.get(`/admin/withdrawals/${id}`).then((res) => res.data);

export const approveWithdrawal = async (id) =>
  axiosConfig.post(`/admin/withdrawals/${id}/approve`).then((res) => res.data);

export const rejectWithdrawal = async (id, reason) =>
  axiosConfig.post(`/admin/withdrawals/${id}/reject`, { reason }).then((res) => res.data);

