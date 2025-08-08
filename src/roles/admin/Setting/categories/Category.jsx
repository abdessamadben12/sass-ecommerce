import React, { useEffect, useState } from 'react';
import { Edit, Plus, Trash2, X, Eye, MoreVertical } from 'lucide-react';
import AddCategory from './AddCategory';
import { useNavigate } from 'react-router-dom';
import { allCategory, deleteCategory } from '../../../../services/ServicesAdmin/CategoryService';
import Pagination from '../../../../components/ui/pagination';
import Loading from '../../../../components/ui/loading';
import CardConfirmation from '../../../../components/ui/CardConfirmation';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';
import NotifyError from '../../../../components/ui/NotifyError';

// Mock AddCategory component (replace with your actual component)

export default function AllCategory() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [current,setcurrent]=useState(1)
  const [perPage,setPerPage]=useState(10)
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(false)
  const [sucess,setSucess]=useState(false)

  const navigate=useNavigate()
  useEffect(()=>{
    const fetchData=async()=>{
    setLoading(true)
     const res= await allCategory(current,perPage,setError)
      setTotal(res.last_page)
    setcurrent(res.current_page)
    setPerPage(res.per_page)
    setCategories(res.data)
    setLoading(false)
    
    } 
    fetchData()
  },[current,perPage])
 

  const handleDelete = (category) => {
    setSelectedCategory(category);
        setDeleteModal(true);
  };

  const confirmDelete = async() => {
    await deleteCategory(selectedCategory?.id,setError,setSucess)
    setDeleteModal(false);  
    setSelectedCategory(null);
     setTimeout(()=>{
      window.location.reload();
     },700)
  };
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };
 if(loading)return <Loading/>
  return (
    <div className="bg-white rounded-lg shadow-sm border relative">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Category Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your product categories ({categories?.length} total)
            </p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/admin/add-category')}    
          >
            <Plus className="h-4 w-4" />
            New Category
          </button>
        </div>
      </div>
     
      {/* Categories List */}
      <div className="p-6">
        {categories?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category</p>
            <button 
              onClick={() => navigate('/admin/add-category')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Category
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories?.map(category => (
              <div 
                key={category?.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                    <img 
                      src={category?.icon} 
                      className='w-15 h-15 rounded-full object-cover"' 
                      alt={category?.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-blue-100 items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {category?.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{category?.name}</h3>
                      {getStatusBadge(category?.is_active)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {category?.products_count} products
                      {category?.description && ` • ${category?.description}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => navigate(`/admin/edit-category/${category?.id}`)}
                    title="Edit category"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => handleDelete(category)}
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
   {deleteModal &&    <CardConfirmation nameButton={"Delete"} title={"Delete Category"} message={"Are you sure you want to delete the category " + selectedCategory?.name + "? This action cannot be undone."}
       isVisible={setDeleteModal} confirmed={confirmDelete}/>}
       {sucess?.etats && <NotifySuccess sucess={sucess.etats} message={sucess.message} onClose={() => setSucess(false)} />}   
     <NotifyError message={error.message} onClose={()=>setError(false)} isVisible={error.etats}  />
  
      <Pagination currentPage={current}  totalPages={total} perPage={perPage} setPerPage={setPerPage} setCurrentPage={setcurrent}/>
    </div>
  );
}