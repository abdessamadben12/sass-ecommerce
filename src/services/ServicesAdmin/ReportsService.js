import { axiosConfig } from "../ConfigueAxios";

const buildParams = ({ from, to, status, page, perPage }) => ({
  from: from || undefined,
  to: to || undefined,
  status: status || "all",
  page: page || 1,
  per_page: perPage || 10,
});

export const getProductReport = async (filters) => {
  const res = await axiosConfig.get("/admin/reports/products", { params: buildParams(filters) });
  return res.data;
};

export const getOrderReport = async (filters) => {
  const res = await axiosConfig.get("/admin/reports/orders", { params: buildParams(filters) });
  return res.data;
};

export const getUserReport = async (filters) => {
  const res = await axiosConfig.get("/admin/reports/users", { params: buildParams(filters) });
  return res.data;
};

export const getVisitorsReport = async (filters) => {
  const res = await axiosConfig.get("/admin/reports/visitors", { params: buildParams(filters) });
  return res.data;
};

export const getTransactionReport = async (filters) => {
  const res = await axiosConfig.get("/admin/reports/transactions", { params: buildParams(filters) });
  return res.data;
};

export const getTopProductsReport = async ({ from, to, limit = 10 } = {}) => {
  const res = await axiosConfig.get("/admin/reports/top-products", {
    params: {
      from: from || undefined,
      to: to || undefined,
      limit,
    },
  });
  return res.data;
};
