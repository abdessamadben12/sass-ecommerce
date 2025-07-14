import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../../components/ui/DynamicTable'
import { getShops } from '../../../../services/ServicesAdmin/ShopProductsServices';
import Pagination from '../../../../components/ui/pagination';
import Loading from '../../../../components/ui/loading';
import HeaderTable from '../../../../components/ui/HeaderTable';
import NotifyError from '../../../../components/ui/NotifyError';
const shopColumns = [
  { key: "name", label: "Shop Name" },
  {
    key: "user.name",
    label: "Owner",
    render: (shop) => shop.user?.name ?? "--",
  },
  { key: "products_count", label: "Products" },
  {
    key: "status",
    label: "Status",
    render: (shop) =>
      shop.status === "active" ? (
        <span className="text-green-600 bg-green-100 px-2 py-1 font-semibold rounded-full ">Active</span>
      ) : (
        <span className="text-red-600 bg-red-100  font-semibold px-2 py-1 rounded-full">Suspended</span>
      ),
  },
];
export default function AllShop() {
    const [shops,setShops]=useState([])
    const [error,setError]=useState(null)
    const [page,setPage]=useState(1)
    const [perPage,setPerPage]=useState(10)
    const [totalPaga,setTotalPage]=useState(1)
    const [loading,setLoading]=useState(false)
    const [status,setStatus]=useState(null)
    const [name,setName]=useState(null)
    useEffect(()=>{
        const fetchData=async()=>{
            setLoading(true)
            const Shops=await getShops(name,status,page,perPage,setError)
            setShops(Shops.data)
            setTotalPage(Shops.last_page)
            setShops(Shops.data)
            setLoading(false)
        }
        fetchData()
    },[perPage,page,totalPaga,status,name])
   
    console.log(shops)
  return (
  <>
   <div>
        <h1 className='font-bold text-black text-2xl capitalize'>shops</h1>
        <HeaderTable menu={<Menustatus handleStatus={setStatus} status={status}/>} inputSerch={name} setInputSearch={setName}/>
    </div>
   { loading ? <Loading/>:<div className='min-h-screen'>
        <DynamicTable
    data={shops}
    columns={shopColumns}
    actions={{
      viewPath: "/admin/shops-details",
    }}
  />
<Pagination currentPage={page} totalPages={totalPaga} setCurrentPage={setPage} perPage={perPage} setPerPage={setPerPage}/>
</div>}
<NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>

  </>
  )
}
const Menustatus=({handleStatus,status})=>{
    return  <div className="flex gap-6 text-md font-semibold text-gray-500 ">
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 text-nowrap ${status == null && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus(null)}>All status</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "active" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('active')}>active</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "inactive" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('inactive')}>inactive</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "suspended" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('suspended')}>suspended</button>
  </div>
        
}