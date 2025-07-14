import React, { useState } from 'react';
import { Search, Calendar, Eye, SearchCheck, SearchIcon } from 'lucide-react';
import { list } from 'postcss';
import CalendarRange from './Calendar';

const ApprovedDeposits = () => {
  const [showList, setShowList] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const periodOptions = [
    {name:"Today",value:new Date().toLocaleDateString()},
    {name:"Yesterday",value:new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString()},
    {name:"Last 7 Days",value: new Date(new Date().setDate(new Date().getDate() - 6)).toLocaleDateString()},
    {name:"Last 15 Days",value: new Date(new Date().setDate(new Date().getDate() - 14)).toLocaleDateString()},
    {name:"Last 30 Days",value: new Date(new Date().setDate(new Date().getDate() - 29)).toLocaleDateString()},
    {name:"This Month",value: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString()}]
  function onchange({start, end}) {
    const startDate = start.toLocaleDateString();
    const endDate = end.toLocaleDateString();
    // function callaback pour envoyer date filter
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className='relative flex items-center justify-between mb-8'>
         <SearchIcon className='absolute right-0 p-2 cursor-pointer bg-blue-600 text-white rounded-r-md w-10 h-full'/>
        <input type="text" name="search" placeholder='start date-end date' value={selectedPeriod}  onClick={() =>setShowList(!showList)} className="w-full border border-gray-300 rounded-lg py-2.5 pl-4 pr-3 
      text-sm text-gray-700 placeholder-gray-400 focus:outline-none 
      focus:ring-2 focus"/>
      <div className="relative ">
      { showList && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-10">
          <ul className="max-h-64 overflow-auto py-2 text-sm">
            { periodOptions.map((option, index) => <li key={index} onClick={() => {
              setShowList(false);
              setSelectedPeriod(option.value)}} className="block w-full px-4 py-2 text-left hover:bg-indigo-600 hover:text-white cursor-pointer">{option.name}</li>)}
              <li onClick={() => setShowCalendar(true)} className="block w-full px-4 py-2 text-left hover:bg-indigo-600 hover:text-white cursor-pointer">select date</li>
             

          </ul>
        </div>
      )}
         {showCalendar && (
                <div className='absolute z-40  max-w-md mx-auto left-0 '><CalendarRange onApply={onchange}/></div>
                )}
              </div>

      </div>
    </div>
  );
};

export default ApprovedDeposits;