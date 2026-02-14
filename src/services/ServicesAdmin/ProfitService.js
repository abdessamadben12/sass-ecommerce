import { axiosConfig } from "../ConfigueAxios";

export const getProfits = async (params) => {
  const res = await axiosConfig.get("/admin/profits", { params });
  return res.data;
};

export const getProfitDetail = async (sellerId, params) => {
  const res = await axiosConfig.get(`/admin/profits/${sellerId}`, { params });
  return res.data;
};

