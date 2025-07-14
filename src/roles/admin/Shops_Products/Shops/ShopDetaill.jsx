import {  useEffect, useState } from 'react';
import {
  ArrowLeft, User, Store, Calendar, TrendingUp,
  CheckCircle, Clock,
} from 'lucide-react';
import { getShop } from '../../../../services/ServicesAdmin/ShopProductsServices';
import NotifyError from '../../../../components/ui/NotifyError';
import {  useParams } from 'react-router-dom';
import InfoCard from '../../../../components/ui/InfoCard';
import Card from '../../../../components/ui/card';

const ShopDetail = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,setError]=useState(null)
    const {id}=useParams()


  useEffect(() => {
    const fetchData = async () => {
        const data=await getShop(id,setError)
        setData(data)
        setLoading(false)
    
    }
    fetchData()
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6 text-red-500">No data found.</div>
  return (
    <>
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Shops Details</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
      {/* Seller & Shop Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seller Card */}
        <InfoCard
          icon={<User className="text-blue-600" size={24} />}
          title="Seller Information"
          rows={[
            { label: "Seller Name", value: data.user.name ,color: 'text-blue-500' },
            {label:"email",value:data?.user.email,badge:"blue",color:"text-blue-800"},
            {label:"phone",value:data?.user.phone,badge:"blue",color:"text-blue-800"},
            {label:"country",value:data?.user.country,badge:"blue",color:"text-blue-800"},
            {label:"city",value:data?.user.city,badge:"blue",color:"text-blue-800"},
            {label:"address",value:data?.user.address,badge:"blue",color:"text-blue-800"},
            { label: "Status", value: data?.user.status, badge: 'green', icon:data.user.status =="active" ? <CheckCircle size={14} /> : <Clock size={14} />  }

          ]}
        />
        {/* Shop Card */}
        <InfoCard
          icon={<Store className="text-purple-600" size={24} />}
          title="Shop Information"
          rows={[
            { label: "Shop Name", value: data?.name, color: 'text-purple-600' },
            { label: "Description", value: `${data?.description}`, color: 'text-blue-800' },
            { label: "Total  Product", value: `${data?.products_count}`, badge:"blue",color: 'text-green-600  ' },
            { label: "Product active", value: `${data?.products_active_count}`,badge:"blue", color: 'text-green-600' },
            { label: "Total orders ", value: `${data?.total_orders}` ,badge:"blue",color: 'text-green-600' },
            { label: "date created", value: `${data?.created_at} `,badge:"blue", color: 'text-green-600' },
            { label: "Total Profit", value: `${data?.profits_sum_total_amount} $`,badge:"green", color: 'text-green-600' },
            { label: "Shop Status", value: data?.status, badge: 'green', icon: 
                data.status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />
            },
          ]}
        />
      </div>
      {/* products shops  */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Products in this Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.products.map((product) => (
            <Card key={product.id} className="bg-white shadow-sm p-4 rounded-lg">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-600 mt-2">{product.description}</p>
              <span className="text-blue-600 font-bold mt-2">${product.price}</span>
            </Card>
          ))}
        </div>
      </div>
      
    </div>
    <NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>
    </>
  );
};


export default ShopDetail;
