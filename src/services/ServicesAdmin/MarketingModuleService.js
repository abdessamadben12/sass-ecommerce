import { axiosConfig } from "../ConfigueAxios";

export const getPromotions = async (params) =>
  axiosConfig.get("/admin/marketing/promotions", { params }).then((r) => r.data);

export const createPromotion = async (payload) =>
  axiosConfig.post("/admin/marketing/promotions", payload).then((r) => r.data);

export const deletePromotion = async (id) =>
  axiosConfig.delete(`/admin/marketing/promotions/${id}`).then((r) => r.data);

export const getCoupons = async (params) =>
  axiosConfig.get("/admin/marketing/coupons", { params }).then((r) => r.data);

export const createCoupon = async (payload) =>
  axiosConfig.post("/admin/marketing/coupons", payload).then((r) => r.data);

export const deleteCoupon = async (id) =>
  axiosConfig.delete(`/admin/marketing/coupons/${id}`).then((r) => r.data);

export const getCampaigns = async (params) =>
  axiosConfig.get("/admin/marketing/campaigns", { params }).then((r) => r.data);

export const createCampaign = async (payload) =>
  axiosConfig.post("/admin/marketing/campaigns", payload).then((r) => r.data);

export const deleteCampaign = async (id) =>
  axiosConfig.delete(`/admin/marketing/campaigns/${id}`).then((r) => r.data);

export const getReferralCodes = async (params) =>
  axiosConfig.get("/admin/marketing/referrals/codes", { params }).then((r) => r.data);

export const createReferralCode = async (payload) =>
  axiosConfig.post("/admin/marketing/referrals/codes", payload).then((r) => r.data);

export const getReferralInvites = async (params) =>
  axiosConfig.get("/admin/marketing/referrals/invites", { params }).then((r) => r.data);

export const getReferralRewards = async (params) =>
  axiosConfig.get("/admin/marketing/referrals/rewards", { params }).then((r) => r.data);
