import { Search } from 'lucide-react'
import React from 'react'

export default function InputSearch() {
  return (
     <div className="relative  bg-black ">
    <input
      type="text"
    //   value={inputSerch}
    //   onChange={(e)=>setInputSearch(e.target.value)}
    //   placeholder={placeholder}
      className="w-full border border-gray-300 h-10 rounded-lg py-2.5 pl-10 pr-3 
      text-sm text-gray-700 placeholder-gray-400 focus:outline-none 
      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <div className='bg-blue-800 h-full w-10 absolute right-0 top-0 rounded-r-lg flex items-center justify-center'>
    <Search className="absolute cursor-pointer right-3 top-2.5 text-white  text-xl   h-5 w-5" />
    </div>
  </div>
  )
}
