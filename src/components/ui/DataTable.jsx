import {   Eye, Trash2 } from 'lucide-react';
import  { useState } from 'react';
import CardConfirmation from './CardConfirmation';
import { useNavigate } from 'react-router-dom';
export default function DataTable({ data, columns,handleDelete,role,UrlActionDetaill }) {
  const [showAlert, setShowAlert] = useState(false);
  const [actionOpenID,setActionOpenID] = useState(null);
  const navigate=useNavigate()
  const renderCell = (item, col) => {
  const key = col?.toLowerCase().replace(/\s+/g, '_');
    // Colonne "Action"
    if (key === "action" || key === "actions") {
      return (
        <div className="flex justify-center  items-center space-x-4 relative">
          <button className="text-[#008ECC] hover:text-[#005f73] hover:scale-110 " onClick={()=>navigate(`${UrlActionDetaill}/${item.id}`)}>
            <Eye size={30}/>
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAlert(true)
              setActionOpenID(item.id);
            }}
          >
           <Trash2 size={30} className=" text-red-600 hover:text-red-800 hover:scale-110" />
          </button> */}
        </div>
      );
    }
    if (key === "store_name" && role === "seller") {
      return item.shops?.length ? (
        item.shops.map((shop, idx) => (
          <div key={idx} className="bg-gray-200 text-sm px-2 py-1 rounded-full mb-1 ">
            {shop.name}
          </div>
        ))
      ) : (
        <span className="text-gray-500">No Store</span>
      );
    }
    // Balance / Last Login formatting
    if (key === "balance_amount") return item.balance.balance+" $" ?? 0;
    if(key==="role") return item.role
    if(key=="total_sales" )return item.orders_sum_total_price!==null ?item.orders_sum_total_price+"$":"0$"
    if (key === "last_login_at") return item.last_login_at ?? "Not logged in";

    return item[key] ?? "--";
  };
  return (
   <div >
     <div className="overflow-x-auto w-full rounded-lg">
      <table className="w-full min-w-full table-auto">
        <thead className="bg-[#008ECC] text-white">
          <tr className="text-md font-semibold text-left">
            {columns.map((col, index) => (
              <th key={index} className="	px-6 py-3 uppercase whitespace-nowrap text-center">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-center">
                  {renderCell(item, col)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && <tr  className='text-center text-gray-500 font-medium text-md'><td   colSpan={columns.length}>USER NOT FOUND</td></tr>}
        </tbody>
      </table>
    </div>
    {showAlert && <CardConfirmation id={actionOpenID} nameButton={"Delete"} 
     title={"Are you sure you want to delete this user?" } 
    message="This action is irreversible and will permanently remove all related data.
Please confirm to proceed." isVisible={setShowAlert}
       confirmed={()=>handleDelete(actionOpenID)} />}
   </div>
  );
}
