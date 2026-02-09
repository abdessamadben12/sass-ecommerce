import { axiosConfig } from "../ConfigueAxios";

export const getActivityLogs = async (params) =>
  axiosConfig.get("/admin/activity-logs", { params }).then((res) => res.data);
