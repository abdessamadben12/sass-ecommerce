import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../../components/ui/DynamicTable'
import { getProducts, getShops } from '../../../../services/ServicesAdmin/ShopProductsServices';
import Pagination from '../../../../components/ui/pagination';
import Loading from '../../../../components/ui/loading';
import HeaderTable from '../../../../components/ui/HeaderTable';
import NotifyError from '../../../../components/ui/NotifyError';
const ProductsColumns = [
  { key: "name", label: "Product Name" },
  {
    key: "shop",
    label: "Shop Name",
    render: (product) => product.shop_name ?? "--",
  },
  { key: "order_count", label: "Order_count" ,render:(product)=>product?.order_count ?? "--"},
  { key: "prix", label: "prix" ,render:(product)=>product?.prix ?? "--"},
  {
    key: "status",
    label: "Status",
    render: (product) => {
  const status = statusMap[product.status] || {
    label: product.status,
    className: "text-gray-700 bg-gray-100"
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
      {status.label}
    </span>
  );
}
  },
  {
    key:"created_at",
    label:"created at",
    render:(product)=>product?.created_at ?? "--"
  }
];
const statusMap = {
  active: {
    label: "Active",
    className: "text-green-700 bg-green-100"
  },
  suspended: {
    label: "Suspended",
    className: "text-red-700 bg-red-100"
  },
  pending: {
    label: "Pending",
    className: "text-yellow-700 bg-yellow-100"
  },
  draft: {
    label: "Draft",
    className: "text-gray-700 bg-gray-100"
  },
  rejected: {
    label: "Rejected",
    className: "text-red-800 bg-red-200"
  }
};
export default function AllProduct() {
    const [products,setProduct]=useState([])
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
            const data=await getProducts(name,status,page,perPage,setError)
            setProduct(data.data)
            setTotalPage(data.last_page)
            setLoading(false)
        }
        fetchData()
    },[perPage,page,totalPaga,status,name])
  return (
  <>
   <div>
        <h1 className='font-bold text-black text-2xl capitalize'>shops</h1>
        <HeaderTable placeholder='Search by name/category/shop Name' menu={<Menustatus handleStatus={setStatus} status={status}/>} inputSerch={name} setInputSearch={setName}/>
    </div>
   { loading ? <Loading/>:<div className='min-h-screen'>
      <DynamicTable
  data={products}
  columns={ProductsColumns}
  actions={{
    viewPath: "/admin/product-detaill",
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
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "pending" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('pending')}>pending</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "approved" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('approved')}>approved</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "draft" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('draft')}>draft</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "rejected" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('rejected')}>rejected</button>
    <button className={`hover:text-blue-600 transition hover:border-b-2 hover:border-gray-800 ${status == "suspended" && "text-blue-600 border-gray-800 border-b-2"}`} onClick={()=>handleStatus('suspended')}>suspended</button>
  </div>
        
}