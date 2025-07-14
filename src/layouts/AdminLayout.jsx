import {
    BarChart3,
    Building,
    Home,
    Mail,
    Settings,
    TrendingDown,
    User,
    UserCheck,
    Users,
    Wallet
  } from "lucide-react";

import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/header";
import { Sidebare } from "../components/layout/sidebare";
import { useEffect, useState } from "react";
import { getNotification } from "../services/ServicesAdmin/ServicesDashbord";

  
  // ——— Données placées hors du composant ———
  const notifications = [
    { id: 1, title: "Nouvelle commande reçue", time: "2h ago",  },
    { id: 2, title: "Utilisateur inscrit",    time: "1j ago", unread: true },
    { id: 3, title: "Maintenance prévue",      time: "3j ago", unread: false }, { id: 1, title: "Nouvelle commande reçue", time: "2h ago", unread: true },
    { id: 2, title: "Utilisateur inscrit",    time: "1j ago", unread: true },
    { id: 3, title: "Maintenance prévue",      time: "3j ago", unread: false }, { id: 1, title: "Nouvelle commande reçue", time: "2h ago", unread: true },
    { id: 2, title: "Utilisateur inscrit",    time: "1j ago", unread: true },
    { id: 3, title: "Maintenance prévue",      time: "3j ago", unread: false },
  ];
  
  const sidebarItems = [
    { name: 'Dashboard',icon: Home,active: true,link:"/admin/dashbord" },
    { name: 'User management',       icon: User,   hasSubmenu: true, children:[
      {name:"Active Users", link:"/admin/active-user"},
      {name:"Banned Users", link:"/admin/banned-user"},
      {name:"Email Unverefied", link:"/admin/email-unverefied"},
    ] },
    { name: 'Shops & Products',icon: Building,hasSubmenu: true,children:[
      {name:"All Shops", link:"/admin/shops"},
      {name:"All Products", link:"/admin/products"},
      ]},
    { name: 'Orders & Transactions',     icon: Users,hasSubmenu: true, badge: true, children:[
      {name:"All Orders", link:"/admin/all-orders"},
      {name:"Pending Orders", link:"/admin/pending-orders"},
      {name:"Completed Orders", link:"/admin/completed-orders"},
      {name:"Cancelled Orders", link:"/admin/cancelled-orders"},
    ] },
    { name: 'Deposits',icon: Wallet,    hasSubmenu: true, badge: true,
      children:[
        {name:"All Deposits", link:"/admin/all-deposit/"},
        {name:"Pending Deposits", link:"/admin/pending-deposits"},
        {name:"Completed Deposits", link:"/admin/completed-deposits"},
        {name:"Cancelled Deposits", link:"/admin/cancelled-deposits"},
      ]
     },
    { name: 'Withdrawals',hasSubmenu: true,icon: TrendingDown ,children:[
      {name:"All Withdrawals", link:"/admin/all-withdrawals"},
      {name:"Pending Withdrawals", link:"/admin/pending-withdrawals"},
      {name:"Completed Withdrawals", link:"/admin/completed-withdrawals"},
      {name:"Cancelled Withdrawals", link:"/admin/cancelled-withdrawals"},
    ] },
    { name: 'Support & communications',   icon: Mail, hasSubmenu: true,children:[
      {name: "Pending Tickets", link:"/admin/pending-tickets"},
      {name: "Closed Tickets", link:"/admin/closed-tickets"},
      {name:"Answered Tickets", link:"/admin/answered-tickets"},
      {name:"All Tickets", link:"/admin/all-tickets"},
    ]},
    { name: 'Report',icon: BarChart3,hasSubmenu: true,link:"report",children:[
      {name:"Product Report", link:"/admin/product-report"},
      {name:"Order Report", link:"/admin/order-report"},
      {name:"User Report", link:"/admin/user-report"},
      {name:"Visitors Report", link:"/admin/visitors-report"},
      {name:"Transaction Report", link:"/admin/transaction-report"}
    ]},
    { name: 'Marketing et promotion',  icon: Users ,hasSubmenu: true, children:[
      {name:"Email Marketing", link:"/admin/email-marketing"},
      {name:"Promotions", link:"/admin/promotions"},
    ]},
    { name: 'Subscribers',      icon: UserCheck ,link:"subscribers"},

    { name: 'System Setting',   icon: Settings ,link:"setting"},
  ];
export default function AdminLayout(){
  const [notifications,setNotificaion]=useState([])
  useEffect(()=>{
    async function fetchData(){
      const notifs=await getNotification()
      setNotificaion(notifs)
      console.log(notifs)
    }
    fetchData()
  },[])
    return <>
    <div className="relative min-h-screen">
           <div className="  flex bg-gray-50 p-0  fixed left-0 right-0 overfow-auto inset-x-0 overflow-y-auto h-screen  ">
        {/* Sidebar */}
        <Sidebare items={sidebarItems} />
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-x-hidden ">
          {/* Header */}
          <Header
            notifications={notifications}
            numberNotification={notifications.length}
          />
          <main className="-1  p-6 min-h-screen overflow-y-auto ">
            <Outlet/>
          </main>
        </div>
      </div>     
    </div>
   
    </>
}