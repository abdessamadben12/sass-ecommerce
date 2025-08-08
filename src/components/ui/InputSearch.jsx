import { Search } from 'lucide-react'
import React from 'react'

export default function InputSearch({placeholder, inputSerch, setInputSearch,searchCallback}) {
  return (
     <div className="relative ">
    <input
      type="text"
      value={inputSerch}
      onChange={(e)=>setInputSearch(e.target.value)}
      placeholder={placeholder}
       className="w-full py-2.5 pl-4 pr-10 text-sm bg-white border text-gray-700 placeholder-gray-400 focus:outline-none rounded-l-lg"
          
    />
    <div className='bg-blue-800 h-full w-10 absolute right-0 top-0 rounded-r-lg flex items-center justify-center'>
    <Search onClick={searchCallback} className="absolute cursor-pointer right-3 top-2.5 text-white  text-xl   h-5 w-5" />
    </div>
  </div>
  )
}
