import axios from "axios";
import { axiosConfig } from "../ConfigueAxios";

export  const getAnnalyseUser = async ()=>await axiosConfig.get("/admin/userAnnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getDepositAnnalyse=async()=>axiosConfig.get("/admin/depositAnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getWithdrawls=async ()=> await axiosConfig.get("/admin/withdrawalAnalyse").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getViewGlobal=async ()=> await axiosConfig.get("/admin/globalViews").then(res=>res.data)
.catch(err=>console.log(err.message))

export const getChartTransaction=async(to=null,from=null)=>await axiosConfig.get(`admin/dailyTransactionsReport?to=${to}&from=${from}`).then(res=>res.data)
 export const getDepositWithdrawChartData=async()=>await axiosConfig.get("/admin/DepositWithdrawChartData")
.then(res=>res).catch(err=>console.log(err.message))

export const FiltrerDepositWithdrawChartData=async(startDate,endDate)=>await axiosConfig.get(`/admin/DepositWithdrawChartData/${startDate}/${endDate}`).then(res=>res)
.catch(err=>console.log(err.message))

export const getNotification=async()=>await axiosConfig.get("/admin/notifications").then(res=>res.data).catch(err=>console.log(err))