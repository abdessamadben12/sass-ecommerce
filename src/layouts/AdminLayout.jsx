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
    Wallet,
    List
  } from "lucide-react";

import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/header";
import { Sidebare } from "../components/layout/sidebare";
import { useEffect, useState } from "react";
import { getNotificationsList } from "../services/ServicesAdmin/ServicesDashbord";

  
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
      {name:"All Transactions",link:"/admin/all-transactions"}
    ] },
    { name: 'Deposits',icon: Wallet, link:"/admin/all-deposit/"},
    { name: 'Withdrawals', icon: TrendingDown, link:"/admin/all-withdrawals"},
    { name: 'Support & communications',   icon: Mail, hasSubmenu: true,children:[
      {name: "Pending Tickets", link:"/admin/pending-tickets"},
      {name:"All Tickets", link:"/admin/all-tickets"},
      {name:"Notifications", link:"/admin/notifications"},
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
      {name:"Coupons", link:"/admin/coupons"},
      {name:"Campaigns", link:"/admin/campaigns"},
      {name:"Referrals", link:"/admin/referrals"},
    ]},
    { name: 'Subscribers',      icon: UserCheck ,link:"subscribers"},
    { name: 'Activity Logs',   icon: List, link:"/admin/activity-logs"},
    { name: 'System Setting',   icon: Settings ,link:"/admin/setting"},
    { name: 'Admin Profile',   icon: User ,link:"/admin/profile"},
  ];
export default function AdminLayout(){
  const [notifications,setNotificaion]=useState([])
  const [unreadCount,setUnreadCount]=useState(0)
  useEffect(()=>{
    async function fetchData(){
      const notifs=await getNotificationsList({ per_page: 6, status: "all" })
      const items = notifs?.data || []
      setNotificaion(items)
      setUnreadCount(items.filter(n => n.is_read === false).length)
     
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
            numberNotification={unreadCount}
          />
          <main className="-1  p-6 min-h-screen overflow-y-auto ">
            <Outlet/>
          </main>
        </div>
      </div>     
    </div>
    </>
}
