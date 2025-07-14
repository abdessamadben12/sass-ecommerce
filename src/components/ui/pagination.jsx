import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

export default function Pagination({currentPage,totalPages,setCurrentPage,perPage,setPerPage}) {
  return (
    <> 
  <div className="flex justify-end  gap-4 absolute mt-4 right-0 w-full">
    <div>
    <span className='text-md text-gray-400 mx-2'> select user per page</span>
    <select className='p-2 rounded-md' onChange={(e)=>setPerPage(e.target.value)} value={perPage}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </select>
   </div>
    <nav className="inline-flex  shadow-sm rounded-md border border-gray-200 bg-white overflow-hidden">
    {/* Previous */}
    <button
      onClick={() => setCurrentPage(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-2 text-sm font-medium ${
        currentPage === 1
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ChevronLeft size={18} />
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
          currentPage === i + 1
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {i + 1}
      </button>
    ))}
    {/* Next */}
    <button
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-2 text-sm font-medium border-l border-gray-200 ${
        currentPage === totalPages
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ChevronRight size={18} />
        </button>
        </nav>
        </div>
    </>
    
  )
}
