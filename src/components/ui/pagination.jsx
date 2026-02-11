import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

export default function Pagination({currentPage, totalPages, setCurrentPage, perPage, setPerPage}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      {/* Sélecteur par page */}
      <div className="flex items-center gap-3">
        <span className='text-sm font-medium text-slate-400 italic'>Afficher</span>
        <select 
          className='bg-white border border-slate-200 text-slate-600 text-sm rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-blue-100 transition-all'
          onChange={(e) => setPerPage(e.target.value)} 
          value={perPage}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
        <span className='text-sm font-medium text-slate-400 italic'>par page</span>
      </div>

      {/* Navigation des pages */}
      <nav className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center px-2">
          {Array.from({ length: totalPages }, (_, i) => {
            // Logique pour ne pas afficher trop de pages si totalPages est grand
            if (totalPages > 5 && Math.abs(currentPage - (i + 1)) > 2) return null;
            
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 ${
                  currentPage === i + 1
                    ? 'bg-[#008ECC] text-white shadow-md shadow-blue-100'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  )
}