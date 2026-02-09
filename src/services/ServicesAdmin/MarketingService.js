import { axiosConfig } from "../ConfigueAxios";

export const sendMarketingEmail = async (payload) =>
  axiosConfig.post("/admin/email-marketing", payload).then((res) => res.data);

export const searchMarketingRecipients = async (type, query) =>
  axiosConfig
    .get("/admin/marketing/recipients", {
      params: { type, q: query },
    })
    .then((res) => res.data);
