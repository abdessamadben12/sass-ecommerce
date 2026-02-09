import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../components/ui/DynamicTable';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import NotifyError from '../../../components/ui/NotifyError';
import Pagination from '../../../components/ui/pagination';
import Loading from '../../../components/ui/loading';
import { SearchIcon } from 'lucide-react';
import { getTransaction } from '../../../services/ServicesAdmin/TransactionService';

const OrdersColumns = [
  {
    key:"Trx",
    label:"Trx",
    render:order=>order.id
  },
    {
      key: "user.name",
      label: "User Name",
      render: (order) => order.user?.name ?? "--",
    },
  {
    key: " Amount	",
    label: "amount",
    render: (transaction) => `${transaction.total_price	}` ?? "--",
  },
  {
    key: "Remarks",
    label: "Remarks",
    render: (transaction) => transaction.remarks ?? "--",
  },
  {
    key:"type",
    label:"Type",
    render: (transaction) => transaction.type ?? "--",
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
const statusMap = [
    "Pending",
    "Success",
    "Failed"
]

export function AllTransaction() {
    const [inputSerch, setInputSearch] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [dataOrders, setDataOrders] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [statistics, setStatistics] = useState({})
    const [showCalendar, setShowCalendar] = useState(false);

    const handleRange = (start, end) => {
        // form de date comme "2023-10-01"
        const formattedStart = start.toISOString().split('T')[0];
        const formattedEnd = end.toISOString().split('T')[0];
        setSelectedPeriod({start: formattedStart, end: formattedEnd});
    };
    const handleSearch = async () => {
        // Call the DepositService with the search input and selected period
        try {
            setLoading(true);
            const data = await getTransaction(inputSerch, status, selectedPeriod?.start, selectedPeriod?.end, currentPage, perPage, setError);
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
        handleSearch();
    }, [currentPage, perPage, status]);

    return (
        loading ? <Loading/> : <div className='min-h-screen p-6'>
            <h1 className='text-2xl font-semibold text-gray-700'>All Transaction</h1>
            <p className='text-gray-500 text-sm'>Manage all requests from users.</p>
            {/* statistique de orders */}



            {/* header de filtrage */}
            <div className='flex items-center justify-between mt-4 mb-4 p-6 relative bg-white shadow-sm  '>
                {/* select status */}
                <div className='flex items-center gap-4 '>
                    <select name="status" onChange={(e) => setStatus(e.target.value)} value={status}
                            className="border border-gray-50 rounded-md p-2">
                        <option value="null">Select Status</option>
                        {statusMap.map((status, index) => (
                            <option key={index} value={status.toLowerCase()}>{status}</option>
                        ))}
                    </select>
                    <input type='text' onChange={(e) => setInputSearch(e.target.value)}
                           className="border border-gray-300 rounded-md p-2 outline-none "
                           placeholder="Search by transaction ID"/>
                    <DateRangePicker strokePeriods={handleRange} searchCallback={handleSearch} NotIcon={true}/>
                    <button className="bg-blue-600 text-white font-semibold  rounded-md px-6 py-2
                flex justify-center items-center gap-4">
                        <SearchIcon onClick={handleSearch} className="w-5 h-5 ml-2 inline-block font-bold text-x"/>
                        <span>Filter</span>
                    </button>
                </div>
            </div>
            <DynamicTable
                data={dataOrders}
                columns={OrdersColumns}
                actions={{
                    viewPath: "/admin/detaill-order",
                }}
            />
            <NotifyError message={error} onClose={() => setError(null)} isVisible={error !== null && true}/>
            <div className='translate-y-4'><Pagination currentPage={currentPage} totalPages={totalPages}
                                                       setCurrentPage={setCurrentPage} perPage={perPage}
                                                       setPerPage={setPerPage}/></div>
        </div>

    )
}
