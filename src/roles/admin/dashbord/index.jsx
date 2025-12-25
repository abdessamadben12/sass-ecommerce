import * as LucideIcons from 'lucide-react';
import Card from "../../../components/ui/card";
import CardDeposit from "../../../components/ui/CardDeposit";
import {getAnnalyseUser,getDepositAnnalyse,getViewGlobal,getWithdrawls,getDepositWithdrawChartData, getNotification} from "../../../services/ServicesAdmin/ServicesDashbord"
import {  useEffect, useState } from "react";


const IconRenderer = ({ iconName, size = 24, color = 'black' }) => {
    const LucideIcon = LucideIcons[iconName]; // récupère l'icône dynamiquement
  
    if (!LucideIcon) return <span>Icône inconnue: {iconName}</span>;
  
    return <LucideIcon size={size} color={color} />;
  };


import { getCsrfTocken } from "../../../services/ConfigueAxios";
import TransactionsReport from '../../../components/ui/charts/TransactionsChart';
import Loading from '../../../components/ui/loading';
  export default function Dashboard() {
    const [userInfo,setUserInfo]=useState([])
    const [deposit,setDeposit]=useState([])
    const [Withdrawal,setWithdrawal]=useState([])
    const [viewGlobal,setViewGlobal]=useState([])
    const [depositWithdrawalChart,setDepositWithdrawalChart]=useState([])
    const [notificaion,setNotificaion]=useState([])
    const [loading,setLoading]=useState(false)
    
    useEffect(()=>{
       const fetchData=async()=>{
        setLoading(true)
        await getCsrfTocken()
       
        const users= await getAnnalyseUser()
        const deposits=await getDepositAnnalyse()
        const Withdrawals=await getWithdrawls()
        const viewGlobals=await getViewGlobal()
        const DepositWithdrawal=await getDepositWithdrawChartData()
        const notifs=await getNotification()
        setUserInfo(users)
        setDeposit(deposits)
        setWithdrawal(Withdrawals)
        setViewGlobal(viewGlobals)
        setDepositWithdrawalChart(DepositWithdrawal)
      
        setLoading(false)

       }
       fetchData()
    },[])
   
    return (
        <>
    {loading ?<Loading/> :<div>
        <div>
             <h1 className="text-xl font-bold text-gray-600 mb-5">Dashboard</h1>
        </div>
        <div className="w-full">
            <div className="grid grid-cols-2 gap-5 ">
                {userInfo?.map((user,key)=><Card key={key} title={user.title}
                 value={user.value} icon={<IconRenderer iconName={user.icon} size={30} color={user.colorIcon}
                    />} bgColor={user.bgColor} 
                 borderColor={user.borderColor}
                 />)}
            </div>
        </div>
        {/* deposit */}
        <div className="bg-white shadow-md mt-10 w-full  ">
        <h1 className="text-gray-400 m-4 text-xl font-bold">Deposit</h1>
        <div className="grid grid-cols-2 ">
            {deposit?.map((item,key)=><CardDeposit key={key} title={item.title} bgColor={item.bgColor}
                 value={item.value} icon={<IconRenderer size={30} iconName={item.icon} color={item.iconColor}/>} 
                 />)}
        </div>
        </div>
    {/* Withdrawals */}
    <div className="bg-white shadow-md mt-10 w-full  ">
        <h1 className="text-gray-400 m-4 text-xl font-bold">Withdrawals</h1>
        <div className="grid grid-cols-2 ">
            {Withdrawal.map((item,key)=><CardDeposit key={key} title={item.title}
                 value={item.value} icon={<IconRenderer iconName={item.icon} color={item.iconColor} size={30}/>} 
                 bgColor={item.bgColor} />)}
        </div>
        </div>
        {/* view global les shopa and prouduct  */}
        <div className="bg-white shadow-md mt-10 w-full  ">
        <div className="grid grid-cols-2 ">
            {viewGlobal.map((item,key)=><CardDeposit key={key} title={item.title}
                 value={item.value} icon={<IconRenderer iconName={item.icon}  color={item.colorIcon} size={30}/>} 
                 bgColor={item.bgColor} />)}
        </div>
        </div>

        {/* charts */}
        {/* <DashboardReports/>
        <TopProductsChart/> */}
        <div className='grid grid-cols-1 mt-10 gap-2'>
             <TransactionsReport/>
        </div>
     </div>}
     
     </>
    );
  }
  