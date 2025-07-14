
import  { useMemo, useEffect, useState } from 'react'
import DataTable from '../../../components/ui/DataTable'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getUnverifiedUsers } from '../../../services/ServicesAdmin/userServices';

export default function PendingUser() {
     const [ActiveUsers, setActiveUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage,setPerPage]=useState(5)
    const [totalPages, setTotalPages] = useState(1);
    const [role,setRole]=useState(null)
    const [loading,setLoading]=useState(false)
    const [inputSerch,setInputSearch]=useState(null)
    const [messaheError,setMessaheError]=useState(null);
    
    useEffect( () => {
        const fetchData = async () => {
            setLoading(true)
            const data=await getUnverifiedUsers(currentPage,perPage,role,inputSerch,setMessaheError)
            setActiveUsers(data.data.data)
            setTotalPages(data.data.last_page)
            setCurrentPage(data.data.current_page)
            console.log(data.data.last_page)
            setLoading(false)
         }
        fetchData()
    },[currentPage,perPage,role, inputSerch])
    console.log(ActiveUsers)
    function handleRole(role){
        setRole(role)
    }
   const columns = useMemo(() => {
  if (role === "admin" ) {
    return ["name", "email","balnced_amount", "last_login_at", "actions"];
  } else if (role === "seller") {
    return [ "name","store_name","balance_amount", "total_sales","last_login_at", "actions"];
  } else if (role === "buyer") {
    return [ "name", "email", "orders_count", "last_order_date", "balnced_amount", "actions"];
  } 
  else return ["name", "email","balnced_amount", "role", "last_login_at", "actions"];
}, [role])

    

    return (
    <div className='relative min-h-screen'>
    <div>
        <h1 className='font-bold text-black text-2xl capitalize'>user managment</h1>
     </div>
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full  py-6 rounded-xl  mt-7 mb-4 px-3  ">
  {/* Roles Filter */}
  <div className="flex gap-6 text-md font-semibold text-gray-500 ">
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 text-nowrap `} onClick={()=>handleRole(null)}>All User</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 `} onClick={()=>handleRole('admin')}>Admin</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 `} onClick={()=>handleRole('seller')}>seller</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 `} onClick={()=>handleRole('buyer')}>bayer</button>
  </div>
  {/* Search Input */}
  <div className="relative w-full md:w-[75%]">
    <input
      type="text"
      value={inputSerch}
      onBlur={(e)=>setInputSearch(e.target.value)}
      onChange={(e)=>setInputSearch(e.target.value)}
      placeholder="Search by name or email"
      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 
      text-sm text-gray-700 placeholder-gray-400 focus:outline-none 
      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <div className='bg-blue-800 h-full w-10 absolute right-0 top-0 rounded-r-lg flex items-center justify-center'>
    <Search className="absolute cursor-pointer right-3 top-2.5 text-white  text-xl   h-5 w-5" onClick={()=>setInputSearch(prev=>prev)}/>
    </div>
  </div>

</div>  
    {
        loading ? <div role="status" className='flex justify-center items-center'>
    <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span class="sr-only">Loading...</span>
</div>: <DataTable data={ActiveUsers} columns={columns} role={role}/>
    }  

<div className="flex justify-end  gap-4 absolute mt-4 bo w-full">
   <div className=''>
    <span className='text-md text-gray-400 mx-2'> select user per page</span>
    <select className='p-2 rounded-md' onChange={(e)=>setPerPage(e.target.value)} value={perPage}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </select>
   </div>
  <nav className="inline-flex  shadow-sm rounded-md border border-gray-200 bg-white overflow-hidden">
    {/* Previous */}
    <button
      onClick={() => setCurrentPage(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-2 text-sm font-medium ${
        currentPage === 1
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ChevronLeft size={18} />
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
          currentPage === i + 1
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Next */}
    <button
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
        currentPage === totalPages
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ChevronRight size={18} />
        </button>
        </nav>
        </div> 
    </div>
  )
  
}
