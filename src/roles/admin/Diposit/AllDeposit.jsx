import React, { useState } from 'react'
import HeaderTable from '../../../components/ui/HeaderTable';
import DynamicTable from '../../../components/ui/DynamicTable';
import InputSearch from '../../../components/ui/InputSearch';
import DateRangePicker from '../../../components/ui/Calendries';
const DepositColumns = [
  { key: "gateway", label: "Gateway | Transaction" },
  {
    key: "user.gateway",
    label: "Initiated",
    render: (shop) => shop.created_at ?? "--",
  },
  {
    key:"user",
    label:"name",
    render:deposit=>deposit.user.name
  },
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
export default function AllDeposit() {
    const [dataDeposit,setDataDeposit]=useState([])
     const handleRange = ([start, end]) => {
    // Faites votre requête API, filtrage, etc.
    console.log("Nouveau range :", start, end);
  };
  return (
    <div>
        <h1 className='text-2xl font-semibold text-gray-700'>All Deposit</h1>
        <p className='text-gray-500 text-sm'>Manage all deposit requests from users.</p>
        {/* Add your deposit management components here */} 
        
                <div className='w-full flex items-center justify-end gap-2'>
                    <InputSearch />
                  <DateRangePicker  />
                </div>

            <DynamicTable
              data={dataDeposit}
              columns={DepositColumns}
              actions={{
                viewPath: "/admin/shops-details",
              }}
            />
    </div>
  )
}
