import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Ban,
  Banknote,
  Bell,
  Coins,
  CreditCard,
  DollarSign,
  Heart,
  List,
  ListOrderedIcon,
  MinusCircle,
  PlusCircle,
  Repeat,
  Wallet,
  User as UserIcon
} from "lucide-react";
import Card from "../../../../components/ui/card";
import CardDeposit from "../../../../components/ui/CardDeposit";
import CardNormal from "../../../../components/ui/CardNormal";
import NotifyError from "../../../../components/ui/NotifyError";
import { addBalnaceUser, getUserById, subBalanceUser, updateUser } from "../../../../services/ServicesAdmin/userServices";
import UserEdit from "./EditUser";
import BalanceModal from "../../../../components/ui/formBalance";
import { NotifySuccess } from "../../../../components/ui/NotifySucces";

export default function DetaillUser() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [ShowAddBalance, setShowAddBalance] = useState(false);
  const [ShowRemoveBalance, setShowRemoveBalance] = useState(false);
  const [sucess, setSucess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const response = await getUserById(id, setError);
      setData(response);
    };
    fetchUser();
  }, [id]);

  const userStats = [
    { title: "Balance", value: data?.user?.balance, bgColor: "bg-blue-50", icon: <Banknote className="text-blue-600" size={28} />, borderColor: "border-blue-200", link: "" },
    { title: "Deposit", value: data?.user?.deposits_sum ?? 0, bgColor: "bg-green-50", icon: <Wallet className="text-green-600" size={28} />, borderColor: "border-green-200", link: "" },
    { title: "Withdrawals", value: data?.user?.withdrawals_sum ?? 0, bgColor: "bg-orange-50", icon: <CreditCard className="text-orange-600" size={28} />, borderColor: "border-orange-200", link: `withdrwals/${id}` },
    { title: "Transaction", value: data?.user?.transactions_sum ?? 0, bgColor: "bg-indigo-50", icon: <Repeat className="text-indigo-600" size={28} />, borderColor: "border-indigo-200", link: "" },
    { title: "Profit", value: data?.total_profit ?? 0, bgColor: "bg-emerald-50", icon: <Coins className="text-emerald-600" size={28} />, borderColor: "border-emerald-200", link: "" },
    { title: "Due Amount", value: data?.due_amount ?? 0, bgColor: "bg-amber-50", icon: <DollarSign className="text-amber-600" size={28} />, borderColor: "border-amber-200", link: "" },
  ];

  const productStats = [
    { title: "Total Product", value: data?.user?.products_count ?? 0, icon: <Heart className="text-yellow-600" size={24} />, bgColor: "bg-yellow-50" },
    { title: "Total Orders", value: data?.user?.orders_count ?? 0, icon: <ListOrderedIcon className="text-yellow-700" size={24} />, bgColor: "bg-yellow-100" },
  ];

  const userActions = [
    { title: "Add Balance", icon: <PlusCircle size={20} />, bgColor: "bg-green-600", action: () => setShowAddBalance(true) },
    { title: "Sub Balance", icon: <MinusCircle size={20} />, bgColor: "bg-red-500", action: () => setShowRemoveBalance(true) },
    { title: "Logins", icon: <List size={20} />, bgColor: "bg-blue-600", action: () => navigate("/admin/detaill-user/login/" + data.user?.id) },
    { title: "Notifications", icon: <Bell size={20} />, bgColor: "bg-slate-600", action: () => navigate("/admin/detaill-user/notification/" + data.user?.id) },
    { title: "Ban User", icon: <Ban size={20} />, bgColor: "bg-orange-600", action: () => console.log("Ban clicked") },
  ];

  async function handleBalanceAdd(param) {
    const dataForm = { ...param, id: data.user.id };
    const response = await addBalnaceUser(dataForm, setSucess, setError);
    navigate("/admin/detaill-user/login/" + data.user?.id);
    return response;
  }
  async function handleBalanceSub(param) {
    const dataForm = { ...param, id: data.user.id };
    const response = await subBalanceUser(dataForm, setSucess, setError);
    navigate("/admin/detaill-user/login/" + data.user?.id);
    return response;
  }

  async function handleUpdate(dataUser) {
    setLoading(true);
    await updateUser(dataUser, data.user.id, setSucess, setError);
    const response = await getUserById(id, setError);
    setData(response);
    setLoading(false);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="text-gray-400" />
            User Details
          </h1>
          <p className="text-sm text-gray-500">Manage account information and financial records</p>
        </div>
        
        {/* Quick Actions Toolbar */}
        <div className="flex flex-wrap gap-2">
          {userActions.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`${item.bgColor} hover:opacity-90 transition-all text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm`}
            >
              {item.icon}
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {userStats.map((item, index) => (
          <div key={index} className={`p-4 rounded-xl border-l-4 ${item.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
             <div className="flex items-center gap-4">
                <div className={`${item.bgColor} p-3 rounded-lg`}>
                    {item.icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{item.title}</p>
                    <p className="text-xl font-bold text-gray-800">{item.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Stats */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Inventory & Orders</h2>
          <div className="grid grid-cols-1 gap-4">
            {productStats.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`${item.bgColor} p-2 rounded-full`}>{item.icon}</div>
                    <span className="font-medium text-gray-600">{item.title}</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: User Edit Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Profile Information</h2>
          <UserEdit user={data?.user} onSubmit={handleUpdate} loading={loading} />
        </div>
      </div>

      {/* Notifications & Modals */}
      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
      {ShowAddBalance && (
        <BalanceModal onClose={() => setShowAddBalance(false)} onAction={handleBalanceAdd} title="Add Balance" />
      )}
      {ShowRemoveBalance && (
        <BalanceModal onClose={() => setShowRemoveBalance(false)} onAction={handleBalanceSub} title="Subtract Balance" />
      )}
      {sucess.show && (
        <NotifySuccess message={sucess.message} sucess={sucess.show} onClose={setSucess} />
      )}
    </div>
  );
}
