/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  MessageSquare,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Camera,
  Upload,
  User,
  Send,
  AlertCircle,
  ShoppingBag,
  X,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart,
} from 'lucide-react';
import { Product, Order, Conversation, SellerProfile, LogoConfig } from '../types';
import AssigameLogo from './AssigameLogo';

interface SellerPerspectiveProps {
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string, sender: 'buyer' | 'seller') => void;
  activeSeller: SellerProfile;
  onLogout: () => void;
  onBackToShop: () => void;
  logoConfig?: LogoConfig;
}

const LOGO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart
};

export default function SellerPerspective({
  products,
  onAddProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  conversations,
  onSendMessage,
  activeSeller,
  onLogout,
  onBackToShop,
  logoConfig,
}: SellerPerspectiveProps) {
  // Navigation for Seller Panel
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'messages' | 'profile'>('dashboard');

  // Selected Conversational target in Seller Space
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [sellerMessageTxt, setSellerMessageTxt] = useState('');

  // Local helper states for creating a new product
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Sacs');
  const [customCategory, setCustomCategory] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Heritage Luxe');
  const [newProdPrice, setNewProdPrice] = useState<number>(85000);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(100000);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80');
  const [newProdColorStr, setNewProdColorStr] = useState('#4A1118, #E8E1D5, #1C1B1B');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // File input explorer reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop local visual support
  const [dragActive, setDragActive] = useState(false);

  // Computed metrics for active seller products
  const sellerProducts = useMemo(() => {
    return products.filter((p) => p.sellerName === activeSeller.storeName);
  }, [products, activeSeller]);

  const sellerOrders = useMemo(() => {
    // Show only orders related to this seller's products or items
    return orders.filter((o) => {
      const prod = products.find((p) => p.name === o.productName);
      return prod ? prod.sellerName === activeSeller.storeName : true;
    });
  }, [orders, products, activeSeller]);

  const totalEarnings = useMemo(() => {
    return sellerOrders
      .filter((o) => o.status !== 'Annulée')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [sellerOrders]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(droppedFile);
      setNewProdImage(objectUrl);
      setSelectedFileName(droppedFile.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setNewProdImage(objectUrl);
      setSelectedFileName(file.name);
    }
  };

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  const sendSellerMessage = () => {
    if (!sellerMessageTxt.trim()) return;
    onSendMessage(activeConversation.id, sellerMessageTxt, 'seller');
    setSellerMessageTxt('');
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const colors = newProdColorStr.split(',').map((c) => c.trim()).filter((c) => c.startsWith('#'));
    const finalCategory = newProdCategory === 'Autres' ? (customCategory.trim() || 'Autres') : newProdCategory;

    onAddProduct({
      name: newProdName,
      category: finalCategory,
      brand: newProdBrand,
      price: newProdPrice,
      originalPrice: newProdOriginalPrice || undefined,
      stock: newProdStock,
      description: newProdDesc || "Description de l'article de luxe produit par " + activeSeller.storeName,
      imageUrl: newProdImage,
      rating: 5.0,
      reviewsCount: 0,
      features: ['Certification d\'Origine', 'Éco-responsable', 'Garantie de fabrication'],
      colors: colors.length > 0 ? colors : ['#4A1118', '#717171'],
      sellerId: activeSeller.id,
      sellerName: activeSeller.storeName,
      status: 'active', // Published and immediately live since there is no admin!
      isHot: false,
    });

    // Reset Form fields
    setNewProdName('');
    setNewProdDesc('');
    setNewProdBrand('Heritage Luxe');
    setNewProdCategory('Sacs');
    setCustomCategory('');
    setNewProdPrice(85000);
    setNewProdOriginalPrice(100000);
    setNewProdStock(20);
    setNewProdImage('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80');
    setSelectedFileName(null);
    setIsAddingProduct(false);

    alert(`Votre article "${newProdName}" a été publié avec succès de manière instantanée ! Il est dorénavant visible et disponible pour tous les acheteurs du site public.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      
      {/* SELLER CONTROL LEFT SIDEBAR IN BURGUNDY */}
      <aside className="w-full lg:w-64 bg-shopera-dark lg:min-h-screen text-gray-300 p-6 flex flex-col justify-between border-r border-[#2C2C2C]">
        <div>
          {/* Brand/Role banner */}
          <div className="flex flex-col gap-1 mb-8 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-1">
              <AssigameLogo 
                className="text-lg text-white" 
                color="#FFFFFF"
              />
              <span className="text-[10px] bg-shopera-burgundy text-shopera-gold font-bold px-1.5 py-0.5 rounded ml-2 uppercase tracking-widest scale-90">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-shopera-gold font-mono uppercase tracking-wider block mt-1">
              {activeSeller.storeName}
            </span>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsAddingProduct(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 transition ${
                activeTab === 'dashboard' ? 'bg-shopera-burgundy text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 transition ${
                activeTab === 'products' ? 'bg-shopera-burgundy text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Gérer Mes Produits ({sellerProducts.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setIsAddingProduct(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 transition ${
                activeTab === 'orders' ? 'bg-shopera-burgundy text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Commandes Reçues ({sellerOrders.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('messages'); setIsAddingProduct(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 transition ${
                activeTab === 'messages' ? 'bg-shopera-burgundy text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages Clients</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setIsAddingProduct(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 transition ${
                activeTab === 'profile' ? 'bg-shopera-burgundy text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profil de Vente</span>
            </button>
          </nav>

          {/* Dynamic Utility Shortcuts to go back or disconnect */}
          <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
            <button
              onClick={onBackToShop}
              className="w-full text-left py-2 px-3 rounded text-[11px] font-bold tracking-wide uppercase transition border border-gray-700 hover:border-shopera-gold text-shopera-gold hover:bg-shopera-gold/5 flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-shopera-gold" />
              <span>Aller au site public</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left py-2 px-3 rounded text-[11px] font-bold tracking-wide uppercase transition border border-rose-950/40 hover:bg-rose-950/20 text-rose-400 flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        </div>

        {/* Status indicator down page */}
        <div className="mt-8 pt-4 border-t border-gray-800 text-[10px] text-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-400 uppercase font-bold text-[8px] tracking-wider">Passerelle Active</span>
          </div>
          <span>{(logoConfig?.text || 'ASSIGAME')} V3.4 Engine API</span>
        </div>
      </aside>

      {/* RENDER ACTIVE TAB BODY */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Header info greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-shopera-dark">
                  Tableau de bord de vente
                </h1>
                <p className="text-xs text-shopera-gray mt-1">
                  Bienvenue, <strong>{activeSeller.storeName}</strong>. Voici les performances consolidées de votre boutique exclusive.
                </p>
              </div>
              
              <button
                onClick={() => { setActiveTab('products'); setIsAddingProduct(true); }}
                className="bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                Ajouter un produit
              </button>
            </div>

            {/* Quick stats boxes row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-shopera-gray block mb-1">Réputation Vendeur</span>
                <span className="text-2xl font-extrabold text-shopera-dark">{activeSeller.rating || 4.8} / 5.0</span>
                <span className="block text-[10px] text-emerald-600 font-bold mt-1">Niveau d&apos;activité : Or</span>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-shopera-gray block mb-1">Articles en Vente</span>
                <span className="text-2xl font-extrabold text-shopera-dark">{sellerProducts.length}</span>
                <span className="block text-[10px] text-shopera-gray mt-1">
                  {sellerProducts.filter(p => p.status === 'pending').length} en attente d&apos;approbation
                </span>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-shopera-gray block mb-1">Commandes Générées</span>
                <span className="text-2xl font-extrabold text-shopera-dark">{sellerOrders.length}</span>
                <span className="block text-[10px] text-amber-600 font-bold mt-1">
                  {sellerOrders.filter(o => o.status === 'En traitement' || o.status === 'En attente').length} colis à traiter
                </span>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs bg-[#FAF7F2] border-shopera-gold/20">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-shopera-gray block mb-1">Revenus d&apos;Affaires</span>
                <span className="text-2xl font-extrabold text-[#6D141F]">{totalEarnings.toLocaleString('fr-FR')} FCFA</span>
                <span className="block text-[10px] text-shopera-gold font-bold mt-1">Calculé en temps réel</span>
              </div>
            </div>

            {/* Quick tips notice info */}
            <div className="bg-shopera-tan/40 border border-shopera-tan rounded-xl p-5 flex items-start gap-3 text-xs text-shopera-gray leading-relaxed">
              <AlertCircle className="w-5 h-5 text-shopera-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-shopera-dark uppercase block tracking-wider mb-1">Conseil d&apos;optimisation {(logoConfig?.text || 'ASSIGAME')}</span>
                Les acheteurs apprécient particulièrement les fiches produits comportant des images nettes et des dimensions claires. Enregistrez vos nouveautés en renseignant correctement les prix originaux d&apos;étiquette pour appliquer des bannières automatiques promotionnelles.
              </div>
            </div>

            {/* Two tables preview bottom layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Product brief */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <div className="flex justify-between items-baseline mb-4 pb-2 border-b border-gray-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-shopera-dark">Mes Fiches Produits Récentes</span>
                  <button onClick={() => setActiveTab('products')} className="text-shopera-burgundy text-[10px] font-bold hover:underline">Tout voir</button>
                </div>
                <div className="space-y-3">
                  {sellerProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs gap-4 p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <img src={p.imageUrl} className="w-8 h-8 object-contain bg-gray-100 rounded" />
                        <div>
                          <span className="font-extrabold block truncate max-w-[140px] text-shopera-dark">{p.name}</span>
                          <span className="text-[10px] text-shopera-gray">{p.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-shopera-burgundy block">{p.price.toLocaleString('fr-FR')} FCFA</span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {p.status === 'active' ? 'Approuvé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders brief */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <div className="flex justify-between items-baseline mb-4 pb-2 border-b border-gray-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-shopera-dark font-sans">Derniers achats reçus</span>
                  <button onClick={() => setActiveTab('orders')} className="text-shopera-burgundy text-[10px] font-bold hover:underline">Tout traiter</button>
                </div>
                <div className="space-y-3">
                  {sellerOrders.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-xs gap-4 p-2 rounded hover:bg-gray-50">
                      <div>
                        <span className="font-mono font-bold text-shopera-burgundy block">{o.id}</span>
                        <span className="text-shopera-gray text-[10px]">{o.productName} (x{o.quantity})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-shopera-dark block">{o.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        <span className="text-[9px] text-[#A67C00] font-sans font-bold block">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            {isAddingProduct ? (
              /* ADD PRODUCT PANEL - PAGE 4 */
              <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="font-extrabold text-sm uppercase text-shopera-dark tracking-wider">
                      Publier une nouvelle fiche produit
                    </h2>
                    <p className="text-[10px] text-shopera-gray mt-0.5">Décrivez votre produit de luxe pour obtenir l&apos;accord de l&apos;administrateur.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="p-1 hover:bg-gray-100 rounded text-shopera-dark"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitProduct} className="space-y-5 text-xs text-shopera-dark">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Nom de l&apos;article *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Montre Or 24 Carats"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Catégorie *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      >
                        <option value="Sacs">Sacs</option>
                        <option value="Meubles">Meubles</option>
                        <option value="Montres">Montres</option>
                        <option value="Chaussures">Chaussures</option>
                        <option value="Lunettes">Lunettes</option>
                        <option value="Parfums">Parfums</option>
                        <option value="Électroniques">Électroniques</option>
                        <option value="Bijoux & Joyaux">Bijoux & Joyaux</option>
                        <option value="Vêtements Mode">Vêtements Mode</option>
                        <option value="Art & Sculpture">Art & Sculpture</option>
                        <option value="Tissus & Pagnes">Tissus & Pagnes</option>
                        <option value="Beauté & Cosmetique">Beauté & Cosmetique</option>
                        <option value="Épices & Gastronomie">Épices & Gastronomie</option>
                        <option value="Maroquinerie">Maroquinerie</option>
                        <option value="Autres">Autres (Saisir manuellement)</option>
                      </select>

                      {newProdCategory === 'Autres' && (
                        <div className="mt-3 animate-fade-in">
                          <label className="block text-[10px] font-extrabold uppercase text-shopera-burgundy mb-1 flex items-center gap-1.5">
                            <span>Saisir votre catégorie personnalisée *</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Saisissez le nom de la catégorie (ex: Tapisserie, Vins Fins, Artisanat...)"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full bg-rose-50/20 border border-shopera-burgundy/40 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white font-medium text-xs placeholder:text-gray-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Marque Créateur</label>
                      <input
                        type="text"
                        placeholder="Ex: Yaoundé Heritage"
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Quantité en Stock</label>
                      <input
                        type="number"
                        min={1}
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Prix de vente (FCFA) *</label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Prix d&apos;origine barré (FCFA)</label>
                      <input
                        type="number"
                        value={newProdOriginalPrice}
                        onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Codes hex des couleurs de disponibles séparés par des virgules</label>
                    <input
                      type="text"
                      value={newProdColorStr}
                      onChange={(e) => setNewProdColorStr(e.target.value)}
                      placeholder="#4A1118, #FCF9F8, #1C1B1B"
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Description de l&apos;œuvre</label>
                    <textarea
                      rows={3}
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="Indiquez les détails de fabrication artisanale et de finition..."
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded focus:ring-1 focus:ring-shopera-burgundy bg-white"
                    />
                  </div>

                  {/* Drag-and-drop Visual support area with actual File Browser link */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-shopera-gray mb-1.5">Image de présentation</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        dragActive ? 'border-shopera-burgundy bg-shopera-burgundy/5' : 'border-gray-200 hover:border-shopera-burgundy'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-shopera-gray mb-2 animate-bounce" />
                      <span className="font-bold text-xs block text-shopera-dark">Glissez-déposez le fichier image</span>
                      <span className="text-[10px] text-shopera-gray mt-0.5">ou cliquez sur cette zone pour explorer et sélectionner une image</span>
                      
                      {newProdImage && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                          <img 
                            src={newProdImage} 
                            alt="Aperçu du produit" 
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-xs" 
                          />
                          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded text-[10px] text-shopera-gray">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{selectedFileName ? `Fichier : ${selectedFileName}` : 'Image active de démonstration'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission and close buttons */}
                  <div className="flex gap-2 pt-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="border border-gray-300 hover:bg-gray-50 font-bold px-5 py-2.5 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white font-bold px-6 py-2.5 rounded-lg shadow"
                    >
                      Soumettre à l&apos;approbation d&apos;Admin
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* PRODUCTS INVENTORY LIST */
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
                  <div>
                    <h2 className="font-extrabold text-sm uppercase text-shopera-dark">Mon Catalogue De Vente</h2>
                    <p className="text-[10px] text-shopera-gray mt-0.5">Retrouvez toutes vos fiches de boutique ci-dessous.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Publier un produit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sellerProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs relative flex flex-col justify-between">
                      <div className="aspect-square rounded-lg bg-shopera-tan flex items-center justify-center p-3 relative mb-3">
                        <img src={p.imageUrl} className="max-h-full max-w-full object-contain" />
                        
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shadow-sm ${
                          p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'active' ? 'En ligne' : 'En attente'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-shopera-gold font-mono font-bold uppercase block">{p.brand}</span>
                        <h4 className="font-extrabold text-sm text-shopera-dark truncate">{p.name}</h4>
                        <p className="text-[11px] text-shopera-gray line-clamp-2 mt-1 mb-3">{p.description}</p>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs mt-2">
                        <div className="font-sans font-semibold text-shopera-burgundy">
                          {p.price.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { onDeleteProduct(p.id); alert("Votre produit a été supprimé."); }}
                            className="p-1.5 rounded-full border border-gray-100 hover:border-rose-100 hover:text-rose-600 transition"
                            title="Supprimer cet article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          /* SELLER ORDERS QUEUE */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
              <h2 className="font-extrabold text-sm uppercase text-shopera-dark">Suivi Logistique Vendeur</h2>
              <p className="text-[10px] text-shopera-gray mt-0.5">Expédiez vos colis pour mettre automatiquement à jour les clients.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              {sellerOrders.length === 0 ? (
                <div className="py-12 text-center text-shopera-gray text-xs">
                  Aucune commande reçue à ce jour.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase text-shopera-gray font-bold">
                        <th className="py-2.5">N° Commande</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Client</th>
                        <th className="py-2.5">Produit</th>
                        <th className="py-2.5">Quantité</th>
                        <th className="py-2.5">Montant Brut</th>
                        <th className="py-2.5">Traitement Logistique</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-shopera-dark font-medium">
                      {sellerOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/40">
                          <td className="py-3 font-mono font-bold text-shopera-burgundy">{ord.id}</td>
                          <td className="py-3 text-[11px] text-shopera-gray">{ord.date}</td>
                          <td className="py-3 text-[11px] font-bold text-shopera-dark">
                            <div>Client Bastos</div>
                            <div className="text-[9px] text-shopera-gray font-normal font-sans">client.bastos@gmail.com</div>
                          </td>
                          <td className="py-3 flex items-center gap-2">
                            <img src={ord.productImage} className="w-5 h-5 object-contain rounded bg-shopera-tan" />
                            <span className="truncate max-w-[120px]">{ord.productName}</span>
                          </td>
                          <td className="py-3 font-mono">{ord.quantity}</td>
                          <td className="py-3 font-sans font-semibold text-shopera-burgundy">
                            {ord.totalAmount.toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="py-3">
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                onUpdateOrderStatus(ord.id, e.target.value as Order['status']);
                                alert(`Le statut de la commande ${ord.id} est maintenant : "${e.target.value}". L'acheteur en est notifié.`);
                              }}
                              className="bg-white border border-gray-200 py-1 px-2.5 rounded text-[10px] font-semibold leading-none text-shopera-dark"
                            >
                              <option value="En attente">En attente de validation</option>
                              <option value="En traitement">En traitement (Colis préparé)</option>
                              <option value="Expédiée">Expédiée (En transit)</option>
                              <option value="Livrée">Livrée avec succès</option>
                              <option value="Annulée">Annulée (Remboursé)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          /* SELLER CRM FEED MESSAGING */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3 max-h-[600px] h-[600px] animate-fade-in">
            {/* Conversation Selector Left */}
            <aside className="border-r border-gray-100 overflow-y-auto flex flex-col h-full bg-gray-50/50">
              <div className="p-4 border-b border-gray-100 bg-white">
                <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2">
                  CRM Direct Vendeur
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="w-full bg-gray-50 text-xs border border-gray-200 px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                      conv.id === selectedConvId ? 'bg-shopera-tan/40 border-l-4 border-shopera-burgundy' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-shopera-burgundy text-white flex items-center justify-center font-bold text-xs">
                      {conv.id === 'conv-1' ? 'CB' : 'SD'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-xs text-shopera-dark">
                          {conv.id === 'conv-1' ? 'Client Bastos (Client)' : 'Sophie (Acheteuse)'}
                        </span>
                        <span className="text-[9px] text-shopera-gray truncate pl-2">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-[11px] text-shopera-gray truncate mt-1 leading-snug">
                        {conv.lastMessageText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Conversation Window Right */}
            <main className="lg:col-span-2 flex flex-col h-full bg-[#FAF9F5]">
              <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-xs text-shopera-dark">
                    {activeConversation.id === 'conv-1' ? 'Client Bastos' : 'Sophie'}
                  </span>
                  <span className="text-[9px] text-emerald-650 font-bold block">Client Certifié de la Plateforme</span>
                </div>
                <div className="text-[10px] text-shopera-gray">
                  ID: {activeConversation.id}
                </div>
              </div>

              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                {[...activeConversation.messages].reverse().map((msg) => {
                  const isSeller = msg.sender === 'seller';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isSeller
                            ? 'bg-shopera-burgundy text-white rounded-br-none'
                            : 'bg-white text-shopera-dark border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-shopera-gray mt-1 px-1 font-mono">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>

              {/* Messaging Input */}
              <div className="bg-white border-t border-gray-100 p-4 flex items-center gap-2">
                <input
                  type="text"
                  value={sellerMessageTxt}
                  onChange={(e) => setSellerMessageTxt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendSellerMessage();
                  }}
                  placeholder="Répondre au client de manière chaleureuse..."
                  className="flex-1 bg-gray-50 border border-gray-200 pl-4 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                />
                <button
                  onClick={sendSellerMessage}
                  className="p-2 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light rounded-lg shadow cursor-pointer transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </main>
          </div>
        )}

        {activeTab === 'profile' && (
          /* SELLER PROFILE INFO WIDGET */
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 max-w-2xl mx-auto shadow-xs animate-fade-in space-y-6">
            <h2 className="font-extrabold text-sm uppercase text-shopera-dark tracking-wider pb-2 border-b border-gray-100">
              Profil du Revendeur Agréé
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-shopera-burgundy text-white flex items-center justify-center text-xl font-bold">
                {activeSeller.storeName[0]}
              </div>
              <div>
                <span className="font-extrabold text-base text-shopera-dark block">{activeSeller.storeName}</span>
                <span className="text-xs text-shopera-gold font-mono block">Enregistré au Cameroun</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-shopera-gray">
              <div className="bg-gray-50 border border-gray-100 p-3 rounded">
                <span className="block font-bold text-shopera-dark text-[9px] uppercase tracking-wider mb-0.5">Note Générale</span>
                <span>{activeSeller.rating || 4.8} / 5.0 étoiles sur l&apos;ensemble des livraisons</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded">
                <span className="block font-bold text-shopera-dark text-[9px] uppercase tracking-wider mb-0.5">Compte Bancaire</span>
                <span>Compte validé pour virements FCFA immédiats</span>
              </div>
            </div>

            <p className="text-xs text-shopera-gray leading-relaxed">
              Votre vitrine {(logoConfig?.text || 'ASSIGAME')} est active de manière permanente. Les administrateurs filtrent la qualité pour garantir un taux de litige inférieur à 0.5%. Les retards logistiques de plus de 4 jours peuvent entraîner une suspension temporaire des droits de vente.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
