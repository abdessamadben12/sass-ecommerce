import React, { useEffect, useState } from 'react';
import { Star, Package, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getShop, getShopOrders, getShopProducts, getShopStats, putStatusShop, exportShopProductsCsv, exportShopOrdersCsv } from '../../../../services/ServicesAdmin/ShopProductsServices';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';
import NotifyError from '../../../../components/ui/NotifyError';
import Loading from '../../../../components/ui/loading';
import Pagination from '../../../../components/ui/pagination';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


function getStatus(status) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Actif
        </span>
      );

    case "inactive":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Inactif
        </span>
      );

    case "pending":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          En attente
        </span>
      );

    case "draft":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          Brouillon
        </span>
      );

    case "archived":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          Archive
        </span>
      );

    case "approved":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Approuve
        </span>
      );

    case "rejected":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Rejete
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          Inconnu
        </span>
      );
  }
}

const ShopDetail = () => {
  const navigate=useNavigate()

  const [shop,setShop]=useState()
  const [stats,setStats]=useState(null)
  const [activeTab,setActiveTab]=useState('overview')
  const [products,setProducts]=useState([])
  const [orders,setOrders]=useState([])
  const [productsPage,setProductsPage]=useState(1)
  const [ordersPage,setOrdersPage]=useState(1)
  const [productsPerPage,setProductsPerPage]=useState(10)
  const [ordersPerPage,setOrdersPerPage]=useState(10)
  const [productsTotal,setProductsTotal]=useState(1)
  const [ordersTotal,setOrdersTotal]=useState(1)
  const [productStatus,setProductStatus]=useState('all')
  const [productSearch,setProductSearch]=useState('')
  const [productSort,setProductSort]=useState('created_at')
  const [productSortDir,setProductSortDir]=useState('desc')
  const [orderStatus,setOrderStatus]=useState('all')
  const [dateFrom,setDateFrom]=useState('')
  const [dateTo,setDateTo]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState({etats:false,message:''})
  const [success,setSuccess]=useState({etats:false,message:''})
  const {id}=useParams()


  useEffect(()=>{
    const fetchShop=async()=>{
      setLoading(true)
      const data=await getShop(id,setError)
      setShop(data)
      const statsData = await getShopStats(id, { date_from: dateFrom || null, date_to: dateTo || null }, setError)
      setStats(statsData)
      setLoading(false)
    }
    fetchShop()
  },[id,dateFrom,dateTo])

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getShopProducts(id, {
        page: productsPage,
        per_page: productsPerPage,
        status: productStatus,
        search: productSearch,
        sort_by: productSort,
        sort_dir: productSortDir,
      }, setError)
      setProducts(data?.data || [])
      setProductsTotal(data?.last_page || 1)
    }
    if (activeTab === 'products') {
      fetchProducts()
    }
  }, [activeTab, id, productsPage, productsPerPage, productStatus, productSearch, productSort, productSortDir])

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getShopOrders(id, {
        page: ordersPage,
        per_page: ordersPerPage,
        status: orderStatus,
        date_from: dateFrom || null,
        date_to: dateTo || null,
      }, setError)
      setOrders(data?.data || [])
      setOrdersTotal(data?.last_page || 1)
    }
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, id, ordersPage, ordersPerPage, orderStatus, dateFrom, dateTo])
  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // Fonction pour formater les nombres
  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number || 0);
  };

  // Fonction pour obtenir le style du statut
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircle
        };
      case 'inactive':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircle
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const statusStyle = getStatusStyle(shop?.status);
  const StatusIcon = statusStyle.icon;

  // Fonction pour generer les etoiles de notation
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-gray-300" />
        );
      }
    }
    return stars;
  };
if (loading) return <Loading/>
  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <img
              src={shop?.logo}
              alt={`Logo de ${shop?.shop_name}`}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{shop?.shop_name}</h1>
                <p className="text-slate-500 text-sm mt-1">
                  <span className="font-medium">Slug:</span> {shop?.shop_slug}
                </p>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {shop?.status === 'active' ? 'Actif' : 
                 shop?.status === 'inactive' ? 'Inactif' : 
                 shop?.status === 'pending' ? 'En attente' : shop?.status}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center">{renderStars(shop?.average_rating)}</div>
              <span className="text-sm font-semibold text-slate-900">{shop?.average_rating}</span>
              <span className="text-sm text-slate-500">({formatNumber(shop?.total_sales)} Sales)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async()=>{
                putStatusShop(shop?.id,'active',setSuccess,setError)
                const data=await getShop(id,setError)
                setShop(data)
              }}
              className="px-3 py-2 text-sm rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Active
            </button>
            <button
              onClick={async()=>{
                putStatusShop(shop?.id,'inactive',setSuccess,setError)
                const data=await getShop(id,setError)
                setShop(data)
              }}
              className="px-3 py-2 text-sm rounded-lg border border-slate-500 text-slate-700 hover:bg-slate-50"
            >
              Inactive
            </button>
            <button
              onClick={async()=>{
                putStatusShop(shop?.id,'suspended',setSuccess,setError)
                const data=await getShop(id,setError)
                setShop(data)
              }}
              className="px-3 py-2 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-2 flex gap-2">
        {['overview','products','orders'].map(tab => (
          <button
            key={tab}
            onClick={()=>setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === tab ? 'bg-[#008ECC] text-white' : 'text-slate-600 hover:bg-[#008ECC] hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'products' ? 'Products' : 'Orders'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
            <p className="text-slate-700 leading-relaxed">{shop?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Products</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(shop?.total_products)}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(shop?.total_sales)}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(shop?.total_revenue)}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Commission Rate</p>
              <p className="text-2xl font-bold text-slate-900">{shop?.commission_rate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Revenue (filtered by date)
              </h3>
              <div className="flex gap-3">
                <input
                  type="date"
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={dateFrom}
                  onChange={(e)=>setDateFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={dateTo}
                  onChange={(e)=>setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.daily || []}>
                  <defs>
                    <linearGradient id="shopRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#0f172a" fill="url(#shopRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Informations temporelles
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Created</span>
                  <span className="text-slate-900">{formatDate(shop?.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Updated</span>
                  <span className="text-slate-900">{formatDate(shop?.updated_at)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-3">User Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name</span>
                  <span className="text-slate-900">{shop?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email</span>
                  <span className="text-slate-900">{shop?.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">User ID</span>
                  <span className="text-slate-900 font-mono">{shop?.user_id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={(e)=>{setProductSearch(e.target.value); setProductsPage(1)}}
              className="border rounded-lg px-3 py-2 text-sm w-full md:w-60"
            />
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={productStatus}
              onChange={(e)=>{setProductStatus(e.target.value); setProductsPage(1)}}
            >
              <option value="all">All status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
              <option value="draft">Draft</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={productSort}
              onChange={(e)=>setProductSort(e.target.value)}
            >
              <option value="created_at">Newest</option>
              <option value="title">Title</option>
              <option value="base_price">Price</option>
              <option value="status">Status</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={productSortDir}
              onChange={(e)=>setProductSortDir(e.target.value)}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <button
              onClick={async()=>{
                const blob = await exportShopProductsCsv(id, {
                  status: productStatus,
                  search: productSearch,
                  sort_by: productSort,
                  sort_dir: productSortDir,
                })
                const url = window.URL.createObjectURL(new Blob([blob]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `shop_${id}_products.csv`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
              }}
              className="px-4 py-2 rounded bg-[#008ECC] text-white text-sm hover:bg-[#005f73]"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product)=>(
                  <tr key={product.id} className="border-b border-slate-200">
                    <td className="py-3 px-4">{product.id}</td>
                    <td className="py-3 px-4">{product.title}</td>
                    <td className="py-3 px-4">�{product.base_price}</td>
                    <td className="py-3 px-4">{getStatus(product.status)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={()=>navigate(`/admin/products/show/${product.id}`)}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!products?.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination currentPage={productsPage} totalPages={productsTotal} setCurrentPage={setProductsPage} perPage={productsPerPage} setPerPage={setProductsPerPage}/>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={orderStatus}
              onChange={(e)=>{setOrderStatus(e.target.value); setOrdersPage(1)}}
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e)=>setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e)=>setDateTo(e.target.value)}
            />
            <button
              onClick={async()=>{
                const blob = await exportShopOrdersCsv(id, {
                  status: orderStatus,
                  date_from: dateFrom || null,
                  date_to: dateTo || null,
                })
                const url = window.URL.createObjectURL(new Blob([blob]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `shop_${id}_orders.csv`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
              }}
              className="px-4 py-2 rounded bg-[#008ECC] text-white text-sm hover:bg-[#005f73]"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order)=>(
                  <tr key={order.id} className="border-b border-slate-200">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.user?.name}</td>
                    <td className="py-3 px-4">{order.order_items?.length || order.orderItems?.length || '-'}</td>
                    <td className="py-3 px-4">{order.status}</td>
                    <td className="py-3 px-4">�{order.total_amount ?? order.total}</td>
                    <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={()=>navigate(`/admin/detaill-order/${order.id}`)}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!orders?.length && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination currentPage={ordersPage} totalPages={ordersTotal} setCurrentPage={setOrdersPage} perPage={ordersPerPage} setPerPage={setOrdersPerPage}/>
          </div>
        </div>
      )}

      {success?.etats && <NotifySuccess message={success.message} sucess={success.etats}  onClose={()=>setSuccess(null)}/>}
      {error?.etats && <NotifyError message={error.message} title={"Error"}  isVisible={error.etats} onClose={()=>setError(null)}/>}
    </div>
  );
};

export default ShopDetail;
