import  { useMemo, useEffect, useState } from 'react'
import DataTable from '../../../components/ui/DataTable'
import {  Search } from 'lucide-react';
import { deleteUsers, getUnverifiedUsers } from '../../../services/ServicesAdmin/userServices';
import NotifyError from '../../../components/ui/NotifyError';
import Pagination from '../../../components/ui/pagination';
import { NotifySuccess } from '../../../components/ui/NotifySucces';
import Loading from '../../../components/ui/loading';
import HeaderTable from '../../../components/ui/HeaderTable';

export default function PendingUser() {
    const [ActiveUsers, setActiveUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage,setPerPage]=useState(5)
    const [totalPages, setTotalPages] = useState(1);
    const [role,setRole]=useState(null)
    const [loading,setLoading]=useState(false)
    const [inputSerch,setInputSearch]=useState(null)
    const [messageError,setMessaheError]=useState(null);
    const [sucess,setSucess]=useState(false)
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
    function handleRole(role){
        setRole(role)
    }
      const handledelete=async(id) =>{
        await getUnverifiedUsers(currentPage,perPage,role,inputSerch,setMessaheError)
      return await deleteUsers(id,setMessaheError,setSucess)
    }
    console.log(sucess)
   const columns = useMemo(() => {
  if (role === "admin" ) {
    return ["name", "email","balnced_amount", ,"role", "last_login_at", "actions"];
  } else if (role === "seller") {
    return [ "name","store_name","balance_amount" ,"role", "total_sales","last_login_at", "actions"];
  } else if (role === "buyer") {
    return [ "name", "email", "orders_count", "last_order_date","role", "last_login_at", "balnced_amount", "actions"];
  } 
  else return ["name", "email","balnced_amount", "role", "last_login_at", "actions"];
}, [role])
    
    return (
    <div className='relative min-h-screen'>
    <div>
        <h1 className='font-bold text-black text-2xl capitalize'>user managment</h1>
        <HeaderTable menu={<Menu handleRole={handleRole} role={role} /> } setInputSearch={setInputSearch} inputSerch={inputSerch}/>
     </div>
    {
        loading ? <Loading/>: <DataTable data={ActiveUsers} columns={columns} role={role} handleDelete={handledelete} UrlActionDetaill={"/admin/detaill-user"}/>
    }  
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} perPage={perPage} setPerPage={setPerPage}/>
        <NotifyError message={messageError} onClose={()=>setMessaheError(null)}   isVisible={messageError !== null && true}/>
          {sucess && <NotifySuccess message="user deleted" sucess={sucess} onClose={setSucess } /> }
    </div>
  )
}
// filtrage par role
const Menu=({handleRole,role})=> <div className="flex gap-6 text-md font-semibold text-gray-500 ">
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 text-nowrap ${role == null && "text-blue-600 border-gray-800 border-b-2"} `} onClick={()=>handleRole(null)}>All User</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${role == "admin" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleRole('admin')}>Admin</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${role == "seller" && "text-blue-600 border-gray-800 border-b-2"}}`} onClick={()=>handleRole('seller')}>seller</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${role == "buyer" && "text-blue-600 border-gray-800 border-b-2"}}`} onClick={()=>handleRole('buyer')}>bayer</button>
  </div>
