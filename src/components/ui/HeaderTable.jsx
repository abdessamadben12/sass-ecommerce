import { Search } from 'lucide-react'
import React from 'react'

export default function HeaderTable({inputSerch,setInputSearch,menu,placeholder="Search by name or email"}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full  py-6 rounded-xl  mt-7 mb-4 px-3  ">
  {/* Roles Filter */}
 {menu}
  {/* Search Input */}
  <div className="relative w-full md:w-[75%]">
    <input
      type="text"
      value={inputSerch}
      onChange={(e)=>setInputSearch(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 
      text-sm text-gray-700 placeholder-gray-400 focus:outline-none 
      focus:ring-2 focus:ring-[#008ECC] focus:border-transparent"
    />
    <div className='bg-[#008ECC] h-full w-10 absolute right-0 top-0 rounded-r-lg flex items-center justify-center'>
    <Search className="absolute cursor-pointer right-3 top-2.5 text-white  text-xl   h-5 w-5" onClick={()=>setInputSearch(prev=>prev)}/>
    </div>
  </div>
</div>
  )
}
