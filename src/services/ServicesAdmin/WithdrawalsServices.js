import { axiosConfig } from "../ConfigueAxios";

export const getWithdrawals = async (inputSerach, StartDate, endDate, status, page, perPage,setError) => {
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

