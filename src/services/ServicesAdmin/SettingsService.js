import { axiosConfig } from "../ConfigueAxios";

export const getGeneralSettings = async () =>
  axiosConfig.get("/admin/settings/general").then((res) => res.data);

export const updateGeneralSettings = async (payload) =>
  axiosConfig.put("/admin/settings/general", payload).then((res) => res.data);

export const uploadLogo = async (file) => {
  const form = new FormData();
  form.append("logo", file);
  return axiosConfig.post("/admin/settings/upload-logo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

export const uploadFavicon = async (file) => {
  const form = new FormData();
  form.append("favicon", file);
  return axiosConfig.post("/admin/settings/upload-favicon", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

export const getPaymentSettings = async () =>
  axiosConfig.get("/admin/settings/payment").then((res) => res.data);

export const updatePaymentSettings = async (payload) =>
  axiosConfig.put("/admin/settings/payment", payload).then((res) => res.data);

export const getEmailSettings = async () =>
  axiosConfig.get("/admin/settings/email").then((res) => res.data);

export const updateEmailSettings = async (payload) =>
  axiosConfig.put("/admin/settings/email", payload).then((res) => res.data);

export const getCommissionSettings = async () =>
  axiosConfig.get("/admin/settings/commission").then((res) => res.data);

export const updateCommissionSettings = async (payload) =>
  axiosConfig.put("/admin/settings/commission", payload).then((res) => res.data);

export const getStorageSettings = async () =>
  axiosConfig.get("/admin/settings/storage").then((res) => res.data);

export const updateStorageSettings = async (payload) =>
  axiosConfig.put("/admin/settings/storage", payload).then((res) => res.data);

export const getPoliciesSettings = async () =>
  axiosConfig.get("/admin/settings/policies").then((res) => res.data);

export const updatePoliciesSettings = async (payload) =>
  axiosConfig.put("/admin/settings/policies", payload).then((res) => res.data);

export const getNotificationsSettings = async () =>
  axiosConfig.get("/admin/settings/notifications").then((res) => res.data);

export const updateNotificationsSettings = async (payload) =>
  axiosConfig.put("/admin/settings/notifications", payload).then((res) => res.data);

export const getMaintenanceSettings = async () =>
  axiosConfig.get("/admin/settings/maintenance").then((res) => res.data);

export const updateMaintenanceSettings = async (payload) =>
  axiosConfig.put("/admin/settings/maintenance", payload).then((res) => res.data);

export const getSeoSettings = async () =>
  axiosConfig.get("/admin/settings/seo").then((res) => res.data);

export const updateSeoSettings = async (payload) =>
  axiosConfig.put("/admin/settings/seo", payload).then((res) => res.data);
