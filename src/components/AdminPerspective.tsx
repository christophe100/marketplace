import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Activity, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  Settings, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { Product, Order, SellerProfile, LogoConfig } from '../types';
import AssigameLogo from './AssigameLogo';

interface AdminPerspectiveProps {
  products: Product[];
  orders: Order[];
  sellers: SellerProfile[];
  onUpdateSellers: (updated: SellerProfile[]) => void;
  onUpdateProducts: (updated: Product[]) => void;
  onUpdateOrders: (updated: Order[]) => void;
  logoConfig?: LogoConfig;
  onUpdateLogoConfig?: (cfg: LogoConfig) => void;
  onLogout: () => void;
}

export default function AdminPerspective({
  products,
  orders,
  sellers,
  onUpdateSellers,
  onUpdateProducts,
  onUpdateOrders,
  logoConfig,
  onUpdateLogoConfig,
  onLogout
}: AdminPerspectiveProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sellers' | 'products' | 'orders'>('dashboard');

  // Search & Filter state variables
  const [sellerSearch, setSellerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [sellerFilter, setSellerFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [productFilter, setProductFilter] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Local sync actions (also call backend for full-stack persistence)
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state data from backend
  const handleReloadData = async () => {
    setIsSyncing(true);
    try {
      const sRes = await fetch('/api/sellers');
      const pRes = await fetch('/api/products');
      const oRes = await fetch('/api/orders');
      
      if (sRes.ok && pRes.ok && oRes.ok) {
        const sData = await sRes.json();
        const pData = await pRes.json();
        const oData = await oRes.json();
        
        onUpdateSellers(sData.map((s: any) => ({ ...s, id: String(s.id) })));
        onUpdateProducts(pData.map((p: any) => ({
          ...p,
          id: String(p.id),
          sellerId: String(p.sellerId),
          colors: Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : [])
        })));
        onUpdateOrders(oData.map((o: any) => ({
          ...o,
          id: String(o.id),
          productId: String(o.productId),
          sellerId: String(o.sellerId)
        })));
      }
    } catch (err) {
      console.error('Failed to reload admin databases:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // 1. STATS CALCULATIONS
  const totalFinancialRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Annulée')
      .reduce((sum, current) => sum + current.totalAmount, 0);
  }, [orders]);

  const activeSellersCount = useMemo(() => {
    return sellers.filter(s => !s.isSuspended).length;
  }, [sellers]);

  const suspendedSellersCount = useMemo(() => {
    return sellers.filter(s => s.isSuspended).length;
  }, [sellers]);

  const outOfStockItems = useMemo(() => {
    return products.filter(p => p.stock === 0).length;
  }, [products]);

  // 2. DIAGRAM GRAPH DATA (SVG-based Interactive Chart for Revenue & Volume)
  const [diagMetric, setDiagMetric] = useState<'revenue' | 'volume'>('revenue');
  
  // Dynamic metrics per category
  const categoryChartStats = useMemo(() => {
    const categoriesMap: Record<string, { revenue: number, count: number }> = {};
    
    // Seed standard ones
    ['Sacs', 'Meubles', 'Montres', 'Chaussures', 'Parfums', 'Maroquinerie'].forEach((cat) => {
      categoriesMap[cat] = { revenue: 0, count: 0 };
    });

    products.forEach((p) => {
      const cat = p.category || 'Autres';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { revenue: 0, count: 0 };
      }
    });

    orders.forEach((o) => {
      if (o.status === 'Annulée') return;
      const associatedProduct = products.find(p => String(p.id) === String(o.productId));
      const cat = associatedProduct?.category || 'Autres';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { revenue: 0, count: 0 };
      }
      categoriesMap[cat].revenue += o.totalAmount;
      categoriesMap[cat].count += o.quantity;
    });

    return Object.entries(categoriesMap).map(([title, stats]) => ({
      name: title,
      revenue: stats.revenue,
      volume: stats.count
    })).filter(x => x.revenue > 0 || x.volume > 0 || ['Sacs', 'Montres', 'Maroquinerie'].includes(x.name));
  }, [products, orders]);

  // Find maximum metric for normalizing chart heights
  const maxMetricValue = useMemo(() => {
    const values = categoryChartStats.map(c => diagMetric === 'revenue' ? c.revenue : c.volume);
    const max = Math.max(...values, 100);
    return Math.ceil(max * 1.15); // Add 15% padding at top
  }, [categoryChartStats, diagMetric]);

  // 3. EDIT/SUSPEND HANDLERS (PERSISTENT & FAST LOCAL ADAPTATION)
  const handleToggleSuspendSeller = async (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    const action = seller.isSuspended ? 'unsuspend' : 'suspend';
    const confirmMsg = seller.isSuspended 
      ? `Voulez-vous autoriser à nouveau la boutique "${seller.storeName}" à réapparaître et vendre ses créations ?`
      : `Voulez-vous bloquer la boutique "${seller.storeName}" ? Cette action suspendra immédiatement ses privilèges de vente et de connexion.`;
    
    if (!window.confirm(confirmMsg)) return;

    // Call server API
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        onUpdateSellers(sellers.map(s => {
          if (s.id === sellerId) {
            return { ...s, isSuspended: !s.isSuspended, status: !s.isSuspended ? 'rejected' : 'approved' };
          }
          return s;
        }));
        alert(`Boutique mise à jour avec succès : ${seller.isSuspended ? 'Activée' : 'Suspendue'} !`);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Local fallback
      onUpdateSellers(sellers.map(s => {
        if (s.id === sellerId) {
          const nextSuspended = !s.isSuspended;
          return { ...s, isSuspended: nextSuspended, status: nextSuspended ? 'rejected' : 'approved' };
        }
        return s;
      }));
      alert(`Statut mis à jour localement (Persistance Secours).`);
    }
  };

  const handleDeleteProductAdmin = async (productId: string) => {
    const prod = products.find(p => String(p.id) === String(productId));
    if (!prod) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${prod.name}" (Boutique: ${prod.sellerName}) ? cette action est irréversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onUpdateProducts(products.filter(p => p.id !== productId));
        alert('Produit éliminé avec succès du catalogue Assigame.');
      } else {
        throw new Error();
      }
    } catch (err) {
      onUpdateProducts(products.filter(p => p.id !== productId));
      alert('Produit retiré du catalogue local.');
    }
  };

  const handleUpdateOrderStatusAdmin = async (orderId: string, nextStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        onUpdateOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        alert(`Commande #${orderId} mise à jour avec succès sur le statut : ${nextStatus}`);
      } else {
        throw new Error();
      }
    } catch (err) {
      onUpdateOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      alert(`Commande #${orderId} mise à jour localement.`);
    }
  };

  // Dynamic live customization config values
  const [tempLogoText, setTempLogoText] = useState(logoConfig?.text || 'ASSIGAME');
  const [tempColor, setTempColor] = useState(logoConfig?.bgColor || '#4A1118');
 
  const handleSaveLogoConfig = () => {
    if (onUpdateLogoConfig && logoConfig) {
      onUpdateLogoConfig({
        ...logoConfig,
        text: tempLogoText,
        bgColor: tempColor,
        textColor: tempColor,
      });
      alert('Branding et charte visuelle mis à jour avec satisfaction ! Ils sont appliqués en temps réel.');
    }
  };

  // Filtered lists
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchesSearch = s.storeName.toLowerCase().includes(sellerSearch.toLowerCase()) || 
                            s.ownerName.toLowerCase().includes(sellerSearch.toLowerCase()) || 
                            s.email.toLowerCase().includes(sellerSearch.toLowerCase());
      if (sellerFilter === 'suspended') return matchesSearch && s.isSuspended;
      if (sellerFilter === 'active') return matchesSearch && !s.isSuspended;
      return matchesSearch;
    });
  }, [sellers, sellerSearch, sellerFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                            p.brand.toLowerCase().includes(productSearch.toLowerCase()) || 
                            p.sellerName.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(productSearch.toLowerCase());
      if (productFilter === 'instock') return matchesSearch && p.stock > 0;
      if (productFilter === 'outofstock') return matchesSearch && p.stock === 0;
      return matchesSearch;
    });
  }, [products, productSearch, productFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                            o.productName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                            o.buyerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                            o.buyerEmail.toLowerCase().includes(orderSearch.toLowerCase());
      if (orderFilter !== 'all') return matchesSearch && o.status === orderFilter;
      return matchesSearch;
    });
  }, [orders, orderSearch, orderFilter]);

  return (
    <div id="admin-panel-root" className="min-h-screen bg-[#FDFBF9] text-gray-800 font-sans selection:bg-[#4A1118] selection:text-white pb-12 flex flex-col">
      
      {/* 2. ADMIN TOP NOTIFICATION BAR */}
      <div className="bg-[#4A1118] text-white text-xs py-2.5 px-6 font-sans flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <span className="font-extrabold uppercase tracking-widest text-[10px]">Espace Super-Admin Assigame</span>
        </div>
        <div className="flex items-center gap-4 text-rose-100">
          <span className="hidden sm:inline font-medium">Session: admin@assigame.com</span>
          <button 
            onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 transition px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border-none cursor-pointer"
          >
            Quitter la session
          </button>
        </div>
      </div>

      {/* 3. HERO HERO TITLE BAR */}
      <header className="bg-white border-b border-gray-200 px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <AssigameLogo className="text-xl" />
            <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Supervision</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Plein pouvoir de modération sur les créations, les boutiques et la fluidité des commandes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleReloadData}
            disabled={isSyncing}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisation...' : 'Rafraîchir les structures'}</span>
          </button>
          
          <button
            onClick={onLogout}
            className="bg-[#4A1118] hover:bg-[#60101B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retourner au site public</span>
          </button>
        </div>
      </header>

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1 shadow-2xs">
            <h3 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider px-3 mb-2.5">Commandes de Direction</h3>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition cursor-pointer border-none ${
                activeTab === 'dashboard' 
                  ? 'bg-rose-50 text-[#4A1118]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => setActiveTab('sellers')}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition cursor-pointer border-none ${
                activeTab === 'sellers' 
                  ? 'bg-rose-50 text-[#4A1118]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="flex-1">Gérer les Boutiques</span>
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{sellers.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition cursor-pointer border-none ${
                activeTab === 'products' 
                  ? 'bg-rose-50 text-[#4A1118]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="flex-1">Gérer le Catalogue</span>
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition cursor-pointer border-none ${
                activeTab === 'orders' 
                  ? 'bg-rose-50 text-[#4A1118]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="flex-1">Fluidifier les Commandes</span>
              <span className="bg-[#4A1118] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
            </button>
          </div>

          {/* QUICK CREDENTIAL SECURITY LOGS */}
          <div className="bg-rose-900/5 border border-[#4A1118]/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A1118]">
              <Info className="w-4 h-4" />
              <span>Rappel Identifiants Admin</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Pour des raisons de test ou d'accès d'évaluation en mode direct, voici les identifiants d'administration exclusifs :
            </p>
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 font-mono text-[10px] text-gray-700 space-y-1">
              <div>Email: <strong className="text-[#4A1118]">admin@assigame.com</strong></div>
              <div>Mot de passe: <strong className="text-[#4A1118]">AdminAssigame2026</strong></div>
            </div>
          </div>
        </aside>

        {/* INNER CONTENT FOR THE RELEVANT ACTIVE TAB */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: DASHBOARD MAIN SCREEN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* STATS MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition">
                  <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-[#4A1118]">
                    <Users className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-gray-900">{sellers.length}</span>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Vendeurs</p>
                    <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <span>{activeSellersCount} Actifs</span>
                      {suspendedSellersCount > 0 && <span className="text-rose-500">({suspendedSellersCount} Suspendus)</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition">
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <ShoppingBag className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-gray-900">{products.length}</span>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Catalogue</p>
                    <div className="text-[9px] font-bold text-amber-600">
                      {outOfStockItems > 0 ? `${outOfStockItems} Ruptures de Stock` : 'Tous les stocks approvisionnés'}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Activity className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-gray-900">{orders.length}</span>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Commandes Émises</p>
                    <div className="text-[9px] font-semibold text-gray-500">
                      {orders.filter(o => o.status === 'En attente').length} En attente d'évaluation
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:shadow-2xs transition">
                  <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xl font-bold text-gray-900">{(totalFinancialRevenue).toLocaleString('fr-FR')} F.CFA</span>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Volume Financier</p>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Calculé en temps réel</div>
                  </div>
                </div>

              </div>

              {/* CENTRAL CRITICAL DIAGRAM CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-3xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">Répartition Économique & Volumes d'Assigame</h3>
                    <p className="text-xs text-gray-500">Progression financière ou volumétrique calculée selon les retours physiques de commande par catégorie.</p>
                  </div>

                  {/* Mode Selector pills for Metric Diagram */}
                  <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setDiagMetric('revenue')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
                        diagMetric === 'revenue' 
                          ? 'bg-white text-[#4A1118] shadow-2xs' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Volume d'Affaire (F.CFA)
                    </button>
                    <button
                      onClick={() => setDiagMetric('volume')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
                        diagMetric === 'volume' 
                          ? 'bg-white text-[#4A1118] shadow-2xs' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Volume Ventes (unités)
                    </button>
                  </div>
                </div>

                {/* VISUAL DIAGRAM COMPONENT (ELEGANT DYNAMIC VECTOR PLAN) */}
                <div className="relative pt-6">
                  <div className="h-64 flex items-end gap-3 sm:gap-6 border-b border-gray-200 pb-2 relative z-10 px-4">
                    
                    {/* Background guidance gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                      {[0, 1, 2, 3].map((g) => (
                        <div key={g} className="w-full border-t border-gray-100 border-dashed h-0" />
                      ))}
                    </div>

                    {categoryChartStats.map((item, index) => {
                      const value = diagMetric === 'revenue' ? item.revenue : item.volume;
                      const percentage = Math.min(100, Math.max(5, (value / maxMetricValue) * 100));
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                          {/* Rich Floating Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded shadow-md pointer-events-none whitespace-nowrap font-medium text-center z-50">
                            <div><strong>{item.name}</strong></div>
                            <div>{diagMetric === 'revenue' ? `${item.revenue.toLocaleString('fr-FR')} FCFA` : `${item.volume} commandes`}</div>
                          </div>

                          {/* Interactive Bar Object */}
                          <div className="w-full bg-rose-50 rounded-t-lg relative overflow-hidden flex items-end h-48 sm:h-52">
                            <div 
                              style={{ height: `${percentage}%` }}
                              className="w-full bg-gradient-to-t from-[#4A1118]/80 to-[#4A1118] rounded-t-md hover:brightness-110 transition-all duration-300 relative group-hover:shadow-md"
                            />
                          </div>

                          {/* Label below */}
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                            {item.name}
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  {/* Left Legend Indicators */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mt-3 px-4">
                    <span>Performance : Maximum de {maxMetricValue.toLocaleString('fr-FR')} {diagMetric === 'revenue' ? 'F.CFA' : 'Commandes'}</span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2.5 h-2.5 bg-[#4A1118] rounded" />
                      <span>{diagMetric === 'revenue' ? 'Chiffres consolidés par catégorie d\'artisanat' : 'Nombre de paniers expédiés'}</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* QUICK RECENT LOG DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* RECENT BOUTIQUES REVIEWS */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#4A1118]" />
                      <span>Boutiques Enregistrées Récemment</span>
                    </h4>
                    <button 
                      onClick={() => setActiveTab('sellers')}
                      className="text-[10px] font-bold text-[#4A1118] uppercase tracking-wider hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {sellers.slice(0, 4).map((sel) => (
                      <div key={sel.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div>
                          <div className="font-bold text-xs text-gray-900 flex items-center gap-2">
                            <span>{sel.storeName}</span>
                            {sel.isSuspended ? (
                              <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded leading-none uppercase">Bloqué</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded leading-none uppercase">Actif</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">Créée le {sel.joinDate} • Prop: {sel.ownerName}</p>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-gray-400">ID: {sel.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRITICAL ACTIONS CORNER */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5 mb-3">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Console de Surveillance</span>
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      Votre compte administrateur bénéficie du droit d'annulation globale ou d'approbation d'urgence de n'importe quel actif de la plateforme marchande de luxe d'Assigame. 
                      Sélectionnez l'onglet correspondant à gauche pour débuter vos travaux de modération réglementaire.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveTab('sellers')}
                      className="bg-[#4A1118]/5 hover:bg-[#4A1118]/10 text-[#4A1118] text-xs font-semibold p-3 rounded-xl transition text-center border-none cursor-pointer"
                    >
                      Gérer boutiques
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="bg-[#4A1118]/5 hover:bg-[#4A1118]/10 text-[#4A1118] text-xs font-semibold p-3 rounded-xl transition text-center border-none cursor-pointer"
                    >
                      Modérer l'inventaire
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SELLERS DIRECTORY */}
          {activeTab === 'sellers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">Annuaire des Boutiques d'Artisans ({sellers.length})</h3>
                  <p className="text-xs text-gray-500">Listage exhaustif des boutiques enregistrées sur la plateforme. Possibilité de suspendre ou réhabiliter un créateur.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Statut :</span>
                  <select
                    value={sellerFilter}
                    onChange={(e: any) => setSellerFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4A1118]"
                  >
                    <option value="all">Toutes les Boutiques</option>
                    <option value="active">Actives Uniquement</option>
                    <option value="suspended">Suspendues Uniquement</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par boutique, nom de propriétaire, email ou ville..."
                  value={sellerSearch}
                  onChange={(e) => setSellerSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-xs rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>

              {/* Sellers table */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        <th className="p-4">Boutique & Détails</th>
                        <th className="p-4">Propriétaire</th>
                        <th className="p-4">WhatsApp & Mail</th>
                        <th className="p-4">Ville</th>
                        <th className="p-4">Création</th>
                        <th className="p-4 text-center">Statut</th>
                        <th className="p-4 text-right">Actions de Contrôle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredSellers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                            Aucun vendeur ne correspond à vos filtres actuels.
                          </td>
                        </tr>
                      ) : (
                        filteredSellers.map((sel) => {
                          const totalSellsCount = products.filter(p => p.sellerId === sel.id).length;
                          return (
                            <tr key={sel.id} className="hover:bg-gray-5/20 transition">
                              <td className="p-4">
                                <div className="font-bold text-gray-900 text-xs">{sel.storeName}</div>
                                <div className="text-[10px] text-gray-405 text-gray-400 font-semibold">{totalSellsCount} articles répertoriés</div>
                              </td>
                              <td className="p-4 text-xs">{sel.ownerName}</td>
                              <td className="p-4 space-y-0.5">
                                <div className="text-xs">{sel.phone}</div>
                                <div className="text-[10px] text-gray-400 font-normal select-all">{sel.email}</div>
                              </td>
                              <td className="p-4 text-xs">{sel.address}</td>
                              <td className="p-4 text-[10px] text-gray-500 whitespace-nowrap">{sel.joinDate || 'N/A'}</td>
                              <td className="p-4 text-center">
                                {sel.isSuspended ? (
                                  <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase leading-none">
                                    <Ban className="w-2.5 h-2.5" />
                                    <span>Suspendu</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase leading-none">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    <span>Actif</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleToggleSuspendSeller(sel.id)}
                                  className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border transition tracking-wider cursor-pointer ${
                                    sel.isSuspended 
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                                      : 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                                  }`}
                                >
                                  {sel.isSuspended ? 'Réhabiliter l\'Artisan' : 'Suspendre Vend.'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOGUE */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">Modération du Catalogue d'Artisanat ({products.length})</h3>
                  <p className="text-xs text-gray-500">Suppression définitive d'un article contrefait ou non-conforme, contrôle d'inventaire en direct.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">État :</span>
                  <select
                    value={productFilter}
                    onChange={(e: any) => setProductFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4A1118]"
                  >
                    <option value="all">Tous les Articles</option>
                    <option value="instock">Disponible en Stock</option>
                    <option value="outofstock">En Rupture de Stock</option>
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par nom de produit, marque, boutique créatrice ou catégorie..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-xs rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>

              {/* Grid or List of products */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        <th className="p-4">Visuel & Produit</th>
                        <th className="p-4">Catégorie</th>
                        <th className="p-4">Maison / Marque</th>
                        <th className="p-4">Boutique Origine</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-right">Tarif</th>
                        <th className="p-4 text-right">Modération</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                            Aucun produit répertorié sous ces paramètres.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/25 transition">
                            <td className="p-4 flex items-center gap-3">
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-gray-900 text-xs">{p.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium">ID: {p.id}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-rose-50 text-[#4A1118] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-semibold">{p.brand}</td>
                            <td className="p-4">
                              <div className="text-xs font-bold text-gray-900">{p.sellerName || 'Inconnu'}</div>
                              <div className="text-[9px] text-gray-400">ID Vendeur: {p.sellerId}</div>
                            </td>
                            <td className="p-4 text-center">
                              {p.stock === 0 ? (
                                <span className="text-rose-600 font-black text-xs uppercase tracking-wide">Épuisé</span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {p.stock} pces
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right text-xs font-bold text-gray-900">
                              {p.price.toLocaleString('fr-FR')} F.CFA
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteProductAdmin(p.id)}
                                className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:border-rose-600 p-2 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                                title="Supprimer définitivement cet article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS CONTROL ROOM */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">Fluidification & Validation Globale des Commandes ({orders.length})</h3>
                  <p className="text-xs text-gray-500">Ajustez les étapes critiques de transit (Attente, Traitement, Expédiée, Livrée, Annulée) en bypass direct pour assister les clients.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Filtrer par Transit :</span>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4A1118]"
                  >
                    <option value="all">Toutes les Étapes</option>
                    <option value="En attente">En attente de validation</option>
                    <option value="En traitement">En traitement de design</option>
                    <option value="Expédiée">Expédiée vers l'acheteur</option>
                    <option value="Livrée">Livrée avec succès</option>
                    <option value="Annulée">Annulée / Retournée</option>
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande, acheteur, email ou produit..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-xs rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>

              {/* Orders visual directory */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        <th className="p-4">ID & Date</th>
                        <th className="p-4">Aperçu & Article d'œuvre</th>
                        <th className="p-4">Détails de l'Acheteur</th>
                        <th className="p-4 text-center">Quantité</th>
                        <th className="p-4 text-right">Montant Global</th>
                        <th className="p-4 text-center">Étape de Transit</th>
                        <th className="p-4 text-right">Intervenir statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                            Aucune transaction ne répond à vos filtres de recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          // Beautiful badge styling based on orders status
                          let badgeStyle = "bg-gray-100 text-gray-750";
                          if (o.status === 'En attente') badgeStyle = "bg-blue-50 text-blue-800 border-blue-200";
                          else if (o.status === 'En traitement') badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                          else if (o.status === 'Expédiée') badgeStyle = "bg-indigo-50 text-indigo-800 border-indigo-200";
                          else if (o.status === 'Livrée') badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
                          else if (o.status === 'Annulée') badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";

                          return (
                            <tr key={o.id} className="hover:bg-gray-50/25 transition">
                              <td className="p-4 whitespace-nowrap">
                                <div className="font-bold text-gray-900 text-xs">CMD-#{o.id}</div>
                                <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span>{o.date}</span>
                                </div>
                              </td>
                              <td className="p-4 flex items-center gap-3">
                                {o.productImage && (
                                  <img 
                                    src={o.productImage} 
                                    alt={o.productName} 
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div>
                                  <div className="font-bold text-gray-900 text-xs">{o.productName}</div>
                                  <div className="text-[10px] text-gray-440 text-gray-400">Assoc. ID: {o.productId}</div>
                                </div>
                              </td>
                              <td className="p-4 space-y-0.5">
                                <div className="text-xs font-bold text-gray-800">{o.buyerName}</div>
                                <div className="text-[10px] text-gray-400 select-all font-normal">{o.buyerEmail}</div>
                              </td>
                              <td className="p-4 text-center font-bold text-gray-900">{o.quantity}</td>
                              <td className="p-4 text-right font-black text-gray-900 text-xs whitespace-nowrap">
                                {o.totalAmount.toLocaleString('fr-FR')} F.CFA
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block border text-[9px] font-extrabold px-2.5 py-1 tracking-wider uppercase rounded-full leading-none ${badgeStyle}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="relative inline-block">
                                  <select
                                    value={o.status}
                                    onChange={(e) => handleUpdateOrderStatusAdmin(o.id, e.target.value as Order['status'])}
                                    className="font-bold text-[10px] rounded-lg tracking-wide border border-gray-250 p-2 text-rose-950 bg-rose-50/10 hover:bg-rose-50 transition cursor-pointer font-sans pl-2.5 pr-8 appearance-none"
                                  >
                                    <option value="En attente">En attente</option>
                                    <option value="En traitement">En traitement</option>
                                    <option value="Expédiée">Expédiée</option>
                                    <option value="Livrée">Livrée</option>
                                    <option value="Annulée">Annulée</option>
                                  </select>
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
