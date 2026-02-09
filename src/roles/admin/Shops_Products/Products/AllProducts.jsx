import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Search, Plus, Filter, Eye, Edit, Check, X, 
  Star, TrendingUp, Package, Users, Tag, AlertTriangle,
  FileText, Image, Download, Upload, Settings, BarChart3,
  Settings2,
  Save,
  Edit2,
  ChevronDown,
  ChevronUp,
  File,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck,
  CircleCheck,
  
} from 'lucide-react';
import Loading from '../../../../components/ui/loading';
import { deleteFileFormat, deleteLicense, deleteProductSettings, getFileFormats, getLicenses, getPendingProducts, getProducts, getProductSettings, postFileFormat, postLicense, postProductSettings, putFileFormat, putLicense, putStatusProduct, bulkUpdateProductStatus } from '../../../../services/ServicesAdmin/ShopProductsServices';
import {  categoryByName } from '../../../../services/ServicesAdmin/CategoryService';
import { getLicensesByName } from '../../../../services/ServicesAdmin/LicenseService';
import Pagination from '../../../../components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import NotifyError from '../../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';

// Context for global state management
const ProductContext = createContext();


// Main component
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [licenses,setLicenses]=useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    category_id: 'all',
    min_price: '',
    max_price: '',
    license_id: 'all',
    sort: 'newest',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'all',
    search: '',
    category_id: 'all',
    min_price: '',
    max_price: '',
    license_id: 'all',
    sort: 'newest',
  });
  const [stats,setStats]=useState({
    products_Count:0,
    products_Count_Pending:0,
    revenue:0,
    downloads:0
  })
  const [currentPage,setCurrentPage]=useState(1)
  const [perPage,setPerPage]=useState(10)
  const [total,setTotal]=useState(0)
  const [error,setError]=useState(false)
  const [success,setSuccess]=useState(false)
  const [selectedIds, setSelectedIds] = useState([])


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getProducts(appliedFilters, { page: currentPage, per_page: perPage }, setError);
      const cat = await categoryByName(setError);
      const lic = await getLicensesByName(setError);
      setStats(res.stats);
      setLicenses(lic);
      setCategories(cat);
      setProducts(res.products?.data || []);
      setCurrentPage(res.products?.current_page || 1);
      setPerPage(res.products?.per_page || perPage);
      setTotal(res.products?.last_page || 1);
      setLoading(false);
    };
    fetchData();
  }, [currentPage, perPage, appliedFilters]);

  const handleFilter = async () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const contextValue = {
    products, setProducts,
    success,setSuccess,
    categories, setCategories,
    filters, setFilters,
    loading, setLoading,
    currentPage,setCurrentPage,
    perPage,setPerPage,
    total,setTotal,
    error,setError,
    licenses,setLicenses,handleFilter,
    stats,
    selectedIds,
    setSelectedIds
  };

  return (
    <ProductContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'products' && <ProductsSection />}
            {activeTab === 'validation' && <ValidationSection />}
            {activeTab === 'setting' && <ProductSettings />}
            {activeTab === 'format' && <FileFormatManager />}
            {activeTab === 'licenses' && <Licenses />}
          </div>
        </div>
        {error.etats && <NotifyError title='Error' message={error.message} type="error" 
        isVisible={error.etats} onClose={()=>setError({etats:false,message:''})}/>}
        {success.etats && <NotifySuccess message={success.message} 
        sucess={success.etats} onClose={()=>setSuccess({etats:false,message:''})} />}
      </div>
    </ProductContext.Provider>
  );
};

// Header with statistics
const Header = () => {
  const {stats}=useContext(ProductContext)
  return (
    <div className="bg-white shadow-sm border-b">
      <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your digital product catalog</p>
          </div>
      <div className="flex gap-4 justify-between items-center p-4 w-full ">
            <StatCard icon={Package} label="Products" value={stats?.products_Count} color="blue" />
            <StatCard icon={Eye} label="Pending" value={stats?.products_Count_Pending} color="yellow" />
            <StatCard icon={TrendingUp} label="Revenue" value={stats?.revenue} color="green" />
            <StatCard icon={Download} label="Downloads" value={stats?.downloads} color="purple" />
          </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm w-full">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Tab navigation
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'validation', name: 'Validation', icon: Check },
    { id: 'setting', name: 'Setting', icon: Settings2 },
    { id: 'format', name: 'Format', icon: FileText },
    { id: 'licenses', name: 'Licenses', icon: CircleCheck },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
// Products section
const ProductsSection = () => {
  const { products, loading, filters, setFilters, selectedIds, setSelectedIds, handleFilter } = useContext(ProductContext);
  const allIds = products?.map(p => p.id) || [];
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));

  return (
    <div className="space-y-6">
      <ProductFilters filters={filters} setFilters={setFilters} />
      <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-3">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(allIds);
            } else {
              setSelectedIds([]);
            }
          }}
        />
        <span className="text-sm text-gray-700">Select all</span>
      </div>
      {selectedIds.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {selectedIds.length} selected
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 text-sm bg-green-600 text-white rounded"
              onClick={async () => {
                await bulkUpdateProductStatus(selectedIds, 'approved');
                setSelectedIds([]);
                handleFilter();
              }}
            >
              Approve
            </button>
            <button
              className="px-3 py-2 text-sm bg-yellow-600 text-white rounded"
              onClick={async () => {
                await bulkUpdateProductStatus(selectedIds, 'suspended');
                setSelectedIds([]);
                handleFilter();
              }}
            >
              Suspend
            </button>
            <button
              className="px-3 py-2 text-sm bg-red-600 text-white rounded"
              onClick={async () => {
                await bulkUpdateProductStatus(selectedIds, 'rejected');
                setSelectedIds([]);
                handleFilter();
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

// Product filters
const ProductFilters = ({ filters, setFilters }) => {
  const { categories,licenses ,handleFilter} = useContext(ProductContext);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value={"suspended"}>Suspended</option>
          <option value={"draft"}>Draft</option>
        </select>

        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
       <select
  value={filters.sort || 'newest'}
  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
  className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
>
  <option value="newest">Sort by: Newest</option>
  <option value="price_asc">Sort by: Price (Low to High)</option>
  <option value="price_desc">Sort by: Price (High to Low)</option>
</select>


      </div>
      <div className='flex flex-wrap -gap-4 items-center mt-4 justify-between'>
        {/* min price */}
        <div className="relative  ">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
  <input
    type="number"
    placeholder="Min price"
    value={filters.min_price || ''}
    onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
    className="pl-7 pr-3 py-2 border w-full border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500"
  />

</div>

{/* max price */}
<div className="relative ">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
  <input
    type="number"
    placeholder="Max price"
    value={filters.max_price || ''}
    onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
    className="pl-7 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
  />
</div>

{/* type de license  */}
<select
  value={filters.license_id}
  onChange={(e) => setFilters({ ...filters, license_id: e.target.value })}
  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
>
  <option value="all">All licenses</option>
  {licenses.map(license=><option key={license.id} value={license.id}>{license.name}</option>)}
</select>
<button
  onClick={() => handleFilter()}
  className="w-40 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  <Filter className="w-4 h-4" />
  Filter
</button>

      </div>
    </div>
  );
};

// Product grid
const ProductGrid = ({ products }) => {
  if (products?.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className='relative'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    <ProductPagination/>
          </div>
  );
};

// Product card
const ProductCard = ({ product }) => {
  const navigate=useNavigate()
  const { selectedIds, setSelectedIds } = useContext(ProductContext)
  const isSelected = selectedIds.includes(product?.id)
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuve';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejete';
      case 'draft': return 'Brouillon';
      case 'suspended': return 'Suspendu';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A';
    }
  };

  // Fonction pour formater la taille de fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Gérer l'image de prévisualisation
  const getPreviewImage = () => {
    if (product?.preview_images && product.preview_images.length > 0) {
      return product.preview_images[0];
    }
    if (product?.main_file_path) {
      return product.main_file_path;
    }
    return null;
  };

  const previewImage = getPreviewImage();

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="absolute z-10 p-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds([...selectedIds, product.id]);
            } else {
              setSelectedIds(selectedIds.filter((id) => id !== product.id));
            }
          }}
        />
      </div>
      {/* Image de prévisualisation */}
      <div className="aspect-video bg-gray-100 relative">
        {previewImage ? (
          <img
            src={previewImage}
            alt={product?.title || 'Product'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback si pas d'image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200" style={{display: previewImage ? 'none' : 'flex'}}>
          <span className="text-gray-500 text-sm">Pas d'aperçu</span>
        </div>

        {/* Badge de statut */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product?.status)}`}>
            {getStatusText(product?.status)}
          </span>
        </div>
      </div>
     
      <div className="p-4">
        {/* Titre */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product?.title || 'Sans titre'}
        </h3>
       
        {/* Informations vendeur et catégorie */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{product?.shop?.shop_name || 'Vendeur inconnu'}</span>
          <span>{product?.category?.name || 'Sans catégorie'}</span>
        </div>
       
        {/* Prix et note */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ${product?.base_price || '0.00'}
            </span>
            {product?.minimum_price && (
              <span className="text-xs text-gray-500">
                Min: ${product.minimum_price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm">
              {product?.shop?.average_rating || '0.0'}
            </span>
            <span className="text-xs text-gray-500">
              ({product?.reviews_count || 0})
            </span>
          </div>
        </div>
       
        {/* Statistiques */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{product?.downloads_count || 0} téléchargements</span>
          <span>{formatFileSize(product?.main_file_size)}</span>
        </div>

        {/* Tags */}
        {product?.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Licence */}
        {product?.license && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
            <span className="font-medium text-gray-700">
              {product.license.name}
            </span>
            {product.license.download_limit && (
              <span className="text-gray-500 block">
                Limite: {product.license.download_limit} téléchargements
              </span>
            )}
          </div>
        )}
       
        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button
          onClick={()=>{
            return navigate(`/admin/products/show/${product?.id}`)
          }}
           className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
            <Eye className="h-4 w-4" />
            Show
          </button>
          
        </div>
      </div>
    </div>
  );
};


// Validation section
const ValidationSection = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading,setLoading]=useState(false)
  const {setError,setSuccess}=useContext(ProductContext)

  useEffect(()=>{
    const fetchData = async () => {
      setLoading(true)
      const res=await getPendingProducts(setError)
      setPendingProducts(res)
      setLoading(false)
    }
    fetchData()
  },[])


  const handleModeration = async (productId, action, reason = '') => {
 
      await putStatusProduct(productId, action,  reason ,setSuccess,setError);
      // Reload the list
      const res=await getPendingProducts(setError)
      setPendingProducts(res)
      setSelectedProduct(null);

  };
  if(loading){
    return <Loading/>
  }
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Products pending validation</h2>
        
        {pendingProducts.length === 0 ? (
          <div className="text-center py-8">
            <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">No products pending validation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProducts.map(product => (
              <div key={product?.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img 
                    src={product?.thumbnail_path} 
                    alt={product?.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product?.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">By {product?.vendor?.shop_name}</p>
                    <p className="text-sm text-gray-500">Submitted on {new Date(product?.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeration(product?.id, 'approved')}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Approved
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ModerationModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onSubmit={handleModeration}
        />
      )}
    </div>
  );
};

// Moderation modal
const ModerationModal = ({ product, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(product.id, 'rejected', reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Reject product</h3>
        <p className="text-gray-600 mb-4">Product: {product?.title}</p>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection..."
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={!reason?.trim()}
          >
            Rejected
          </button>
        </div>
      </div>
    </div>
  );
};
 const ProductPagination=()=>{
  const {currentPage,setCurrentPage,perPage,setPerPage,total,setTotal}=useContext(ProductContext)
  return(
    <Pagination currentPage={currentPage} totalPages={total} setCurrentPage={setCurrentPage} perPage={perPage} setPerPage={setPerPage}/>
  )
 }

 function FileFormatManager() {
  const [formats,setFormats] = useState([]);
  const {setError,setSuccess,loading,setLoading,error,success}=useContext(ProductContext)
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    extension: '',
    mime_type: '',
    max_file_size: '',
    allowed_categories: [],
    validation_rules: '',
    is_active: true
  });
  useEffect(()=>{
    async function fetchData(){
      setLoading(true)
     const res=await getFileFormats(setError)
     setFormats(res)
     setLoading(false)
    }
    fetchData()
  },[])


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = async() => {
    if(editingId){
      await putFileFormat(editingId,formData,setSuccess,setError)
      if(success.etats){
        const res=await getFileFormats(setError)
        setFormats(res)
        setFormData({
          name: '',
          extension: '',
          mime_type: '',
          max_file_size: '',
          allowed_categories: [],
          validation_rules: '',
          is_active: true
        });
        setEditingId(null)
      }

    }
    await postFileFormat(formData,setSuccess,setError)
    if(error.etats)return
     const res=await getFileFormats(setError)
     setFormats(res)
     setFormData({
      name: '',
      extension: '',
      mime_type: '',
      max_file_size: '',
      allowed_categories: [],
      validation_rules: '',
      is_active: true
    });
    setShowAddForm(false);
  };

  const handleEdit = async(format) => {
    setEditingId(format?.id);
    setFormData(format);
  };

  const handleDelete = async(id) => {
    await deleteFileFormat(id,setSuccess,setError)
    if(success.etats){
      const res=await getFileFormats(setError)
      setFormats(res)
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      extension: '',
      mime_type: '',
      max_file_size: '',
      allowed_categories: [],
      validation_rules: '',
      is_active: true
    });
  };
 if(loading) return <Loading/>
  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Format Manager</h1>
        <p className="text-gray-600">Manage supported file formats and their configurations</p>
      </div>

      {/* Add New Format Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Format
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white  mb-6 min-w-full p-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Format' : 'Add New Format'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., PDF Document"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extension</label>
              <input
                type="text"
                value={formData.extension}
                onChange={(e) => handleInputChange('extension', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., .pdf"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MIME Type</label>
              <input
                type="text"
                value={formData.mime_type}
                onChange={(e) => handleInputChange('mime_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., application/pdf"
              />
            </div>  
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </div>
          
        
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Formats Table */}
      <div className="bg-white rounded-lg w-full">
        <div className="w-full">
          <table className="w-full h-full overflow-x-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MIME Type</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formats?.map((format) => (
                <tr key={format.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{format.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 rounded px-2 py-1">
                    {format.extension}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{format.mime_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      format.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {format.is_active ? (
                        <>
                          <Check size={12} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={12} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(format.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(format)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(format.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {formats?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No file formats configured</p>
              <p className="text-sm">Add your first file format to get started</p>
            </div>
          </div>
        )}
      </div>
      
     
    </div>
  );
}
    

const ProductSettingsForm = ({setAddSetting}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    format_id: '',
    min_width: '',
    min_height: '',
    min_file_size: '',
    max_file_size: '',
    required_dpi: '',
    requires_description_min_length: 100,
    requires_tags_min_count: 3,
    requires_preview_images_min: 1,
    auto_virus_scan: true,
    auto_duplicate_check: true,
    auto_quality_assessment: true,
    requires_manual_review: true
  });
  const [formats,setFormats]=useState([])
  const {setError,setSuccess,error,success,categories}=useContext(ProductContext)
  useEffect(()=>{
    async function fetchData(){
      const res2=await getFileFormats(setError)
      setFormats(res2)
    }
    fetchData()
  },[])
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    await postProductSettings(formData,setSuccess,setError)
    if(success.etats){
      setFormData({
        category_id: '',
        format_id: '',
        min_width: '',
        min_height: '',
        min_file_size: '',
      })
    }
  };
  const handleReset = () => {
    setFormData({
      category_id: '',
      format_id: '',
      min_width: '',
      min_height: '',
      min_file_size: '',
      max_file_size: '',
      required_dpi: '',
      requires_description_min_length: 100,
      requires_tags_min_count: 3,
      requires_preview_images_min: 1,
      auto_virus_scan: true,
      auto_duplicate_check: true,
      auto_quality_assessment: true,
      requires_manual_review: true
    });
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto bg-white rounded-lg ">
        
        {/* Header */}
       

        {/* Form */}
        <div className="p-6">
          <div className="space-y-8">
            
            {/* Section 1: Sélection */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                1. Select Category and Format
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    name="format_id"
                    value={formData.format_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a format</option>
                    {formats.map(format => (
                      <option key={format.id} value={format.id}>{format.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Règles Techniques */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Technical Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum width (px)
                  </label>
                  <input
                    type="number"
                    name="min_width"
                    value={formData.min_width}
                    onChange={handleInputChange}
                    placeholder="ex: 1920"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum width required in pixels</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum height (px)
                  </label>
                  <input
                    type="number"
                    name="min_height"
                    value={formData.min_height}
                    onChange={handleInputChange}
                    placeholder="ex: 1080"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                    <p className="text-xs text-gray-500 mt-1">Minimum height required in pixels</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum file size (bytes)
                  </label>
                  <input
                    type="number"
                    name="min_file_size"
                    value={formData.min_file_size}
                    onChange={handleInputChange}
                    placeholder="ex: 1048576"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum file size (1MB = 1048576)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum file size (bytes)
                  </label>
                  <input
                    type="number"
                    name="max_file_size"
                    value={formData.max_file_size}
                    onChange={handleInputChange}
                    placeholder="ex: 52428800"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum file size (50MB = 52428800)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required DPI
                  </label>
                  <input
                    type="number"
                    name="required_dpi"
                    value={formData.required_dpi}
                    onChange={handleInputChange}
                    placeholder="ex: 300"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required DPI for printing</p>
                </div>
              </div>
            </div>

            {/* Section 3: Règles de Contenu */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                3. Content Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum description length
                  </label>
                  <input
                    type="number"
                    name="requires_description_min_length"
                    value={formData.requires_description_min_length}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum number of characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum number of tags
                  </label>
                  <input
                    type="number"
                    name="requires_tags_min_count"
                    value={formData.requires_tags_min_count}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                    <p className="text-xs text-gray-500 mt-1">Minimum number of tags required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum number of preview images
                  </label>
                  <input
                    type="number"
                    name="requires_preview_images_min"
                    value={formData.requires_preview_images_min}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum number of preview images</p>
                </div>
              </div>
            </div>

            {/* Section 4: Validation Automatique */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                4. Automatic Validation
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="auto_virus_scan"
                    checked={formData.auto_virus_scan}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Automatic antivirus scan
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="auto_duplicate_check"
                    checked={formData.auto_duplicate_check}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Automatic duplicate check
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="auto_quality_assessment"
                    checked={formData.auto_quality_assessment}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    Automatic quality assessment
                  </label>
                </div>
              </div>
            </div>

            {/* Section 5: Validation Manuelle */}
            <div className="pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                5. Manual Validation
              </h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_manual_review"
                  checked={formData.requires_manual_review}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Manual review required
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All products in this category/format will require manual approval
              </p>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-start pt-6 border-t">
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Save Settings
              </button>

              <button
                onClick={()=>setAddSetting(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
const ProductSettings = () => {
  const [settings, setSettings] = useState([]);
  const [addSetting,setAddSetting]=useState(false)
  const {loading,setLoading,setError,setSuccess,success}=useContext(ProductContext)

  useEffect(() => {
    const fethData=async()=>{
      const data=await getProductSettings(setError)
        setSettings(data)
    }
    fethData()
  }, []);

const handleDelete=async(id)=>{
  await deleteProductSettings(id,setSuccess,setError)
  if(success.etats){
    setSettings(settings.filter(setting=>setting.id !== id))
  }
}
  

  return (
   loading ? <Loading/> : addSetting ? <ProductSettingsForm setAddSetting={setAddSetting}/> : <div>
    {/* header */}
    <div className="flex justify-between items-center ">
      <h1 className="text-2xl font-bold">Product Settings</h1>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={()=>setAddSetting(true)}>Add Setting</button>
    </div>
    {/* body */}
    <div className="flex justify-between items-center mb-3">
    <div className="bg-white rounded-lg w-full">
    <div className="w-full overflow-x-auto">
      <table className="w-full h-full overflow-x-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Width</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Height</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min File Size</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max File Size</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required DPI</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Description Min Length</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Tags Min Count</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Preview Images Min</th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Virus Scan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {settings?.map((setting) => (
            <tr key={setting.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 rounded px-2 py-1">
                {setting?.category?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.format?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.min_file_size}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.max_file_size}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.required_dpi}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.requires_description_min_length}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.requires_tags_min_count}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.requires_preview_images_min}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.auto_virus_scan ? "Yes" : "No"}</td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.auto_duplicate_check ? "Yes" : "No"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{setting?.auto_quality_assessment ? "Yes" : "No"}</td>

              <td>
                <button
                 onClick={()=>handleDelete(setting.id)}
                 className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {settings?.length === 0 && (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg mb-2">No settings configured</p>
          <p className="text-sm">Add your first setting to get started</p>
        </div>
      </div>
    )}
    </div>
    
   
  </div>
  </div>
  </div>
    
  );
};

const Licenses=()=>{
  const [licenses,setLicenses]=useState([])
  const [addLicense,setAddLicense]=useState(false)
  const [formData,setFormData]=useState({
    name:'',
    slug:'',
    description:'',
    terms_and_conditions:'',
    usage_rights:'',
    price_multiplier:'',
    minimum_price:'',
    download_limit:'',
    time_limit_days:'',
    is_active:false,
  })
  const [action,setAction]=useState('add')
  const {loading,setLoading,setError,setSuccess,success}=useContext(ProductContext)
  useEffect(()=>{
    const fethData=async()=>{
      setLoading(true)
      const data=await getLicenses(setError)
      setLicenses(data)
      setLoading(false)
    }
    fethData()
  },[])
  const handleDelete=async(id)=>{
    await deleteLicense(id,setSuccess,setError)
    success.etats && setLicenses(prev=>prev.filter(license=>license.id !== id))
    setAddLicense(false)
  }
  const handleSubmit=async(e,data)=>{
    e.preventDefault()
    await postLicense(data,setSuccess,setError)
    success.etats && setLicenses([...licenses,data])
    setFormData({
      name:'',
      slug:'',
      description:'',
      terms_and_conditions:'',
      usage_rights:'',
      price_multiplier:'',
      minimum_price:'',
      download_limit:'',
      time_limit_days:'',
      is_active:false,
    })
    setAction('add')
  }
  const handleSave=async(e,data)=>{
    e.preventDefault()
    await putLicense(data.id,data,setSuccess,setError)
    success.etats && setLicenses(licenses.map(license=>license.id === data.id ? data : license))
    setAction('add')
    setFormData({
      name:'',
      slug:'',
      description:'',
      terms_and_conditions:'',
      usage_rights:'',
      price_multiplier:'',
      minimum_price:'',
      download_limit:'',
      time_limit_days:'',
      is_active:false,
    })
    setAddLicense(false)
  }
  return loading ? <Loading/> : addLicense ?
   <AddLicense action={action} formData={formData} setFormData={setFormData}
   setAddLicense={setAddLicense}
    handleSubmit={handleSubmit} handleSave={handleSave}
    setAction={setAction}
    /> : <>
  {/* header */}
  <div className="flex justify-between items-center ">  
    <h1 className="text-2xl font-bold">Licenses</h1>
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={()=>setAddLicense(true)}>Add License</button>
  </div>
  {/* body */}
  <div className="bg-white rounded-lg w-full">
        <div className="w-full">
          <table className="w-full h-full overflow-x-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term and Conditions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Rights</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Multiplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donload Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {licenses?.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{license?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 rounded px-2 py-1">
                    {license?.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.terms_and_conditions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.usage_rights}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.price_multiplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.minimum_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.download_limit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.time_limit_days} <span className='  '>days</span> </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{license?.is_active ?<span className='text-green-500'>Active</span> : <span className='text-red-500'>Inactive</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAddLicense(true)
                          setFormData(license)
                          setAction('edit')
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(license.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {licenses?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No licenses configured</p>
              <p className="text-sm">Add your first license to get started</p>
            </div>
          </div>
        )}
      </div>
  </>
}
const AddLicense=({action,formData,setFormData,setAddLicense,handleSubmit,handleSave,setAction})=>{
return <div className="bg-white  mb-6 min-w-full p-4">
<h2 className="text-xl font-semibold mb-4">
  {action === 'edit' ? 'Edit License' : 'Add New License'}
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
    <input
      type="text"
      value={formData.name}
      onChange={(e) => setFormData({...formData,name:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder=" Creative Commons License"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
    <input
      type="text"
      value={formData.slug}
      onChange={(e) => setFormData({...formData,slug:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="creative-commons"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
    <input
      type="text"
      value={formData.description}
      onChange={(e) => setFormData({...formData,description:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Creative Commons License"
    />
  </div>  
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Term and Conditions</label>
    <input
      type="text"
      value={formData.terms_and_conditions}
      onChange={(e) => setFormData({...formData,terms_and_conditions:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="You are allowed to use this file for personal use only."
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Rights</label>
    <input
      type="text"
      value={formData.usage_rights}
      onChange={(e) => setFormData({...formData,usage_rights:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="You are allowed to use this file for personal use only."
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Price Multiplier</label>
    <input
      type="number"
      value={formData.price_multiplier}
      onChange={(e) => setFormData({...formData,price_multiplier:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="1.5"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Price</label>
    <input
      type="number"
      value={formData.minimum_price}
      onChange={(e) => setFormData({...formData,minimum_price:e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="100"
    />
  </div>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Download Limit</label>
  <input
    type="number"
    value={formData.download_limit}
    onChange={(e) => setFormData({...formData,download_limit:e.target.value})}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="100"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit</label>
  <input
    type="number"
    value={formData.time_limit_days}
    onChange={(e) => setFormData({...formData,time_limit_days:e.target.value})}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="100"
  />
</div>
<div className='flex items-center gap-2 mt-4'>
 <input type="checkbox" checked={formData.is_active} 
 value={formData.is_active}
 onChange={(e) => setFormData({...formData,is_active:e.target.checked})} />
 <label className="block text-sm font-medium  mb-1 text-gray-500">Active</label>
</div>


<div className="flex gap-3 mt-6">
  <button
    onClick={(e)=>{ 
      action === 'add' ? handleSubmit(e,formData) : handleSave (e,formData)
    }}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
  >
    <Save size={16} />
    Save
  </button>
  <button
    onClick={()=>{
      setAddLicense(false)
      setAction('add')
      setFormData({
        name:'',
        slug:'',
        description:'',
        terms_and_conditions:'',
        usage_rights:'',
        price_multiplier:'',
        minimum_price:'',
        download_limit:'',
        time_limit_days:'',
        is_active:false,
      })
      setAction('add')
    }}
    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
  >
    <X size={16} />
    Cancel
  </button>
</div>
</div>
}
 


export default ProductManagement;
