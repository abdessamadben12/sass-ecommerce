import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../components/ui/DynamicTable';
import InputSearch from '../../../components/ui/InputSearch';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import NotifyError from '../../../components/ui/NotifyError';
import Pagination from '../../../components/ui/pagination';
import Loading from '../../../components/ui/loading';
import { getWithdrawals } from '../../../services/ServicesAdmin/WithdrawalsServices';
const WithdrawalsColumns = [
  { key: "gateway", label: "Gateway | Transaction" ,
    render:(withdrawal) => `${withdrawal.transactions?.trx ?? "--"}`
  },
    {
    key:"user",
    label:"name",
    render:withdrawal=>withdrawal?.user?.name ?? "--"
  },
  {
    key: "trx",
    label: "Trx",
    render: (withdrawal) => `${withdrawal?.transactions?.trx ?? "--"}`,
  }, 
  {
    key: "created_at",
    label: "Initiated",
    render: (withdrawal) => withdrawal?.created_at?.split("T")[0] ?? "--",
  },

   {
    key:"Conversion",
    label:" Conversion",
    render: (withdrawal) => withdrawal.notes  ?? "--",
  },
  {
    key: "amount",
    label: "Amount",
    render: (withdrawal) => `${withdrawal.amount} $`,
  },

  {
    key: "status",
    label: "Status",
    render: (withdrawal) =>
      withdrawal.status === "approved" ? (
        <span className="text-green-600 bg-green-100 px-2 py-1 font-semibold rounded-full ">{withdrawal.status}</span>
      ) : withdrawal.status === "pending" ? (
        <span className="text-yellow-600 bg-yellow-100 px-2 py-1 font-semibold rounded-full ">{withdrawal.status}</span>
      ) : (
        <span className="text-red-600 bg-red-100  font-semibold px-2 py-1 rounded-full">{withdrawal.status}</span>
      ),
  },
];
export default function AllWithdrawals() {
  const [inputSerch, setInputSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [status, setStatus] = useState("all");
   const[dataWithdrawals ,setDataWithdrawals]=useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const statusParam = status === "all" ? null : status;
      const data = await getWithdrawals(statusParam, inputSerch, selectedPeriod?.start, selectedPeriod?.end, currentPage, perPage, setError);
      setDataWithdrawals(data.data);
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
  }, [ currentPage, perPage, status]);
  
  return (
    loading ? <Loading/> : <div className='min-h-screen p-6'>
        <h1 className='text-2xl font-semibold text-gray-700'>All Withdrawals</h1>
        <p className='text-gray-500 text-sm'>Manage all withdrawal requests from users.</p>
        {/* Add your deposit management components here */} 
               {/* ajouter un header de recherche avec date or trx */}
                <div className='w-full flex  items-center gap-4 mb-6'>
                    <DateRangePicker strokePeriods={handleRange}
                    period={selectedPeriod} 
                     searchCallback={handleSearch} />
                    <InputSearch placeholder="Username / Trx"  
                    inputSerch={inputSerch} 
                    setInputSearch={setInputSearch}
                     searchCallback={handleSearch} />     
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                </div>
            <DynamicTable
              data={dataWithdrawals}
              columns={WithdrawalsColumns}
              actions={{
                viewPath: "/admin/detaill-withdrawal",
              }}
            />
                    <NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>
                      <div className='translate-y-4'> <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} perPage={perPage} setPerPage={setPerPage}/></div>

    </div>
  )
}
