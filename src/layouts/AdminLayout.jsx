import {
  BarChart3,
  Building,
  DollarSign,
  Home,
  Mail,
  Settings,
  TrendingDown,
  User,
  UserCheck,
  Users,
  Wallet,
  List,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/header";
import { Sidebare } from "../components/layout/sidebare";
import { useAppSettings } from "../context/AppSettingsContext";
import { useEffect, useMemo, useState } from "react";
import { getNotificationsList } from "../services/ServicesAdmin/ServicesDashbord";

const sidebarItems = [
  { name: "Dashboard", icon: Home, active: true, link: "/admin/dashbord" },
  {
    name: "User management",
    icon: User,
    hasSubmenu: true,
    children: [
      { name: "Active Users", link: "/admin/active-user" },
      { name: "Banned Users", link: "/admin/banned-user" },
      { name: "Email Unverefied", link: "/admin/email-unverefied" },
    ],
  },
  {
    name: "Shops & Products",
    icon: Building,
    hasSubmenu: true,
    children: [
      { name: "Shops", link: "/admin/shops" },
      { name: "Products", link: "/admin/products" },
    ],
  },
  {
    name: "Orders & Transactions",
    icon: Users,
    hasSubmenu: true,
    badge: true,
    children: [
      { name: "Orders", link: "/admin/all-orders" },
      { name: "Transactions", link: "/admin/all-transactions" },
    ],
  },
  { name: "Deposits", icon: Wallet, link: "/admin/all-deposit/" },
  { name: "Withdrawals", icon: TrendingDown, link: "/admin/all-withdrawals" },
  {
    name: "Support & communications",
    icon: Mail,
    hasSubmenu: true,
    children: [
      { name: "Tickets", link: "/admin/all-tickets" },
      { name: "Notifications", link: "/admin/notifications" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    hasSubmenu: true,
    link: "report",
    children: [
      { name: "Product Report", link: "/admin/product-report" },
      { name: "Order Report", link: "/admin/order-report" },
      { name: "User Report", link: "/admin/user-report" },
      { name: "Visitors Report", link: "/admin/visitors-report" },
      { name: "Transaction Report", link: "/admin/transaction-report" },
      { name: "Top Products", link: "/admin/top-products-report" },
    ],
  },
  {
    name: "Marketing & Promotion",
    icon: Users,
    hasSubmenu: true,
    children: [
      { name: "Email Marketing", link: "/admin/email-marketing" },
      { name: "Promotions", link: "/admin/promotions" },
      { name: "Coupons", link: "/admin/coupons" },
      { name: "Campaigns", link: "/admin/campaigns" },
      { name: "Referrals", link: "/admin/referrals" },
    ],
  },
  { name: "Subscribers", icon: UserCheck, link: "/admin/subscribers" },
  { name: "Profits", icon: DollarSign, link: "/admin/profits" },
  { name: "Activity Logs", icon: List, link: "/admin/activity-logs" },
  { name: "System Setting", icon: Settings, link: "/admin/setting" },
  { name: "Admin Profile", icon: User, link: "/admin/profile" },
];

function AdminLayoutInner() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { appName, logoUrl } = useAppSettings();
  const location = useLocation();
  const normalizePath = (path = "") => path.replace(/\/+$/, "") || "/";

  useEffect(() => {
    let isActive = true;

    async function fetchData() {
      try {
        const notifs = await getNotificationsList({ per_page: 6, status: "all" });
        const items = notifs?.data || [];
        if (!isActive) return;
        setNotifications(items);
        setUnreadCount(items.filter((n) => n.is_read === false).length);
      } catch {
        if (!isActive) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    }

    fetchData();
    const refreshInterval = window.setInterval(fetchData, 60000);

    return () => {
      isActive = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const routeTitleMap = useMemo(() => {
    const map = new Map();
    sidebarItems.forEach((item) => {
      if (item.link) map.set(normalizePath(item.link), item.name);
      if (Array.isArray(item.children)) {
        item.children.forEach((child) => {
          if (child.link) map.set(normalizePath(child.link), child.name);
        });
      }
    });
    return map;
  }, []);

  const currentTitle = routeTitleMap.get(normalizePath(location.pathname)) || "Dashboard";

  useEffect(() => {
    const fullTitle = appName ? `${currentTitle} | ${appName}` : currentTitle;
    document.title = fullTitle;
  }, [appName, currentTitle]);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:items-start">
      <Sidebare
        items={sidebarItems}
        logoUrl={logoUrl}
        appName={appName}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={currentTitle}
          notifications={notifications}
          numberNotification={unreadCount}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1680px] min-w-0 overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return <AdminLayoutInner />;
}
