import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../components/ui/DynamicTable';
import InputSearch from '../../../components/ui/InputSearch';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import NotifyError from '../../../components/ui/NotifyError';
import Pagination from '../../../components/ui/pagination';
import Loading from '../../../components/ui/loading';
import { getWithdrawals } from '../../../services/ServicesAdmin/WithdrawalsServices';
import Card from '../../../components/ui/card';
import { CheckCircle, Clock, CreditCard, ShoppingCart } from 'lucide-react';
import { getOrders, StatisticsOrders } from '../../../services/ServicesAdmin/ordersServices';
const OrdersColumns = [
  {
    key:"order_id",
    label:"Order ID",
    render:order=>order.id
  },
  { key: "product", label: "Nbr Products " ,
    render:(order) => order.order_items_count
  },
    {
      key: "buyer.name",
      label: "Buyer",
      render: (order) => order.user?.name ?? "--",
    },
  {
    key: " total_price	",
    label: "Total Price",
    render: (order) => `${order.total_price	}` ?? "--",
  },
  {
    key: "status",
    label: "Status",
    render: (order) =>
      order.status === "completed" ? (
        <span className="text-green-600 bg-green-100 px-2 py-1 font-semibold rounded-full ">{order.status}</span>
      ) : order.status === "pending" ? (
        <span className="text-yellow-600 bg-yellow-100 px-2 py-1 font-semibold rounded-full ">{order.status}</span>
      ) : order.status === "canceled" ? (
        <span className="text-red-600 bg-red-100  font-semibold px-2 py-1 rounded-full">{order.status}</span>
      ) :order.status === "paid" ? (
        <span className="text-blue-600 bg-blue-100  font-semibold px-2 py-1 rounded-full">{order.status}</span>
      ) : order.status === "Shipped" ? (
        <span className="text-purple-600 bg-purple-100  font-semibold px-2 py-1 rounded-full">{order.status}</span>
      ) : (
        <span className="text-gray-600 bg-gray-100  font-semibold px-2 py-1 rounded-full">{order.status}</span>
      ),
  },
   {
    key: "created_at",
    label: "Date of Order",
    render: (order) => order.created_at.split("T")[0] ?? "--",
  },
];

export default function AllOrders() {
  const [inputSerch, setInputSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
   const[dataOrders ,setDataOrders]=useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [statistics, setStatistics] = useState({})
  const handleRange = (start, end) => {
    // form de date comme "2023-10-01"
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];
    setSelectedPeriod({ start: formattedStart, end: formattedEnd });
  };
  const handleSearch = async() => {
    // Call the DepositService with the search input and selected period
    try {
      setLoading(true);
      const data = await getOrders( inputSerch, status,selectedPeriod?.start, selectedPeriod?.end, currentPage, perPage, setError);
      setDataOrders(data.data);
      setTotalPages(data.last_page);
      setCurrentPage(data.current_page);
      setPerPage(data.per_page);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const statisticsData=await StatisticsOrders(setError);
      setStatistics(statisticsData);
      setLoading(false);
    }
    handleSearch();
    fetchData();
  }, [ currentPage, perPage,status]);
  return (

    loading ? <Loading/> : <div className='min-h-screen p-6'>
        <h1 className='text-2xl font-semibold text-gray-700'>All Orders</h1>
        <p className='text-gray-500 text-sm'>Manage all order requests from users.</p>
          {/* statistique de orders */}
          <div className=' flex justify-start items-center gap-6 my-6'>
            <Card title="Total Orders" value={statistics?.total_orders} 
             icon={<ShoppingCart/>}
              bgColor={"bg-blue-100 text-blue-600" } 
              borderColor={"border border-blue-200 "}/>
             <Card title="Total Revenue" value={statistics?.total_sales	} 
             icon={<CreditCard/>}
              bgColor={"bg-blue-100 text-blue-600" } 
              borderColor={"border border-blue-200 "}/>
              <Card title=" Confirmed Orders" value={statistics?.total_completed_orders} 
             icon={<CheckCircle/>}
             bgColor={"bg-green-100 text-green-600" } 
             borderColor={"border border-green-200"}
              />
              <Card title="Pending Orders" value={statistics?.total_pending_orders} 
             icon={<Clock/>}
              bgColor={"text-yellow-600 bg-yellow-100" } 
              borderColor={"border border-yellow-200"}/>
          </div>
               {/* ajouter un header de recherche avec date or trx */}
                <div className='w-full flex   items-center gap-4 mb-6'>
                  <div className='flex items-center gap-4 min-w-[300px]'>
                    <label className='text-gray-500 font-semibold text-nowrap  '>Filter by Status : </label>
                    <select name="status"  value={status}
                    className='bg-white border border-gray-300 text-gray-700 
                    rounded-md p-2 focus:outline-none focus:ring-2
                     focus:ring-blue-500 w-full' onChange={(e)=>setStatus(e.target.value)} >
                      <option value="null">All</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                    <DateRangePicker strokePeriods={handleRange}
                    period={selectedPeriod} 
                     searchCallback={handleSearch} />
                    <InputSearch placeholder="Username / Trx"  
                    inputSerch={inputSerch} 
                    setInputSearch={setInputSearch}
                     searchCallback={handleSearch} />     
                </div>
            <DynamicTable
              data={dataOrders}
              columns={OrdersColumns}
              actions={{
                viewPath: "/admin/detaill-order",
              }}
            />
          <NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>
          <div className='translate-y-4'> <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} perPage={perPage} setPerPage={setPerPage}/></div>
    </div>
  )
}


