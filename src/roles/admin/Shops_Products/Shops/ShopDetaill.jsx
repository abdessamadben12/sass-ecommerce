import React, { useEffect, useState } from 'react';
import { Star, Package, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getShop, putStatusShop } from '../../../../services/ServicesAdmin/ShopProductsServices';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';
import NotifyError from '../../../../components/ui/NotifyError';
import Loading from '../../../../components/ui/loading';


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
          Archivé
        </span>
      );

    case "approved":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Approuvé
        </span>
      );

    case "rejected":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Rejeté
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
  // Données d'exemple si aucune donnée n'est fournie

  const navigate=useNavigate()

  const [shop,setShop]=useState()
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState({etats:false,message:''})
  const [success,setSuccess]=useState({etats:false,message:''})
  const {id}=useParams()


  useEffect(()=>{
    const fetchShop=async()=>{
      setLoading(true)
      const data=await getShop(id,setError)
      setShop(data)
      setLoading(false)
    }
    fetchShop()
  },[])
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
    }).format(amount);
  };

  // Fonction pour formater les nombres
  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
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

  // Fonction pour générer les étoiles de notation
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
    <div className="w-full p-6 bg-white rounded-lg ">
      {/* Header avec logo et informations principales */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="flex-shrink-0">
          <img
            src={shop?.logo}
            alt={`Logo de ${shop?.shop_name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
              {shop?.shop_name}
            </h1>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {shop?.status === 'active' ? 'Actif' : 
               shop?.status === 'inactive' ? 'Inactif' : 
               shop?.status === 'pending' ? 'En attente' : shop?.status}
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm">
            <span className="font-medium">Slug:</span> {shop?.shop_slug}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(shop?.average_rating)}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {shop?.average_rating}
            </span>
            <span className="text-gray-500">
              ({formatNumber(shop?.total_sales)} Sales)
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">
          {shop?.description}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Products</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber(shop?.total_products)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-green-900">
                {formatNumber(shop?.total_sales)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(shop?.total_revenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Commission Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {shop?.commission_rate}%
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Informations temporelles
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Created At</p>
              <p className="text-gray-900">{formatDate(shop?.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Updated At</p>
              <p className="text-gray-900">{formatDate(shop?.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Identifiants techniques
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">ID Shop</p>
              <p className="text-gray-900 font-mono">{shop?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ID Utilisateur</p>
              <p className="text-gray-900 font-mono">{shop?.user_id}</p>
            </div>
          </div>
        </div>
      </div>
      {/* information user */}
    <div className='flex flex-row-reverse justify-between items-center mt-6'>
      <div className='bg-gray-50 p-6 rounded-lg'>
        <div className='flex gap-2 flex-col  w-full' >
          <h1 className='text-lg font-semibold text-gray-900 mb-4'>Action Status</h1>
          <button 
          onClick={async()=>{
            putStatusShop(shop?.id,'active',setSuccess,setError)
            const data=await getShop(id,setError)
            setShop(data)
          }}
          className='text-blue-500 border border-blue-500  hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md'>Active</button>
          <button
          onClick={async()=>{
            putStatusShop(shop?.id,'inactive',setSuccess,setError)
            const data=await getShop(id,setError)
            setShop(data)
          }}
          className='text-red-500 border border-red-500  hover:bg-red-500 hover:text-white px-4 py-2 rounded-md'>Inactive</button>
          <button
          onClick={async()=>{
            putStatusShop(shop?.id,'suspended',setSuccess,setError)
            const data=await getShop(id,setError)
            setShop(data)
          }}
          className='text-yellow-500 border border-yellow-500  hover:bg-yellow-500 hover:text-white px-4 py-2 rounded-md'>Suspended</button>
    
        </div>
      </div>
    <div className=" mt-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1  gap-6 '>
        <div className='flex items-center gap-2'><label className='text-sm font-medium text-gray-600' htmlFor="">Name</label><span>{shop?.user?.name}</span></div>
        <div className='flex items-center gap-2'><label className='text-sm font-medium text-gray-600' htmlFor="">Email</label><span>{shop?.user?.email}</span></div>
        <div className='flex items-center gap-2'><label className='text-sm font-medium text-gray-600' htmlFor="">Date de création</label><span>{shop?.user?.created_at}</span></div>
        <div className='flex items-center gap-2'><label className='text-sm font-medium text-gray-600' htmlFor="">last update</label><span>{shop?.user?.updated_at}</span></div>
    
        </div>
      </div>
    </div>
     <div className='mt-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>Products</h2>
     <table className='mt-6 w-full'>
      <thead>
        <tr className='bg-gray-100'>
          <th className='py-4 px-6'>ID</th>
          <th className='py-4 px-6'>Title</th>
          <th className='py-4 px-6'>Base Price</th>
          <th className='py-4 px-6'>Size</th>
          <th className='py-4 px-6'>Status</th>
          <th className='py-4 px-6'>Action</th>
        </tr>
      </thead>
      <tbody>
     {shop?.products?.map((product)=>(
      <tr className='border-b border-gray-200' key={product.id}>
        <td className='py-4 px-6'>{product.id}</td>
        <td className='py-4 px-6'>{product.title}</td>
        <td className='py-4 px-6'>{product.base_price}</td>
        <td className='py-4 px-6'>{product.main_file_size}</td>
          <td className='py-4 px-6'>{getStatus(product.status)}</td>
          <td className='py-4 px-6'>
            <button 
            onClick={()=>{
              navigate(`/admin/products/show/${product.id}`)
            }}
            className=' text-white px-4 py-2 rounded-md'>
              <Eye className=' text-blue-500'  size={20}/>
            </button>
          </td>
        </tr>
     ))}
      </tbody>
     </table>
     </div>
     {/* orders */}
     <div className='mt-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>Orders</h2>
      <table className='mt-6 w-full'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='py-4 px-6'>ID</th>
            <th className='py-4 px-6'>User</th>
            <th className='py-4 px-6'>Products</th>
            <th className='py-4 px-6'>Status</th>
            <th className='py-4 px-6'>Total</th>
            <th className='py-4 px-6'>Date</th>
            <th className='py-4 px-6'>Action</th>
          </tr>
        </thead>
        <tbody> 
          {shop?.orders?.length > 0 ? shop?.orders?.map((order)=>(
            <tr className='border-b border-gray-200' key={order.id}>
              <td className='py-4 px-6'>{order.id}</td>
              <td className='py-4 px-6'>{order.user.name}</td>
              <td className='py-4 px-6'>{order.user.products.length}</td>
              <td className='py-4 px-6'>{order.status}</td>
              <td className='py-4 px-6'>{order.total}</td>
              <td className='py-4 px-6'>{formatDate(order.created_at)}</td>
              <td className='py-4 px-6'>
                <button 
                onClick={()=>{
                  navigate(`/admin/detaill-order/${order.id}`)
                }}
                className='text-white px-4 py-2 rounded-md'>
                  <Eye className=' text-blue-500'  size={20}/>
                </button>
              </td>
            </tr>
          )) : <tr>
            <td colSpan={7} className='py-4 px-6 text-center'>No orders found</td>
          </tr>}
        </tbody>
      </table>
     </div>
     {/* success & error */}
     {success?.etats && <NotifySuccess message={success.message} sucess={success.etats}  onClose={()=>setSuccess(null)}/>}
     {error?.etats && <NotifyError message={error.message} title={"Error"}  isVisible={error.etats} onClose={()=>setError(null)}/>}
      </div>
  );
};

export default ShopDetail;