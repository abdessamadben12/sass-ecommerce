import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Trash2, Eye, Download, Share2, Heart, Flag,
  Star, Calendar, Package, User, Tag, FileText, Image, 
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp,
  BarChart3, DollarSign, Users, MessageSquare, Settings,
  Upload, Save, X, Plus, Minus, ExternalLink, Copy,
  Shield, Award, Zap, Target, Activity, Layers
} from 'lucide-react';
import { getProductDetaill } from '../../../../services/ServicesAdmin/ShopProductsServices';
import { useNavigate, useParams } from 'react-router-dom';
const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const {id}=useParams()
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState({etats:false,message:''})
  const navigate=useNavigate()
  useEffect(() => {
    const fetchData=async()=>{
      setLoading(true)
      const res=await getProductDetaill(id,setError)
      setProduct(res)
      setLoading(false)
    }
    fetchData()
    setEditForm({
      title: product?.title,
      description: product?.description,
      base_price: product?.base_price,
      tags: product?.tags?.join(', '),
      meta_title: product?.meta_title,
      meta_description: product?.meta_description
    });
  }, [id]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Sauvegarder les modifications
    setProduct({
      ...product,
      ...editForm,
      tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    setIsEditing(false);
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approuvé' },
      pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'En attente' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejeté' },
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit, text: 'Brouillon' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
               onClick={()=>navigate(-1)}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Back to products
              </button>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">Product detail</h1>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(product.status)}
              <button
                onClick={handleEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img 
                  src={product?.preview_images?.[selectedImageIndex]} 
                  alt={product?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                    <Share2 className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product?.preview_images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Informations produit */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.base_price}
                          onChange={(e) => setEditForm({...editForm, base_price: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (separated by commas)</label>
                        <input
                          type="text"
                          value={editForm.tags}
                          onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product?.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Créé le {new Date(product?.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {product?.category?.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">€{product?.base_price}</div>
                        <div className="text-sm text-gray-500">Minimum price: €{product?.minimum_price}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">{product?.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product?.tags?.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métadonnées techniques */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Technical informations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{product?.file_format?.name} (.{product?.file_format?.extension})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{formatFileSize(product?.main_file_size)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creation date:</span>
                        <span className="font-medium">{new Date(product?.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Licenses:</span>
                        <span className="font-medium">{product?.license?.name ?? 'No license'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets détaillés */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', name: 'Overview', icon: Eye },
                    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                    { id: 'reviews', name: 'Reviews', icon: MessageSquare },
                    { id: 'moderation', name: 'Moderation', icon: Shield }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && <OverviewTab product={product} />}
                {activeTab === 'analytics' && <AnalyticsTab analytics={product.analytics} />}
                {activeTab === 'reviews' && <ReviewsTab reviews={product.reviews} />}
                {activeTab === 'moderation' && <ModerationTab product={product} />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <StatItem icon={Eye} label="Views" value={product?.views_count?.toLocaleString()} />
                <StatItem icon={Download} label="Downloads" value={product?.downloads_count?.toLocaleString()} />
                <StatItem icon={DollarSign} label="Ventes" value={product?.order_count?.toLocaleString()} />
                <StatItem icon={TrendingUp} label="Revenus" value={`${product?.order_sum_total_price?.toLocaleString() ?? 0}`} />
              </div>
            </div>

            {/* Informations seller */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Seller</h3>
              <div className="flex items-start gap-3">
                <img 
                  src={product?.shop?.user?.avatar} 
                  alt={product?.shop?.user?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{product?.shop?.user?.name}</h4>
                    {product?.shop?.user?.is_verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{product?.shop?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{product?.shop?.user?.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{product?.order_count} sales</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member since:</span>
                  <span>{new Date(product?.shop?.user?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant StatItem
const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="font-semibold">{value}</span>
  </div>
);

// Onglet Vue d'ensemble
const OverviewTab = ({ product }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-base font-semibold mb-3">Available licenses</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       
          <div  className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">{product?.license?.name}</h5>
            <p className="text-2xl font-bold text-green-600 mb-2">€{product?.license?.price}</p>
            <p className="text-sm text-gray-600">{product?.license?.description}</p>
          </div>
     
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">SEO</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta title</label>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{product?.meta_title}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{product?.meta_description}</p>
        </div>
      </div>
    </div>
  </div>
);

// Onglet Analytics
const AnalyticsTab = ({ analytics }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-base font-semibold mb-3">Performance (last 7 days)</h4>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics?.daily_views?.slice(-7).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</div>
              <div className="text-lg font-bold">{day.views}</div>
                <div className="text-xs text-gray-500">{day.sales} sales</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">Geographical distribution</h4>
      <div className="space-y-2">
        {analytics?.countries?.map((country, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">{country.country}</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{country?.views} views</div>
              <div className="text-xs text-gray-600">{country?.sales} sales</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Onglet Avis
const ReviewsTab = ({ reviews }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-base font-semibold">Reviews ({reviews?.length})</h4>
    </div>
    
    <div className="space-y-4">
      {reviews?.map(review => (
        <div key={review?.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <img 
              src={review?.user?.avatar} 
              alt={review?.user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium">{review?.user?.name}</h5>
                  {review?.is_verified_purchase && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Verified purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              
              <h6 className="font-medium mb-1">{review.title}</h6>
              <p className="text-gray-700 text-sm mb-2">{review.review}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <Heart className="h-3 w-3" />
                  {review.helpful_votes} useful
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Onglet Modération
const ModerationTab = ({ product }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-base font-semibold mb-3">Moderation history</h4>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Product approved</span>
              <span className="text-sm text-gray-500">
                par {product.moderated_by?.name} le {new Date(product.moderated_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{product.moderation_notes}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">Moderation actions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
          <CheckCircle className="h-4 w-4" />
          Approve the product
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
          <XCircle className="h-4 w-4" />
          Reject the product
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
          <Clock className="h-4 w-4" />
          Put on hold
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Flag className="h-4 w-4" />
          Report a problem
        </button>
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">Add a moderation note</h4>
      <textarea
        placeholder="Add an internal note on this product..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Add the note
      </button>
    </div>
  </div>
);

export default ProductDetail;