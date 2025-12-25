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
} from "lucide-react";
import Card from "../../../../components/ui/card";
import CardDeposit from "../../../../components/ui/CardDeposit";
import CardNormal from "../../../../components/ui/CardNormal";
import NotifyError from "../../../../components/ui/NotifyError";
import { addBalnaceUser, getUserById, updateUser } from "../../../../services/ServicesAdmin/userServices";
import UserEdit from "./EditUser";
import BalanceModal from "../../../../components/ui/formBalance";
import { NotifySuccess } from "../../../../components/ui/NotifySucces";

export default function DetaillUser() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [ShowAddBalance,setShowAddBalance]=useState(false)
  const [ShowRemoveBalance,setShowRemoveBalance]=useState(false)
  const [sucess,setSucess]=useState(false)
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate()
  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const response = await getUserById(id, setError);
      setData(response);
    };
    fetchUser();
  }, [id]);
  
  const userStats = [
    {
      title: "Balance",
      value: data?.user?.balance  ,
      bgColor: "bg-blue-200",
      icon: <Banknote color="#0000FF" size={30} />,
      borderColor: "border-blue-300 border",
      link: "",
    },
    {
      title: "Deposit",
      value: data?.user?.deposits_sum ?? 0,
      bgColor: "bg-green-200",
      icon: <Wallet color="#008000" size={30} />,
      borderColor: "border-green-400 border",
      link: "",
    },
    {
      title: "Withdrawals",
      value: data?.user?.withdrawals_sum ?? 0,
      bgColor: "bg-orange-100",
      icon: <CreditCard color="#DAA520" size={30} />,
      borderColor: "border-orange-400 border",
      link: `withdrwals/${id}`,
    },
    {
      title: "Transaction",
      value: data?.user?.transactions_sum ?? 0,
      bgColor: "bg-blue-200",
      icon: <Repeat color="#0000FF" size={30} />,
      borderColor: "border-blue-300 border",
      link: "",
    },
    {
      title: "Profit",
      value: data?.total_profit ?? 0,
      bgColor: "bg-green-200",
      icon: <Coins color="#008000" size={30} />,
      borderColor: "border-green-400 border",
      link: "",
    },
    {
      title: "Due Amount",
      value: data?.due_amount ?? 0,
      bgColor: "bg-orange-100",
      icon: <DollarSign color="#DAA520" size={30} />,
      borderColor: "border-orange-400 border",
      link: "",
    },
  ];

  const productStats = [
    {
      title: "Total Product",
      value: data?.user?.products_count ?? 0,
      icon: <Heart color="#FFD700" size={30} />,
      bgColor: "bg-yellow-200",
      link: "",
    },
    {
      title: "Total Orders",
      value: data?.user?.orders_count ?? 0,
      icon: <ListOrderedIcon color="#DAA520" size={30} />,
      bgColor: "bg-yellow-400",
      link: "",
    },
  ];
  const userActions = [
    {
      title: "Balance",
      icon: <PlusCircle className="w-5 h-5" color="#FFFFFF" />,
      bgColor: "bg-green-500",
      action:()=>setShowAddBalance(true)
    },
    {
      title: "Balance",
      icon: <MinusCircle className="w-5 h-5" color="#FFFFFF" />,
      bgColor: "bg-red-500",
      action:()=>setShowRemoveBalance(true)
    },
    {
      title: "Logins",
      icon: <List className="w-5 h-5" color="#FFFFFF" />,
      bgColor: "bg-blue-500",
      action:()=>navigate("/admin/"+data.user?.id)
    },
    {
      title: "Notifications",
      icon: <Bell className="w-5 h-5" color="#FFFFFF" />,
      bgColor: "bg-gray-500",
      action:()=>navigate("/admin/detaill-user/notification/"+data.user?.id)
    },
    {
      title: "Ban User",
      icon: <Ban className="w-5 h-5" color="#FFFFFF" />,
      bgColor: "bg-orange-500",
    },
  ];
  async function handleBalanceAdd(param){
     const dataForm={...param,id:data.user.id}
       const response= await addBalnaceUser(dataForm,setSucess,setError)
       console.log(dataForm)
       return response

        
  }
  async function handleBalanceRemove(){
        alert(data.user)
  }
  async function handleUpdate(dataUser){
    setLoading(true)
    console.log(dataUser)
    await updateUser(dataUser,data.user.id,setSucess,setError)
      const response = await getUserById(id, setError);
      setData(response);
      setLoading(false)
  }
  return (
    <>
      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userStats.map((item, index) => (
          <Card
            key={index}
            title={item.title}
            value={item.value}
            bgColor={item.bgColor}
            icon={item.icon}
            borderColor={item.borderColor}
            link={item.link}
          />
        ))}
      </div>
      {/* Product & Order Stats */}
      <div className="mt-10">
        <h1 className="text-gray-600 text-xl mb-2 font-medium">
          Products & Orders
        </h1>
        <div className="w-full bg-white grid grid-cols-2 gap-4">
          {productStats.map((item, index) => (
            <CardDeposit
              key={index}
              title={item.title}
              value={item.value}
              icon={item.icon}
              bgColor={item.bgColor}
              link={item.link}
            />
          ))}
        </div>
      </div>
      {/* User Actions */}
      <div className="flex  gap-3 mt-10 justify-between">
        {userActions.map((item, index) => (
          <CardNormal
            key={index}
            title={item.title}
            bgCard={item.bgColor}
            icon={item.icon}
            handlClick={item.action}
            />
        ))}
      </div>
      {/* Error Notification */}
      <NotifyError
        message={error}
        onClose={() => setError(null)}
        isVisible={!!error}
      />
      <UserEdit user={data?.user} onSubmit={handleUpdate} loading={loading} />
    {ShowAddBalance && <BalanceModal  onClose={()=>setShowAddBalance(false)} onAction={handleBalanceAdd} title="Add Balance"/>}
    {ShowRemoveBalance && <BalanceModal  onClose={()=>setShowRemoveBalance(false)} onSubmit={handleBalanceRemove} title="Subtract Balance"/>}
    {sucess.show  && <NotifySuccess message={sucess.message} sucess={sucess.show} onClose={setSucess} /> }
    
 </>
  );
}
