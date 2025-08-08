import { axiosConfig } from "../ConfigueAxios";

export const getOrders = async (inputSearch, status, startDate, endDate, page, perPage, setError) => {
  try {
    const response = await axiosConfig.get('/admin/orders', {
      params: {
        search: inputSearch,
        status: status,
        start_date: startDate,
        end_date: endDate,
        page: page,
        per_page: perPage
      }
    });
    return response.data;
  } catch (error) {
    setError(error.message);
    return { data: [], last_page: 1, current_page: 1, per_page: 10 };
  }
}
export const StatisticsOrders = async (setError) => {
  try {
    const response = await axiosConfig.get('/admin/orders/statistics');
    return response.data;
  } catch (error) {
    setError(error.message);
    return { totalOrders: 0, totalSales: 0, totalRevenue: 0 };
  }
}

export const getOrderDetails = async (id, setError) => {
  try {
    const response = await axiosConfig.get(`/admin/order/${id}`);
    return response.data;
  } catch (error) {
    setError(error.message);
    return null;
  }
}
