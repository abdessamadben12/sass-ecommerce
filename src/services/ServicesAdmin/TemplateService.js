import { axiosConfig } from "../ConfigueAxios";

export const creerTemplate = async (template, setError, setSuccess) => {
  return axiosConfig
    .post("/admin/templates/create-template", template)
    .then((res) => {
      setSuccess?.({ etats: true, message: res.data.message || "Template created" });
      return res.data;
    })
    .catch((err) => {
      setError?.(err?.response?.data?.message || err.message);
      throw err;
    });
};

export const getTemplates = async (type = null, setError, page = 1, perPage = 10) => {
  const params = { page, per_page: perPage };
  if (type && type !== "null") params.type = type;

  return axiosConfig
    .get("/admin/templates/get-templates", { params })
    .then((res) => res.data)
    .catch((err) => {
      setError?.(err?.response?.data?.message || err.message);
      throw err;
    });
};

export const getTemplateDetaill = async (id, setError) => {
  return axiosConfig
    .get(`/admin/templates/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      setError?.(err?.response?.data?.message || err.message);
      throw err;
    });
};

export const updateTemplate = async (data, id, setError, setSuccess) =>
  axiosConfig
    .put(`/admin/templates/update-template/${id}`, data)
    .then((res) => {
      setSuccess?.({ etats: true, message: res.data.message || "Template updated" });
      return res.data;
    })
    .catch((err) => {
      setError?.(err?.response?.data?.message || err.message);
      throw err;
    });

export const deleteTemplate = async (id) =>
  axiosConfig.delete(`/admin/templates/delete-template/${id}`).then((res) => res.data);
