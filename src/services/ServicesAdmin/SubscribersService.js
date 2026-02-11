import { axiosConfig } from "../ConfigueAxios";

export const getSubscribers = async ({ query = "", page = 1, perPage = 10 } = {}) => {
  const res = await axiosConfig.get("/admin/subscribers", {
    params: {
      q: query,
      page,
      per_page: perPage,
    },
  });
  return res.data;
};

