import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Trash2, Eye, Download, Share2, Heart, Flag,
  Star, Calendar, Package, User, Tag, FileText, Image, 
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp,
  BarChart3, DollarSign, Users, MessageSquare, Settings,
  Upload, Save, X, Plus, Minus, ExternalLink, Copy,
  Shield, Award, Zap, Target, Activity, Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { getProductDetaill, putStatusProduct, getProductStats, uploadProductMainFile, uploadProductPreviewImages, removeProductPreviewImage } from '../../../../services/ServicesAdmin/ShopProductsServices';
import { useNavigate, useParams } from 'react-router-dom';
import NotifyError from '../../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';
const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const {id}=useParams()
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState({etats:false,message:''})
  const [success,setSuccess]=useState({etats:false,message:''})
  const [moderationNote,setModerationNote]=useState('')
  const [analytics,setAnalytics]=useState(null)
  const [mainFile,setMainFile]=useState(null)
  const [previewFiles,setPreviewFiles]=useState([])
  const navigate=useNavigate()
  useEffect(() => {
    const fetchData=async()=>{
      setLoading(true)
      const res=await getProductDetaill(id,setError)
      setProduct(res)
      const stats = await getProductStats(id)
      setAnalytics(stats)
      setLoading(false)
    }
    fetchData()
  }, [id]);
  useEffect(() => {
    setEditForm({
      title: product?.title,
      description: product?.description,
      base_price: product?.base_price,
      tags: product?.tags?.join(', '),
      meta_title: product?.meta_title,
      meta_description: product?.meta_description
    });
  }, [product]);
  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approuve' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'En attente' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejete' },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Suspendu' },
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
               onClick={()=>navigate(-1)}
               className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                Back to products
              </button>
              <div className="text-slate-500">|</div>
              <h1 className="text-xl font-semibold text-white">Product detail</h1>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(product?.status)}
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="aspect-video bg-slate-100 relative">
                {product?.preview_images?.[selectedImageIndex] ? (
                  <img 
                    src={product?.preview_images?.[selectedImageIndex]} 
                    alt={product?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Image className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm">
                    <Eye className="h-4 w-4 text-slate-700" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm">
                    <Share2 className="h-4 w-4 text-slate-700" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product?.preview_images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-slate-900' : 'border-slate-200'
                      }`}
                    >
                      <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Informations produit */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="p-6">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{product?.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
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
                        <div className="text-3xl font-bold text-emerald-600">€{product?.base_price}</div>
                        <div className="text-sm text-slate-500">Minimum price: €{product?.minimum_price}</div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 mb-6 leading-relaxed">{product?.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product?.tags?.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
               

                {/* Métadonnées techniques */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Technical informations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Format:</span>
                        <span className="font-medium">{product?.file_format?.name} (.{product?.file_format?.extension})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Size:</span>
                        <span className="font-medium">{formatFileSize(product?.main_file_size)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Creation date:</span>
                        <span className="font-medium">{new Date(product?.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Licenses:</span>
                        <span className="font-medium">{product?.license?.name ?? 'No license'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets détaillés */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-100">
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
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
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
                {activeTab === 'overview' && (
                  <OverviewTab
                    product={product}
                    previewFiles={previewFiles}
                    onMainFileChange={(file) => setMainFile(file)}
                    onUploadMain={async () => {
                      if (!mainFile) return;
                      await uploadProductMainFile(product?.id, mainFile);
                      const res = await getProductDetaill(id,setError);
                      setProduct(res);
                    }}
                    onPreviewFilesChange={(files) => setPreviewFiles(Array.from(files || []))}
                    onUploadPreview={async () => {
                      if (!previewFiles || previewFiles.length === 0) return;
                      await uploadProductPreviewImages(product?.id, previewFiles);
                      const res = await getProductDetaill(id,setError);
                      setProduct(res);
                      setPreviewFiles([]);
                    }}
                    onRemovePreview={async (index) => {
                      await removeProductPreviewImage(product?.id, index);
                      const res = await getProductDetaill(id,setError);
                      setProduct(res);
                    }}
                  />
                )}
                {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
                {activeTab === 'reviews' && <ReviewsTab reviews={product.reviews} />}
                {activeTab === 'moderation' && (
                  <ModerationTab
                    product={product}
                    note={moderationNote}
                    setNote={setModerationNote}
                    onAction={async (status) => {
                      await putStatusProduct(product?.id, status, moderationNote, setSuccess, setError);
                      const res = await getProductDetaill(id,setError);
                      setProduct(res);
                      setModerationNote('');
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <StatItem icon={Eye} label="Views" value={product?.views_count?.toLocaleString()} />
                <StatItem icon={Download} label="Downloads" value={product?.downloads_count?.toLocaleString()} />
                <StatItem icon={DollarSign} label="Ventes" value={product?.orders_count?.toLocaleString()} />
                <StatItem icon={TrendingUp} label="Revenus" value={`${product?.orders_sum_total_amount?.toLocaleString() ?? 0}`} />
              </div>
            </div>

            {/* Informations seller */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
                  <p className="text-sm text-gray-600">{product?.shop?.shop_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{product?.shop?.user?.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{product?.orders_count} sales</span>
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
          </div>
        </div>
      </div>
      <NotifyError title="Error" message={error.message} type="error" isVisible={error.etats} onClose={()=>setError({etats:false,message:''})}/>
      {success.etats && <NotifySuccess message={success.message} sucess={success.etats} onClose={()=>setSuccess({etats:false,message:''})} />}
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
const OverviewTab = ({ product, previewFiles, onMainFileChange, onUploadMain, onPreviewFilesChange, onUploadPreview, onRemovePreview }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-base font-semibold mb-3">Uploads</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Main file</label>
          <input type="file" onChange={(e) => onMainFileChange(e.target.files?.[0] || null)} />
          <button
            onClick={onUploadMain}
            className="mt-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Upload
          </button>
        </div>
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview images</label>
          <input type="file" multiple onChange={(e) => onPreviewFilesChange(e.target.files)} />
          <p className="text-xs text-gray-500 mt-1">
            Ajout sans écrasement. Les doublons (mêmes images) seront ignorés.
          </p>
          {previewFiles?.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previewFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`preview-upload-${idx}`}
                  className="w-full h-20 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
          )}
          <button
            onClick={onUploadPreview}
            className="mt-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
    {product?.preview_images?.length > 0 && (
      <div>
        <h4 className="text-base font-semibold mb-3">Preview images</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.preview_images.map((img, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-2 bg-white">
              <img src={img} alt={`preview-${index}`} className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => onRemovePreview(index)}
                className="mt-2 w-full text-xs bg-red-100 text-red-700 rounded-lg py-1"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div>
      <h4 className="text-base font-semibold mb-3">Available licenses</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       
          <div  className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">{product?.license?.name}</h5>
            <p className="text-2xl font-bold text-green-600 mb-2">x{product?.license?.price_multiplier}</p>
            <p className="text-sm text-gray-600">{product?.license?.description}</p>
          </div>
     
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">SEO</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta title</label>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{product?.title}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{product?.description}</p>
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.daily_views || []}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
const ModerationTab = ({ product, note, setNote, onAction }) => (
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
                par {product.moderated_by?.name || 'Admin'} le {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : '-'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{product.reason || 'Aucune note'}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div>
      <h4 className="text-base font-semibold mb-3">Moderation actions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => onAction('approved')}
          className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          Approve the product
        </button>
        <button
          onClick={() => onAction('rejected')}
          className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <XCircle className="h-4 w-4" />
          Reject the product
        </button>
        <button
          onClick={() => onAction('suspended')}
          className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
        >
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
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

export default ProductDetail;
