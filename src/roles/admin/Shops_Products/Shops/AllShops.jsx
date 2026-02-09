import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../../components/ui/DynamicTable'
import { getShops, exportShopsCsv } from '../../../../services/ServicesAdmin/ShopProductsServices';
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
        <span className="text-green-700 bg-green-100 px-2 py-1 font-semibold rounded-full">Active</span>
      ) : shop.status === "inactive" ? (
        <span className="text-slate-700 bg-slate-100 px-2 py-1 font-semibold rounded-full">Inactive</span>
      ) : shop.status === "pending" ? (
        <span className="text-yellow-700 bg-yellow-100 px-2 py-1 font-semibold rounded-full">Pending</span>
      ) : (
        <span className="text-red-700 bg-red-100 px-2 py-1 font-semibold rounded-full">Suspended</span>
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
    const [status,setStatus]=useState("all")
    const [name,setName]=useState("")
    const [sortBy,setSortBy]=useState("created_at")
    const [sortDir,setSortDir]=useState("desc")
    const [dateFrom,setDateFrom]=useState("")
    const [dateTo,setDateTo]=useState("")
    useEffect(()=>{
        const fetchData=async()=>{
            setLoading(true)
            const Shops=await getShops({
              page,
              per_page: perPage,
              name,
              status: status === "all" ? null : status,
              sort_by: sortBy,
              sort_dir: sortDir,
              date_from: dateFrom || null,
              date_to: dateTo || null,
            }, setError)
            setShops(Shops?.data || [])
            setTotalPage(Shops?.last_page || 1)
            setLoading(false)
        }
        fetchData()
    },[perPage,page,status,name,sortBy,sortDir,dateFrom,dateTo])
   
  return (
  <>
   <div>
        <h1 className='font-bold text-black text-2xl capitalize'>shops</h1>
        <HeaderTable menu={<Menustatus handleStatus={setStatus} status={status}/>} inputSerch={name} setInputSearch={setName}/>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Sort by</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={sortBy}
              onChange={(e)=>setSortBy(e.target.value)}
            >
              <option value="created_at">Newest</option>
              <option value="total_sales">Total sales</option>
              <option value="total_revenue">Total revenue</option>
              <option value="average_rating">Rating</option>
              <option value="total_products">Products</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Order</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={sortDir}
              onChange={(e)=>setSortDir(e.target.value)}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e)=>setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e)=>setDateTo(e.target.value)}
            />
          </div>
          <button
            onClick={async()=>{
              const blob = await exportShopsCsv({
                name,
                status: status === "all" ? null : status,
                sort_by: sortBy,
                sort_dir: sortDir,
                date_from: dateFrom || null,
                date_to: dateTo || null,
              })
              const url = window.URL.createObjectURL(new Blob([blob]))
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', 'shops.csv')
              document.body.appendChild(link)
              link.click()
              link.remove()
              window.URL.revokeObjectURL(url)
            }}
            className="px-4 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>
    </div>
   { loading ? <Loading/>:<div className='min-h-screen'>
        <DynamicTable
    data={shops}
    columns={shopColumns}
    actions={{
      viewPath: "/admin/shops-details",
    }}
  />
  {!shops?.length ? (
    <div className="text-center text-gray-500 py-10">No shops found</div>
  ) : null}
<Pagination currentPage={page} totalPages={totalPaga} setCurrentPage={setPage} perPage={perPage} setPerPage={setPerPage}/>
</div>}
<NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>

  </>
  )
}
const Menustatus=({handleStatus,status})=>{
    return  <div className="flex gap-6 text-md font-semibold text-gray-500 ">
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 text-nowrap ${status == "all" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus("all")}>All status</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "active" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('active')}>active</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "inactive" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('inactive')}>inactive</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "pending" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('pending')}>pending</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "suspended" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('suspended')}>suspended</button>
  </div>
        
}
