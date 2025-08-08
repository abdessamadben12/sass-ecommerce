import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { getOrderDetails } from '../../../services/ServicesAdmin/ordersServices';
import Loading from '../../../components/ui/loading';

export default function DetaillOrder() {
    const { id } = useParams();
    const [order, setOrder] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    useEffect(()=>{
        const fetchData= async () => {
            setLoading(true);
            const response= await getOrderDetails(id, setError)
            setOrder(response);
            setLoading(false);
        }
        fetchData();
    }, [id]);
if(loading)return <Loading/>
  return (
    <div>
       <h1>Order Details for Order ID: {id}</h1>
       <div>
        {/* Order information */}
        {/* all item */}
      
        <div className='grid grid-cols-2 gap-4'>
            <div className=' bg-white shadow-md rounded-md p-4 overflow-auto '>
                  <div className='bg-gray-100 p-4 rounded-md mb-4 flex items-center justify-between text-black font-semibold'>
            <h1>All Items</h1>
            <span>sorts</span>
            </div>
                {order?.order_items?.map(item => (
                <div key={item.id} className='border-b py-2 flex items-center justify-between hover:bg-gray-50 p-2 hover:rounded-md'>
                    <img  src={item.product.image} alt={item.product.name} />
                    <div className='flex flex-col items-center'>
                        <span className='font-semibold text-md text-[#708090]'>Product name</span>
                        <span className='text-black font-semibold text-sm'>{item.product.name}</span>
                    </div>
                     <div className='flex flex-col items-center'>
                        <span className='font-bold text-[#708090]'>Price</span>
                        <span className='font-semibold text-black'>{item.product.price} $</span>
                    </div>
                    <span className='p-2 font-bold text-blue-600'><a href={`/product/${item.product.id}`}>View</a></span>
                    </div>
            ))}  
            </div>
       <div>
        <div className='bg-white shadow-md rounded-md p-4'>
            <h1 className='font-semibold text-lg text-black'>Summary</h1>
            <div className='flex flex-col gap-2 mt-4'>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Order ID:</span>
                    <span className='font-bold text-black bg-gray-200 p-2 rounded-full'>{order.id}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Product Count </span>
                    <span className='font-bold text-black bg-gray-200 p-2 rounded-full'>{order.order_items.length}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Date</span>
                    <span className='font-bold text-black bg-gray-200 p-2 rounded-full'>{order.created_at.split("T")[0]}</span>
                </div>
                 <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Total</span>
                    <span className='text-red-600 font-md bg-red-200 p-2 rounded-full'>{order.total} $</span>
                </div>
            </div>
        </div>
       </div>
        </div>
       </div>
    </div>
  )
}
