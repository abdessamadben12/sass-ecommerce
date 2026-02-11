import axios from "axios";
import { axiosConfig } from "../ConfigueAxios";

export const getDashboardOverview = async () =>
  axiosConfig.get("/admin/dashboard/overview").then((res) => res.data);

export  const getAnnalyseUser = async ()=>await axiosConfig.get("/admin/userAnnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getDepositAnnalyse=async()=>axiosConfig.get("/admin/depositAnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getWithdrawls=async ()=> await axiosConfig.get("/admin/withdrawalAnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getViewGlobal=async ()=> await axiosConfig.get("/admin/globalViews").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getChartTransaction=async(from=null,to=null)=>await axiosConfig.get(`admin/dailyTransactionsReport?to=${to}&from=${from}`).then(res=>res.data)
 export const getDepositWithdrawChartData=async()=>await axiosConfig.get("/admin/DepositWithdrawChartData")
.then(res=>res).catch(err=>console.log(err.message))

export const FiltrerDepositWithdrawChartData=async(startDate,endDate)=>await axiosConfig.get(`/admin/DepositWithdrawChartData/${startDate}/${endDate}`).then(res=>res)
.catch(err=>console.log(err.message))

export const getNotification=async()=>await axiosConfig.get("/admin/notifications", { params: { per_page: 50 } })
  .then(res=>res.data?.data || res.data)
  .catch(err=>console.log(err))

export const getNotificationsList = async (params) =>
  axiosConfig.get("/admin/notifications", { params })
    .then(res => res.data)
    .catch(err => console.log(err))

export const getNotificationDetail = async (id) =>
  axiosConfig.get(`/admin/notifications/${id}`).then(res => res.data)

export const markNotificationRead = async (id) =>
  axiosConfig.put(`/admin/notifications/${id}/read`).then(res => res.data)

export const markAllNotificationsRead = async () =>
  axiosConfig.put(`/admin/notifications/read-all`).then(res => res.data)

export const createAdminUser = async (payload) =>
  axiosConfig.post("/admin/users/create-admin", payload).then(res => res.data)
