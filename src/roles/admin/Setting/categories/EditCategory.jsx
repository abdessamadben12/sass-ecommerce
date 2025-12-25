import React, { useState, useEffect, use } from 'react';
import { Edit, Upload, X, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../../components/ui/loading';
import { CategoryDetaill, getParentCategory, putCategory } from '../../../../services/ServicesAdmin/CategoryService';
import NotifyError from '../../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';

const EditCategory = (  ) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    level: '',
    path: '',
    description: '',
    icon: null,
    meta_title: '',
    meta_description: '',
    is_active: true
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [sucess,setSucess]=useState({etats:false,message:""})
  const [error,setError]=useState({etats:false,message:""})
  const navigate=useNavigate()
  const categoryId=useParams().id
  // Mock data for parent categories
  const [parentCategories,setParentCategory] = useState([]);
  

  // Load existing category data
  useEffect(() => {
     const fetchData=async()=>{
          setLoading(true)
          const res =await getParentCategory(categoryId,formData,setErrors)
          const deataill=await CategoryDetaill(categoryId,setError)
          setParentCategory(res)
          setCurrentIcon(deataill.icon)
          setFormData(deataill)
          setLoading(false)
          }
          fetchData()
  }, [categoryId]);
  console.log(parentCategories)

  // Auto-generate slug from name (only if manually changed)
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(false);
  
  useEffect(() => {
    if (formData.name && !slugManuallyChanged) {
      const newSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      if (newSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: newSlug }));
      }
    }
  }, [formData.name, slugManuallyChanged]);

  // Calculate level and path based on parent category
  useEffect(() => {
    if (formData.parent_id) {
      const parent = parentCategories?.find(cat => cat.id === parseInt(formData.parent_id));
      if (parent) {
        const newLevel = parent.level + 1;
        const newPath = parent.path ? `${parent.path}/${parent.id}` : `${parent.id}`;
        setFormData(prev => ({
          ...prev,
          level: newLevel,
          path: newPath
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        level: 0,
        path: ''
      }));
    }
  }, [formData.parent_id, parentCategories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Track if slug was manually changed
    if (name === 'slug') {
      setSlugManuallyChanged(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when modifying
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, icon: 'File must be an image (JPG, JPEG, PNG, SVG)' }));
        return;
      }
      setFormData(prev => ({ ...prev, icon: file }));
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setIconPreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear current icon and error
      setCurrentIcon(null);
      setErrors(prev => ({ ...prev, icon: null }));
    }
  };

  const removeIcon = () => {
    setFormData(prev => ({ ...prev, icon: null }));
    setIconPreview(null);
    setCurrentIcon(null);
  };

  const restoreOriginalIcon = () => {
    setFormData(prev => ({ ...prev, icon: null }));
    setIconPreview(null);
    setCurrentIcon(originalData.icon);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (formData.slug.length > 255) {
      newErrors.slug = 'Slug must not exceed 255 characters';
    }

    if (formData.path && formData.path.length > 500) {
      newErrors.path = 'Path must not exceed 500 characters';
    }

    if (formData.meta_title && formData.meta_title.length > 255) {
      newErrors.meta_title = 'Meta title must not exceed 255 characters';
    }

    if (formData.meta_description && formData.meta_description.length > 500) {
      newErrors.meta_description = 'Meta description must not exceed 500 characters';
    }

    if (formData.level && formData.level < 0) {
      newErrors.level = 'Level must be positive';
    }

    // Check if current category is being set as its own parent
    if (formData.parent_id && parseInt(formData.parent_id) === formData.id) {
      newErrors.parent_id = 'Category cannot be its own parent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      if (key === 'icon') {
        return formData[key] !== null || currentIcon !== originalData.icon;
      }
      return formData[key] !== originalData[key];
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      alert('No changes to save');
      return;
    }
    setLoading(true);
    const data=new FormData()
    data.append('_method', 'PUT');
    data.append("name",formData.name)
    data.append("slug",formData.slug)

    data.append("parent_id",formData.parent_id)
    data.append("level",formData.level)
    data.append("path",formData.path)
    data.append("description",formData.description)
    data.append("icon",formData.icon)
    data.append("meta_title",formData.meta_title)
    data.append("meta_description",formData.meta_description)
    data.append("is_active",formData.is_active ? '1' : '0')
        
    await putCategory(categoryId,data,setError,setSucess)
    setLoading(false);
    

  };
 

  if (loadingData) {
    return (
     <Loading/>
    );
  }
 


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Edit className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Update Category</h1>
        </div>
        
        {hasChanges() && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Category name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="category-slug"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          {/* Parent Category */}
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
            </label>
            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.parent_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">None (root category)</option>
              {parentCategories
                .filter(category => category.id !== formData.id) // Prevent self-selection
                .map(category => (
                <option key={category.id} value={category.id}>
                  {'—'.repeat(category.level)} {category.name}
                </option>
              ))}
            </select>
            {errors.parent_id && <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <input
              type="number"
              id="level"
              name="level"
              value={formData.level}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        {/* Path */}
        <div>
          <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-2">
            Path
          </label>
          <input
            type="text"
            id="path"
            name="path"
            value={formData.path}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            placeholder="Auto-calculated based on parent category"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category description..."
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                id="icon"
                name="icon"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                className="hidden"
              />
              <label
                htmlFor="icon"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {currentIcon || iconPreview ? 'Change Icon' : 'Choose File'}
              </label>
            </div>
            
            {/* Icon Preview/Current */}
            {(iconPreview || currentIcon) && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={iconPreview || currentIcon}
                    alt="Icon"
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={removeIcon}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {iconPreview && originalData.icon && (
                  <button
                    type="button"
                    onClick={restoreOriginalIcon}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Restore Original
                  </button>
                )}
              </div>
            )}
          </div>
          {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Accepted formats: JPG, JPEG, PNG, SVG. Max size: 2MB
          </p>
        </div>

        {/* SEO */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Engine Optimization (SEO)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Title */}
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                maxLength={255}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.meta_title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Title for search engines"
              />
              {errors.meta_title && <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>}
              <p className="mt-1 text-xs text-gray-500">{formData.meta_title.length}/255</p>
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                maxLength={500}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.meta_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Description for search engines"
              />
              {errors.meta_description && <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>}
              <p className="mt-1 text-xs text-gray-500">{formData?.meta_description?.length}/500</p>
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
            Category is active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6 border-t">
          
          
          <div className="flex gap-4">
            <button
            onClick={()=>navigate(-1)}
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !hasChanges()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </div>
      </div>
       <NotifyError message={error.message} onClose={()=>setError(false)} isVisible={error.etats}  />
  
   {sucess?.etats && <NotifySuccess sucess={sucess.etats} message={sucess.message} onClose={() => setSucess(false)} /> }
     
    </div>
  );
};

export default EditCategory;