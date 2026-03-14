import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Eye, Download, Share2, Heart, Star, Calendar,
  Package, Image, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, BarChart3, DollarSign, MessageSquare, Shield,
  FileText, Copy, Check, Upload, Trash2, RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, BarChart, Bar,
} from 'recharts';
import {
  getProductDetaill, putStatusProduct, getProductStats,
  uploadProductMainFile, uploadProductPreviewImages, removeProductPreviewImage,
} from '../../../../services/ServicesAdmin/ShopProductsServices';
import { useNavigate, useParams } from 'react-router-dom';
import NotifyError from '../../../../components/ui/NotifyError';
import { NotifySuccess } from '../../../../components/ui/NotifySucces';

/* ─────────────────────────────── helpers ─────────────────────────────────── */

const fmt = {
  price : (v) => `$${Number(v || 0).toFixed(2)}`,
  num   : (v) => Number(v || 0).toLocaleString(),
  date  : (v) => v ? new Date(v).toLocaleDateString() : '—',
  bytes : (b) => {
    if (!b) return '—';
    const u = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
  },
};

const STATUS = {
  approved : { color: 'bg-green-100 text-green-800',   icon: CheckCircle,    label: 'Approved'  },
  pending  : { color: 'bg-yellow-100 text-yellow-800', icon: Clock,          label: 'Pending'   },
  rejected : { color: 'bg-red-100 text-red-800',       icon: XCircle,        label: 'Rejected'  },
  suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle,  label: 'Suspended' },
  draft    : { color: 'bg-slate-100 text-slate-700',   icon: FileText,       label: 'Draft'     },
};

/* ─────────────────────────── small reusables ─────────────────────────────── */

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS[status] || STATUS.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${size === 'sm' ? 'text-sm' : 'text-base'} ${cfg.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
};

const Avatar = ({ src, name, className = 'w-10 h-10' }) => {
  const [err, setErr] = useState(false);
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (!src || err)
    ? <div className={`${className} rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm select-none shrink-0`}>{initials}</div>
    : <img src={src} alt={name} onError={() => setErr(true)} className={`${className} rounded-full object-cover shrink-0`} />;
};

const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} title={`Copy ${label}`}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

const ProgressBar = ({ value, className = '' }) => (
  <div className={`w-full h-1.5 bg-slate-200 rounded-full overflow-hidden ${className}`}>
    <div
      className="h-full bg-blue-500 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

/* ─────────────────────────── confirm modal ──────────────────────────────── */

const CONFIRM_META = {
  approved : { title: 'Approve product',   message: 'This will make the product visible to buyers.',          label: 'Approve',    cls: 'bg-green-600 hover:bg-green-700'   },
  rejected : { title: 'Reject product',    message: 'The seller will be notified with the reason provided.',  label: 'Reject',     cls: 'bg-red-600 hover:bg-red-700'       },
  suspended: { title: 'Suspend product',   message: 'The product will be hidden until further review.',       label: 'Suspend',    cls: 'bg-orange-500 hover:bg-orange-600' },
  draft    : { title: 'Move to draft',     message: 'The product will be moved back to draft state.',         label: 'Set draft',  cls: 'bg-slate-600 hover:bg-slate-700'   },
};

const ConfirmModal = ({ open, status, onConfirm, onCancel }) => {
  if (!open) return null;
  const m = CONFIRM_META[status] || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-semibold mb-2">{m.title}</h3>
        <p className="text-slate-500 text-sm mb-6">{m.message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-xl text-white font-medium transition-colors ${m.cls}`}>
            {m.label}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── skeleton ──────────────────────────────────── */

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="aspect-video w-full" />
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <div className="flex gap-6 border-b pb-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-24" />)}
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────── sidebar stat card ──────────────────────────── */

const StatCard = ({ icon: Icon, label, value, sub, accent = 'text-slate-900' }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400 leading-none mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${accent}`}>{value}</p>
    </div>
    {sub && <span className="text-xs text-slate-400 shrink-0">{sub}</span>}
  </div>
);

/* ─────────────────────────── checklist ─────────────────────────────────── */

const Checklist = ({ product }) => {
  const items = [
    { label: 'Main file uploaded',       done: !!product?.main_file_path },
    { label: 'Preview images (≥1)',      done: (product?.preview_images?.length ?? 0) >= 1 },
    { label: 'Description added',        done: (product?.description?.length ?? 0) > 50 },
    { label: 'Tags added',               done: (product?.tags?.length ?? 0) > 0 },
    { label: 'License set',              done: !!product?.license_id },
    { label: 'Price set',                done: Number(product?.base_price) > 0 },
  ];
  const done = items.filter(i => i.done).length;
  const pct  = Math.round((done / items.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Completeness</h3>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : 'text-slate-500'}`}>{pct}%</span>
      </div>
      <ProgressBar value={pct} className="mb-4" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {item.done
              ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              : <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />}
            <span className={item.done ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════════ */

const ProductDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState({ etats: false, message: '' });
  const [success,    setSuccess]    = useState({ etats: false, message: '' });
  const [activeTab,  setActiveTab]  = useState('overview');
  const [imgIndex,   setImgIndex]   = useState(0);
  const [note,       setNote]       = useState('');
  const [confirm,    setConfirm]    = useState({ open: false, status: null });
  const [mainFile,   setMainFile]   = useState(null);
  const [prevFiles,  setPrevFiles]  = useState([]);
  const [mainProg,   setMainProg]   = useState(0);
  const [prevProg,   setPrevProg]   = useState(0);
  const [uploading,  setUploading]  = useState({ main: false, preview: false });

  const refresh = useCallback(async () => {
    const res = await getProductDetaill(id, setError);
    if (res) setProduct(res);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, a] = await Promise.allSettled([
        getProductDetaill(id, setError),
        getProductStats(id),
      ]);
      if (p.status === 'fulfilled' && p.value) setProduct(p.value);
      if (a.status === 'fulfilled' && a.value) setAnalytics(a.value);
      setLoading(false);
    };
    load();
  }, [id]);

  /* moderation */
  const requestAction = (status) => setConfirm({ open: true, status });

  const confirmAction = async () => {
    const status = confirm.status;
    setConfirm({ open: false, status: null });
    await putStatusProduct(product.id, status, note, setSuccess, setError);
    await refresh();
    setNote('');
  };

  /* uploads */
  const handleUploadMain = async () => {
    if (!mainFile) return;
    setUploading(u => ({ ...u, main: true }));
    setMainProg(0);
    try {
      const res = await uploadProductMainFile(product.id, mainFile, setMainProg);
      // Immediately patch local state with the returned file info
      if (res) {
        setProduct(prev => ({
          ...prev,
          main_file_path: res.file_path  ?? prev?.main_file_path,
          main_file_size: res.file_size  ?? prev?.main_file_size,
          updated_at:     res.uploaded_at ?? prev?.updated_at,
          // If backend returned the detected format, patch it
          ...(res.format ? {
            file_format: res.format,
            productSetting: prev?.productSetting
              ? { ...prev.productSetting, format: res.format }
              : prev?.productSetting,
          } : {}),
        }));
      }
      setSuccess({ etats: true, message: 'File uploaded — format, size and date updated.' });
      setMainFile(null);
      // Full refresh to sync all relations (productSetting.format etc.)
      await refresh();
    } catch (e) {
      setError({ etats: true, message: e?.response?.data?.error || e?.message || 'Upload failed' });
    } finally { setUploading(u => ({ ...u, main: false })); setMainProg(0); }
  };

  const handleUploadPreview = async () => {
    if (!prevFiles.length) return;
    setUploading(u => ({ ...u, preview: true }));
    setPrevProg(0);
    try {
      await uploadProductPreviewImages(product.id, prevFiles, setPrevProg);
      setSuccess({ etats: true, message: 'Preview images uploaded successfully' });
      setPrevFiles([]);
      await refresh();
    } catch { /* error handled by axios interceptor */ }
    finally { setUploading(u => ({ ...u, preview: false })); setPrevProg(0); }
  };

  const handleRemovePreview = async (index) => {
    await removeProductPreviewImage(product.id, index);
    await refresh();
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors shrink-0">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
              <div className="w-px h-5 bg-slate-600" />
              <div className="min-w-0">
                <h1 className="text-white font-semibold truncate text-sm sm:text-base">
                  {loading ? 'Loading…' : (product?.title || 'Product Detail')}
                </h1>
                {product?.slug && (
                  <p className="text-slate-400 text-xs truncate hidden sm:block">/{product.slug}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {product?.slug && <CopyButton text={product.slug} label="slug" />}
              {!loading && product && <StatusBadge status={product.status} />}
            </div>
          </div>
        </div>
      </div>

      {loading ? <PageSkeleton /> : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ────── Main column ────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Image gallery */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="aspect-video bg-slate-100 relative group">
                  {product?.preview_images?.[imgIndex] ? (
                    <img src={product.preview_images[imgIndex]} alt={product.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <Image className="h-12 w-12" />
                      <span className="text-sm">No preview image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 rounded-xl hover:bg-white shadow-sm transition-colors">
                      <Share2 className="h-4 w-4 text-slate-700" />
                    </button>
                  </div>
                </div>
                {product?.preview_images?.length > 0 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {product.preview_images.map((img, i) => (
                        <button key={i} onClick={() => setImgIndex(i)}
                          className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            imgIndex === i ? 'border-slate-900 scale-105' : 'border-slate-200 hover:border-slate-400'
                          }`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{product?.title}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {fmt.date(product?.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {product?.category?.name || '—'}
                      </span>
                      {product?.reviews_avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                          {Number(product.reviews_avg_rating).toFixed(1)}
                          <span className="text-slate-400">({product.reviews_count})</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold text-emerald-600">{fmt.price(product?.base_price)}</div>
                    {product?.minimum_price > 0 && (
                      <div className="text-sm text-slate-400">Min: {fmt.price(product?.minimum_price)}</div>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-5 text-sm">{product?.description || <em className="text-slate-400">No description</em>}</p>

                {product?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Format</p>
                    <p className="font-medium">
                      {/* file_format can come from: accessor (productSetting.format), direct upload response, or productSetting inline */}
                      {(() => {
                        const f = product?.file_format ?? product?.productSetting?.format;
                        return f?.name ? `${f.name} (.${f.extension})` : '—';
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">File size</p>
                    <p className="font-medium">{fmt.bytes(product?.main_file_size)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">License</p>
                    <p className="font-medium">{product?.license?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">File uploaded</p>
                    <p className="font-medium">{product?.main_file_path ? fmt.date(product?.updated_at) : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-100 overflow-x-auto">
                  <nav className="flex min-w-max px-2">
                    {[
                      { id: 'overview',   label: 'Overview',    icon: Eye,          badge: null },
                      { id: 'analytics',  label: 'Analytics',   icon: BarChart3,    badge: null },
                      { id: 'reviews',    label: 'Reviews',     icon: MessageSquare, badge: product?.reviews_count || null },
                      { id: 'moderation', label: 'Moderation',  icon: Shield,       badge: null },
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                              ? 'border-slate-900 text-slate-900'
                              : 'border-transparent text-slate-400 hover:text-slate-700'
                          }`}>
                          <Icon className="h-4 w-4" />
                          {tab.label}
                          {tab.badge > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs leading-none">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <OverviewTab
                      product={product}
                      prevFiles={prevFiles}
                      mainFile={mainFile}
                      onMainFileChange={setMainFile}
                      onUploadMain={handleUploadMain}
                      onPrevFilesChange={(files) => setPrevFiles(Array.from(files || []))}
                      onUploadPreview={handleUploadPreview}
                      onRemovePreview={handleRemovePreview}
                      mainProg={mainProg}
                      prevProg={prevProg}
                      uploading={uploading}
                    />
                  )}
                  {activeTab === 'analytics'  && <AnalyticsTab analytics={analytics} />}
                  {activeTab === 'reviews'    && <ReviewsTab reviews={product?.reviews} />}
                  {activeTab === 'moderation' && (
                    <ModerationTab
                      product={product}
                      note={note}
                      setNote={setNote}
                      onAction={requestAction}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ────── Sidebar ────── */}
            <div className="space-y-5">

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Product statistics</h3>
                <div className="divide-y divide-slate-100">
                  <StatCard icon={Eye}       label="Total views"     value={fmt.num(product?.views_count)}     />
                  <StatCard icon={Download}  label="Downloads"       value={fmt.num(product?.downloads_count)} />
                  <StatCard icon={DollarSign} label="Orders"         value={fmt.num(product?.orders_count)}    />
                  <StatCard icon={TrendingUp} label="Revenue"
                    value={fmt.price(product?.orders_sum_total_price ?? product?.orders_sum_total_amount)}
                    accent="text-emerald-600"
                  />
                  {(product?.reviews_avg_rating > 0) && (
                    <StatCard icon={Star} label="Avg. rating"
                      value={`${Number(product.reviews_avg_rating).toFixed(1)} / 5`}
                      accent="text-yellow-600"
                    />
                  )}
                  {analytics?.conversion_rate != null && (
                    <StatCard icon={BarChart3} label="Conversion rate"
                      value={`${analytics.conversion_rate}%`}
                    />
                  )}
                </div>
              </div>

              {/* Completeness */}
              <Checklist product={product} />

              {/* Seller */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Seller</h3>
                <div className="flex items-start gap-3">
                  <Avatar src={product?.shop?.user?.avatar} name={product?.shop?.user?.name} className="w-11 h-11" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product?.shop?.user?.name || '—'}</p>
                    <p className="text-xs text-slate-400 truncate">{product?.shop?.shop_name}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      {product?.shop?.average_rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          {Number(product.shop.average_rating).toFixed(1)}
                        </span>
                      )}
                      <span>{fmt.num(product?.orders_count)} sales</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Member since</span>
                    <span className="font-medium text-slate-700">{fmt.date(product?.shop?.user?.created_at)}</span>
                  </div>
                  {product?.shop?.products_count != null && (
                    <div className="flex justify-between text-slate-500">
                      <span>Total products</span>
                      <span className="font-medium text-slate-700">{product.shop.products_count}</span>
                    </div>
                  )}
                  {product?.shop?.is_verified && (
                    <div className="flex items-center gap-1 text-blue-600 pt-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Verified shop</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modals & notifications */}
      <ConfirmModal
        open={confirm.open}
        status={confirm.status}
        onConfirm={confirmAction}
        onCancel={() => setConfirm({ open: false, status: null })}
      />
      <NotifyError title="Error" message={error.message} type="error"
        isVisible={error.etats} onClose={() => setError({ etats: false, message: '' })} />
      {success.etats && (
        <NotifySuccess message={success.message} sucess={success.etats}
          onClose={() => setSuccess({ etats: false, message: '' })} />
      )}
    </div>
  );
};

/* ════════════════════════════ TAB COMPONENTS ════════════════════════════ */

/* ── Overview ─────────────────────────────────────────────────────────── */
const OverviewTab = ({
  product, prevFiles, mainFile,
  onMainFileChange, onUploadMain,
  onPrevFilesChange, onUploadPreview, onRemovePreview,
  mainProg, prevProg, uploading,
}) => (
  <div className="space-y-8">
    {/* File management */}
    <section>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">File management</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Main file */}
        <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Main file</span>
            {product?.main_file_path
              ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Uploaded</span>
              : <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Missing</span>
            }
          </div>

          {/* Current file info */}
          {product?.main_file_path && (
            <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1 text-xs text-slate-500">
              {(() => {
                const f = product?.file_format ?? product?.productSetting?.format;
                return f?.name ? (
                  <p><span className="font-medium text-slate-700">Format:</span> {f.name} (.{f.extension})</p>
                ) : null;
              })()}
              {product?.main_file_size > 0 && (
                <p><span className="font-medium text-slate-700">Size:</span> {
                  (() => {
                    const b = product.main_file_size;
                    const u = ['B','KB','MB','GB'];
                    const i = Math.floor(Math.log(b) / Math.log(1024));
                    return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
                  })()
                }</p>
              )}
              {product?.updated_at && (
                <p><span className="font-medium text-slate-700">Last upload:</span> {new Date(product.updated_at).toLocaleString()}</p>
              )}
            </div>
          )}

          <input type="file" className="text-sm text-slate-600 w-full"
            onChange={(e) => onMainFileChange(e.target.files?.[0] || null)} />
          {mainFile && (
            <p className="text-xs text-slate-400 truncate">
              {mainFile.name} — {(mainFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          {uploading.main && <ProgressBar value={mainProg} />}
          <button onClick={onUploadMain} disabled={!mainFile || uploading.main}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Upload className="h-3.5 w-3.5" />
            {uploading.main ? `Uploading ${mainProg}%…` : (product?.main_file_path ? 'Replace file' : 'Upload main file')}
          </button>
        </div>

        {/* Preview images */}
        <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Preview images</span>
            {product?.preview_images?.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {product.preview_images.length} image{product.preview_images.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <input type="file" multiple accept="image/*" className="text-sm text-slate-600 w-full"
            onChange={(e) => onPrevFilesChange(e.target.files)} />
          {prevFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {prevFiles.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} alt=""
                  className="w-full h-16 object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          )}
          {uploading.preview && <ProgressBar value={prevProg} />}
          <button onClick={onUploadPreview} disabled={!prevFiles.length || uploading.preview}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Upload className="h-3.5 w-3.5" />
            {uploading.preview ? `Uploading ${prevProg}%…` : 'Upload images'}
          </button>
        </div>
      </div>
    </section>

    {/* Current preview images */}
    {product?.preview_images?.length > 0 && (
      <section>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Current preview images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {product.preview_images.map((img, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white">
              <img src={img} alt="" className="w-full h-24 object-cover" />
              <button onClick={() => onRemovePreview(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* License */}
    {product?.license && (
      <section>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">License</h4>
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h5 className="font-semibold text-slate-800">{product.license.name}</h5>
              <p className="text-sm text-slate-500 mt-1">{product.license.description}</p>
            </div>
            {product.license.price_multiplier != null && (
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">Multiplier</p>
                <p className="text-xl font-bold text-emerald-600">×{product.license.price_multiplier}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    )}

    {/* SEO */}
    <section>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">SEO</h4>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Meta title</p>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {product?.meta_title || product?.title || <em className="text-slate-400">Not set</em>}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Meta description</p>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
            {product?.meta_description || product?.description || <em className="text-slate-400">Not set</em>}
          </p>
        </div>
      </div>
    </section>
  </div>
);

/* ── Analytics ────────────────────────────────────────────────────────── */
const AnalyticsTab = ({ analytics }) => {
  if (!analytics) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
      <BarChart3 className="h-12 w-12 mb-3" />
      <p className="text-sm text-slate-400">No analytics data available</p>
    </div>
  );

  const summaryCards = [
    { icon: Eye,       label: 'Total views',     value: fmt.num(analytics.total_views),     color: 'text-blue-600',    bg: 'bg-blue-50'    },
    { icon: DollarSign, label: 'Revenue',         value: fmt.price(analytics.total_revenue), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Download,  label: 'Downloads',        value: fmt.num(analytics.total_downloads), color: 'text-purple-600',  bg: 'bg-purple-50'  },
    { icon: TrendingUp, label: 'Conversion',      value: `${analytics.conversion_rate ?? 0}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`rounded-xl p-3 ${card.bg}`}>
              <Icon className={`h-4 w-4 mb-2 ${card.color}`} />
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Daily chart */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Daily views — last 30 days</h4>
        {analytics.daily_views?.some(d => d.views > 0) ? (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.daily_views}>
                  <defs>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={d => new Date(d).toLocaleDateString(undefined, { month:'short', day:'numeric' })} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    labelFormatter={d => new Date(d).toLocaleDateString()} />
                  <Area type="monotone" dataKey="views" name="Views"
                    stroke="#3b82f6" fill="url(#gv)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="sales" name="Sales"
                    stroke="#10b981" fill="url(#gs)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No view data for the last 30 days</p>
          </div>
        )}
      </div>

      {/* Countries */}
      {analytics.countries?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Geographic distribution</h4>
          <div className="space-y-2">
            {analytics.countries.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-sm">
                <span className="font-medium">{c.country}</span>
                <div className="flex gap-4 text-slate-500">
                  <span>{fmt.num(c.views)} views</span>
                  <span className="text-emerald-600 font-medium">{fmt.num(c.sales)} sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Reviews ──────────────────────────────────────────────────────────── */
const ReviewsTab = ({ reviews }) => {
  if (!reviews?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
      <MessageSquare className="h-12 w-12 mb-3" />
      <p className="text-sm text-slate-400">No reviews yet</p>
    </div>
  );

  const avg = reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
  const dist = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold text-slate-900">{avg.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 my-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {dist.map(({ n, count }) => {
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-slate-500 text-right">{n}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current shrink-0" />
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-slate-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="border border-slate-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Avatar src={r?.user?.avatar} name={r?.user?.name} className="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r?.user?.name || 'Anonymous'}</span>
                    {r?.is_verified_purchase && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                <p className="text-slate-600 text-sm">{r.comment ?? r.body ?? r.review ?? ''}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>{fmt.date(r.created_at)}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {r.helpful_count ?? r.helpful_votes ?? 0} helpful
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Moderation ───────────────────────────────────────────────────────── */
const ModerationTab = ({ product, note, setNote, onAction }) => {
  const cfg = STATUS[product?.status] || STATUS.draft;
  const StatusIcon = cfg.icon;

  const actions = [
    { status: 'approved',  label: 'Approve',  icon: CheckCircle,   cls: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100'    },
    { status: 'rejected',  label: 'Reject',   icon: XCircle,       cls: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-100'            },
    { status: 'suspended', label: 'Suspend',  icon: AlertTriangle, cls: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100' },
    { status: 'draft',     label: 'Draft',    icon: FileText,      cls: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'     },
  ];

  return (
    <div className="space-y-6">

      {/* Current status */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Current status</h4>
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color.split(' ')[1]?.replace('text-', 'text-')}`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">{cfg.label}</span>
              {product?.updated_at && (
                <span className="text-sm text-slate-400">· {fmt.date(product.updated_at)}</span>
              )}
            </div>
            {product?.reason && (
              <p className="text-sm text-slate-600 mt-1">{product.reason}</p>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Moderation note <span className="text-slate-400 font-normal">(optional)</span></h4>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note for the seller…"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {actions.map(({ status, label, icon: Icon, cls }) => (
            <button key={status} onClick={() => onAction(status)}
              disabled={product?.status === status}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {product?.status === status && <span className="ml-auto text-xs opacity-60">current</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
