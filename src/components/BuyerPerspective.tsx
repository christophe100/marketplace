/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Send,
  MessageSquare,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  Share2,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  Handshake,
  Menu,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Coins,
  Award,
  Flame,
  Palette,
  Settings,
} from 'lucide-react';
import { Product, Order, Conversation, CartItem, LogoConfig } from '../types';
import HeroSlideshow from './HeroSlideshow';
import LogoStudioPanel from './LogoStudioPanel';
import ProductCard from './ProductCard';
import Navbar from './Navbar';
import Footer from './Footer';
import CategoriesGrid from './CategoriesGrid';

interface BuyerPerspectiveProps {
  products: Product[];
  orders: Order[];
  conversations: Conversation[];
  cart: CartItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, quantity: number, color: string) => void;
  onRemoveFromCart: (productId: string, color: string) => void;
  onUpdateCartQuantity: (productId: string, color: string, quantity: number) => void;
  onCheckout: (buyerName: string, buyerEmail: string) => void;
  onSendMessage: (conversationId: string, text: string, sender: 'buyer' | 'seller') => void;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
  currentTab: 'home' | 'shop' | 'favorites' | 'chat' | 'profile';
  onChangeTab: (tab: 'home' | 'shop' | 'favorites' | 'chat' | 'profile') => void;
  categoryFilter: string | null;
  onSetCategoryFilter: (category: string | null) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
  loggedSeller: any;
  onEnterSellerSpace: (initialMode?: 'login' | 'signup') => void;
  logoConfig?: LogoConfig;
  onUpdateLogoConfig?: (config: LogoConfig) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Sacs: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&auto=format&fit=crop&q=80',
  Meubles: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=100&auto=format&fit=crop&q=80',
  Montres: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&auto=format&fit=crop&q=80',
  Chaussures: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&auto=format&fit=crop&q=80',
  Lunettes: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&auto=format&fit=crop&q=80',
  Parfums: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&auto=format&fit=crop&q=80',
};

const CATEGORIES = [
  'Tout',
  'Meubles',
  'Montres',
  'Sacs',
  'Chaussures',
  'Lunettes',
  'Parfums',
  'Électroniques',
  'Bijoux & Joyaux',
  'Vêtements Mode',
  'Art & Sculpture',
  'Tissus & Pagnes',
  'Beauté & Cosmetique',
  'Épices & Gastronomie',
  'Maroquinerie'
];

const LOGO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart,
  Coins,
  Award,
  Flame
};

export default function BuyerPerspective({
  products,
  orders,
  conversations,
  cart,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onCheckout,
  onSendMessage,
  selectedProductId,
  onSelectProduct,
  currentTab,
  onChangeTab,
  categoryFilter,
  onSetCategoryFilter,
  searchQuery,
  onSetSearchQuery,
  loggedSeller,
  onEnterSellerSpace,
  logoConfig,
  onUpdateLogoConfig,
}: BuyerPerspectiveProps) {
  // Local Filter Preferences
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isListView, setIsListView] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Dynamic categories list incorporating custom ones published by sellers
  const dynamicCategories = useMemo(() => {
    const list = [...CATEGORIES];
    products.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [products]);

  // Checkout Sim Info
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Active product details helper
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId && p.status === 'active');
  }, [products, selectedProductId]);

  const [detailColor, setDetailColor] = useState<string>('');
  const [detailQty, setDetailQty] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<'desc' | 'tech' | 'reviews'>('desc');

  // Interactive local message typing state
  const [typedMessage, setTypedMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');

  // Filtered public products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be approved / active
      if (p.status !== 'active') return false;

      // Category Scope Filter
      if (categoryFilter && categoryFilter !== 'Tout') {
        if (p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Search matching text
      if (searchQuery) {
        const text = (p.name + ' ' + p.description + ' ' + p.category + ' ' + p.brand).toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }

      // Brand selection widget
      if (selectedBrand) {
        if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // Price slider
      if (p.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default / brand-new
      return String(b.id).localeCompare(String(a.id));
    });
  }, [products, categoryFilter, searchQuery, selectedBrand, maxPrice, sortBy]);

  // Unique list of active product brands to display inside checkout filters
  const availableBrands = useMemo(() => {
    const list = products.filter(p => p.status === 'active').map((p) => p.brand);
    return Array.from(new Set(list));
  }, [products]);

  // Calculations for basket
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  // Select conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0];
  }, [conversations, activeConversationId]);

  const handleApplyCategory = (cat: string) => {
    onSetCategoryFilter(cat === 'Tout' ? null : cat);
    onChangeTab('shop');
    onSelectProduct(null);
  };

  const handleOpenProductDetails = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setDetailColor(prod.colors[0] || '#999999');
      setDetailQty(1);
      onSelectProduct(productId);
    }
  };

  const handleAddToCartFromDetails = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, detailQty, detailColor);
      setIsCartOpen(true);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    onCheckout(checkoutName || 'Client Anonyme', checkoutEmail || 'client@assigame.com');
    setIsCheckingOut(false);
    setIsCartOpen(false);
    alert("Votre commande a été passée avec succès ! Merci de votre confiance et d'encourager nos artisans locaux.");
    onChangeTab('shop'); // Return directly to active shop view
  };

  const sendBuyerChatMessage = (customText?: string) => {
    const textToSend = customText || typedMessage;
    if (!textToSend.trim()) return;
    onSendMessage(activeConversation.id, textToSend, 'buyer');
    if (!customText) setTypedMessage('');

    // Simulate reactive seller response after a small delay!
    setTimeout(() => {
      let responseText = "Merci pour votre message ! Notre équipe va analyser votre demande d'ici quelques minutes.";
      if (textToSend.toLowerCase().includes('disponible') || textToSend.toLowerCase().includes('stock')) {
        responseText = "Oui absolument ! Cet article est actuellement en stock dans nos dépôts et prêt pour l'envoi rapide.";
      } else if (textToSend.toLowerCase().includes('prix') || textToSend.toLowerCase().includes('promo')) {
        responseText = "Le prix affiché est notre meilleur tarif disponible. Nous offrons toutefois la livraison gratuite à partir de 50 000 FCFA.";
      } else if (textToSend.toLowerCase().includes('cadeau')) {
        responseText = "Bien sûr ! Nous pouvons emballer de façon élégante avec une boîte exclusive pour cet achat. Indiquez-le simplement au checkout.";
      }
      onSendMessage(activeConversation.id, responseText, 'seller');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-shopera-cream pb-12">
      {/* SHOPERA TOP NAVIGATION BAR */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onChangeTab={onChangeTab}
        onSelectProduct={onSelectProduct}
        currentTab={currentTab}
        selectedProductId={selectedProductId}
        searchQuery={searchQuery}
        onSetSearchQuery={onSetSearchQuery}
        favorites={favorites}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        logoConfig={logoConfig}
        onEnterSellerSpace={onEnterSellerSpace}
      />

      {/* RENDER ACTIVE SCREEN CONTENT */}
      {selectedProduct ? (
        /* PRODUCT DETAIL PAGE VIEW */
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
          {/* Breadcrumbs */}
          <nav className="text-xs text-shopera-gray mb-6 flex items-center gap-1.5">
            <span className="hover:underline cursor-pointer" onClick={() => { onSelectProduct(null); onChangeTab('home'); }}>Accueil</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:underline cursor-pointer" onClick={() => { onSelectProduct(null); onChangeTab('shop'); }}>{selectedProduct.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-shopera-dark font-medium">{selectedProduct.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl p-6 md:p-10 shadow-xs border border-gray-100">
            {/* Gallery images left */}
            <div>
              <div className="aspect-square rounded-xl overflow-hidden bg-shopera-tan border border-gray-100 flex items-center justify-center p-8 relative">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="max-h-full max-w-full object-contain rounded-lg drop-shadow-lg"
                />
                
                {selectedProduct.isHot && (
                  <span className="absolute top-4 left-4 bg-shopera-burgundy text-white text-[10px] tracking-wider font-extrabold uppercase px-2 py-0.5 rounded shadow">
                    ÉDITION LIMITÉE
                  </span>
                )}
              </div>

              {/* Angle Thumbnails */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="aspect-square rounded-lg border-2 border-shopera-burgundy p-1 bg-white cursor-pointer overflow-hidden flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} className="max-h-full object-contain" />
                </div>
                {/* Simulated other angles */}
                <div className="aspect-square rounded-lg border border-gray-200 p-1 hover:border-shopera-burgundy transition bg-white cursor-pointer overflow-hidden opacity-80 hover:opacity-100 flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} className="max-h-full object-contain rotate-12 scale-90" />
                </div>
                <div className="aspect-square rounded-lg border border-gray-200 p-1 hover:border-shopera-burgundy transition bg-white cursor-pointer overflow-hidden opacity-80 hover:opacity-100 flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} className="max-h-full object-contain -scale-x-100" />
                </div>
                <div className="aspect-square rounded-lg border border-gray-200 p-0.5 bg-gray-50 flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-4 h-4 text-shopera-gold animate-bounce" />
                  <span className="text-[8px] font-bold text-shopera-gray mt-1">Vue HD</span>
                </div>
              </div>
            </div>

            {/* Info and Actions Right */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs tracking-wider uppercase font-extrabold text-shopera-gold">
                    {selectedProduct.brand}
                  </span>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-shopera-tan px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-shopera-dark">{selectedProduct.rating}</span>
                    <span className="text-[10px] text-shopera-gray">({selectedProduct.reviewsCount} avis)</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-shopera-dark tracking-tight mb-3">
                  {selectedProduct.name}
                </h1>

                {/* Price Label */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-extrabold text-shopera-burgundy">
                    {selectedProduct.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-shopera-gray line-through">
                      {selectedProduct.originalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded ml-2">
                    En stock ({selectedProduct.stock} restants)
                  </span>
                </div>

                <p className="text-sm text-shopera-gray leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                {/* Color Chooser */}
                <div className="mb-6">
                  <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2">
                    Couleur :
                  </span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setDetailColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                          detailColor === color ? 'border-shopera-burgundy scale-105 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity Ticker */}
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2">
                      Quantité :
                    </span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-l-lg transition"
                      >
                        <Minus className="w-3.5 h-3.5 text-shopera-dark" />
                      </button>
                      <span className="px-4 font-mono font-semibold text-sm">
                        {detailQty}
                      </span>
                      <button
                        onClick={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 1))}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-r-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-shopera-dark" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 pt-6 flex gap-2">
                    <button
                      onClick={handleAddToCartFromDetails}
                      className="flex-1 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Ajouter au panier
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(selectedProduct, detailQty, detailColor);
                        setIsCheckingOut(true);
                        setIsCartOpen(true);
                      }}
                      className="flex-1 border-2 border-shopera-burgundy text-shopera-burgundy hover:bg-shopera-burgundy/5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150"
                    >
                      Acheter maintenant
                    </button>
                  </div>
                </div>

                {/* WhatsApp & SMS Actions as seen in Page 3 */}
                <div className="bg-shopera-tan/50 border border-shopera-tan rounded-xl p-4 mb-6">
                  <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2 text-center">
                    BESOIN D&apos;AIDE ? CONTRIBUTEUR UNIQUE :
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onChangeTab('chat');
                        onSelectProduct(null);
                        sendBuyerChatMessage(
                          `Bonjour, je suis intéressé par le produit "${selectedProduct.name}" au prix de ${selectedProduct.price} FCFA. Est-il disponible immédiatement ?`
                        );
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 shadow"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping"></span>
                      Discuter sur WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        onChangeTab('chat');
                        onSelectProduct(null);
                        sendBuyerChatMessage(
                          `SMS: Demande de renseignement pour ${selectedProduct.name}. Est-ce négociable ?`
                        );
                      }}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-shopera-dark font-semibold text-xs py-2 px-3 rounded flex items-center justify-center gap-2"
                    >
                      Envoyer un SMS
                    </button>
                  </div>
                </div>
              </div>

              {/* Small trust columns */}
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-[10px] text-shopera-gray">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-shopera-gold" />
                  <span>Livraison Rapide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-shopera-gold" />
                  <span>Retours sous 30 jours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-shopera-gold" />
                  <span>Paiement Sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details tabs Bottom */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-xs">
            <div className="flex border-b border-gray-200 mb-6 gap-6">
              <button
                onClick={() => setDetailTab('desc')}
                className={`py-3 text-xs uppercase tracking-wider font-extrabold ${
                  detailTab === 'desc' ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy' : 'text-shopera-gray'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setDetailTab('tech')}
                className={`py-3 text-xs uppercase tracking-wider font-extrabold ${
                  detailTab === 'tech' ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy' : 'text-shopera-gray'
                }`}
              >
                Informations complémentaires
              </button>
              <button
                onClick={() => setDetailTab('reviews')}
                className={`py-3 text-xs uppercase tracking-wider font-extrabold ${
                  detailTab === 'reviews' ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy' : 'text-shopera-gray'
                }`}
              >
                Avis ({selectedProduct.reviewsCount})
              </button>
            </div>

            {detailTab === 'desc' && (
              <div className="text-sm text-shopera-gray space-y-4">
                <p>{selectedProduct.description}</p>
                <h4 className="font-bold text-shopera-dark text-xs mt-4 uppercase">Caractéristiques Clés :</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedProduct.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {detailTab === 'tech' && (
              <div className="text-sm text-shopera-gray">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 font-bold text-shopera-dark w-1/3">Dimensions</td>
                      <td className="py-2.5">{selectedProduct.dimensions || 'Standard'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 font-bold text-shopera-dark">Marque / Fournisseur</td>
                      <td className="py-2.5">{selectedProduct.sellerName} (Vendeur Agréé {(logoConfig?.text || 'ASSIGAME')})</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 font-bold text-shopera-dark">Origine contrôlée</td>
                      <td className="py-2.5">Matériaux certifiés qualité supérieure Luxe</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-shopera-dark">Disponibilité d&apos;expédition</td>
                      <td className="py-2.5">Douala, Yaoundé, Bastos (Cameroun) et international express</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6 bg-shopera-tan/30 rounded-xl p-6">
                  <div className="text-center md:border-r border-gray-200 md:pr-8">
                    <span className="text-4xl font-extrabold text-shopera-burgundy">{selectedProduct.rating}</span>
                    <span className="block text-xs text-shopera-gray">sur 5.0</span>
                    <div className="flex gap-0.5 justify-center mt-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-sm text-shopera-dark">Totalement conquis par l&apos;élégance.</span>
                    <p className="text-xs text-shopera-gray mt-1 leading-relaxed">
                      98% de nos acheteurs évaluent positivement l&apos;emballage et la rapidité du vendeur <strong>{selectedProduct.sellerName}</strong>. Tous les commentaires sont audités par l&apos;intelligence du protocole {(logoConfig?.text || 'ASSIGAME')}.
                    </p>
                  </div>
                </div>

                {/* Simulated Buyer Reviews items */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs block text-shopera-dark">Aline Nguemo</span>
                      <span className="text-[10px] text-shopera-gray">Le 12 Juin 2026 à Yaoundé</span>
                    </div>
                    <div className="flex">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <p className="text-xs text-shopera-gray leading-relaxed pl-1">
                    « Rien à rajouter, le cuir est tout simplement d&apos;une robustesse incroyable, emballage d&apos;un luxe fou. Je me sens privilégiée. »
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STANDARD NAVIGATION SCENE DECIDER */
        <div>
          {currentTab === 'home' && (
            /* PUBLIC HOMEPAGE */
            <div className="animate-fade-in">
              {/* Premium Hero Section */}
              <section className="bg-gradient-to-b from-[#FDFBF9] to-[#F5F2ED] relative overflow-hidden px-4 md:px-12 py-12 md:py-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  
                  {/* Left Column Text details */}
                  <div className="z-10 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                    <div className="inline-flex items-center gap-1.5 bg-shopera-burgundy/5 px-3 py-1 rounded-full mb-4">
                      <Sparkles className="w-3.5 h-3.5 text-shopera-burgundy" />
                      <span className="text-shopera-burgundy font-bold text-[10px] tracking-wider uppercase">
                        Nouvelle Collection Héritage
                      </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-shopera-dark tracking-tight leading-tight mb-4">
                      Découvrez Les Meilleurs Produits
                    </h1>
                    
                    <p className="text-sm md:text-base text-shopera-gray leading-relaxed mb-8">
                      Trouvez des pièces d&apos;art et de design exclusives sélectionnées auprès de créateurs africains renommés. Faites vos achats en toute confiance et bénéficiez de garanties haut de gamme.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <button
                        onClick={() => handleApplyCategory('Tout')}
                        className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        Acheter maintenant
                      </button>
                      <button
                        onClick={() => handleApplyCategory('Tout')}
                        className="bg-white border border-gray-200 text-shopera-dark hover:bg-gray-50 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Explorer la boutique
                      </button>
                    </div>
                  </div>

                  {/* Right Column Handbag showcase */}
                  <HeroSlideshow />
                </div>
              </section>

              {/* Trust Badges Bar */}
              <section className="bg-white py-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-shopera-dark">Livraison gratuite</h4>
                      <p className="text-[10px] text-shopera-gray">Dès 50 000 FCFA d&apos;achat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-shopera-dark">Retours faciles</h4>
                      <p className="text-[10px] text-shopera-gray">Satisfait ou remboursé sous 30j</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-shopera-dark">Paiement sécurisé</h4>
                      <p className="text-[10px] text-shopera-gray">Cryptage SSL 100% garanti</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-shopera-dark">Support 24/7</h4>
                      <p className="text-[10px] text-shopera-gray">Assistance téléphonique & WhatsApp</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Popular Categories Grid */}
              <CategoriesGrid onSelectCategory={handleApplyCategory} />

              {/* Nouveautés - Two Products Spotlight Row with beautiful card style */}
              <section className="py-16 bg-gray-50 border-t border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                  <div className="text-center max-w-sm mx-auto mb-12">
                    <h2 className="text-xl md:text-2xl font-extrabold text-shopera-dark tracking-tight">
                      Nouveautés & Coups de Cœur
                    </h2>
                    <p className="text-xs text-shopera-gray mt-1">Les derniers lancements validés par l&apos;équipe.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Big Spotlight item 1 */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden shadow-xs hover:shadow transition duration-200">
                      <span className="absolute top-4 left-4 bg-amber-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                        PREMIUM LISTING
                      </span>
                      
                      <div className="w-full sm:w-1/2 aspect-square bg-[#FAF7F2] rounded-xl flex items-center justify-center p-4">
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                          alt="Casques Audio"
                          className="max-h-full object-contain transform -rotate-12"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <span className="text-[10px] tracking-wider uppercase font-extrabold text-shopera-gold block mb-1">
                            TECH LUXE
                          </span>
                          <h3 className="font-extrabold text-shopera-dark text-lg leading-snug hover:text-shopera-burgundy cursor-pointer" onClick={() => handleOpenProductDetails('prod-8')}>
                            Casque Audio Studio-X
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            ))}
                            <span className="text-[10px] font-semibold text-shopera-gray">(42 avis)</span>
                          </div>
                          
                          <p className="text-xs text-shopera-gray leading-relaxed mb-3 line-clamp-2">
                            Une clarté sonore d&apos;exception avec une isolation phonique active.
                          </p>
                        </div>

                        <div>
                          <div className="text-lg font-sans font-semibold text-[#6D141F] mb-3">
                            159 000 FCFA
                          </div>
                          <button
                            onClick={() => handleOpenProductDetails('prod-8')}
                            className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            DÉCOUVRIR LE PRODUIT
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Big Spotlight item 2 */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden shadow-xs hover:shadow transition duration-200">
                      <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                        CONSEILLÉ
                      </span>
                      
                      <div className="w-full sm:w-1/2 aspect-square bg-[#FAF7F2] rounded-xl flex items-center justify-center p-4">
                        <img
                          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
                          alt="Smartphone Pro"
                          className="max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <span className="text-[10px] tracking-wider uppercase font-extrabold text-shopera-gold block mb-1">
                            CYBER ELITE
                          </span>
                          <h3 className="font-extrabold text-shopera-dark text-lg leading-snug hover:text-shopera-burgundy cursor-pointer" onClick={() => handleOpenProductDetails('prod-7')}>
                            Smartphone Pro Max X30
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            ))}
                            <span className="text-[10px] font-semibold text-shopera-gray">(89 avis)</span>
                          </div>
                          
                          <p className="text-xs text-shopera-gray leading-relaxed mb-3 line-clamp-2">
                            La puissance ultime du réseau local et de la triple camera 108Mpx.
                          </p>
                        </div>

                        <div>
                          <div className="text-lg font-sans font-semibold text-[#6D141F] mb-3">
                            699 000 FCFA
                          </div>
                          <button
                            onClick={() => handleOpenProductDetails('prod-7')}
                            className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            DÉCOUVRIR LE PRODUIT
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Newsletter Callout area */}
              <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
                <div className="bg-shopera-burgundy rounded-3xl text-white py-12 px-8 md:px-16 text-center relative overflow-hidden border border-rose-950/20 shadow-xl">
                  {/* Backdrop lights */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-shopera-gold/15 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative z-10 max-w-lg mx-auto">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                      Rejoignez le club {(logoConfig?.text || 'ASSIGAME').toUpperCase()}
                    </h2>
                    <p className="text-xs text-rose-100/70 mb-8 leading-relaxed">
                      Abonnez-vous pour recevoir des offres exclusives, des invitations à nos ventes privées et un bon de réduction de 10% sur votre première commande d&apos;exception.
                    </p>

                    <form onSubmit={(e) => { e.preventDefault(); alert("Merci ! Vous êtes inscrit à la newsletter " + (logoConfig?.text || 'ASSIGAME') + "."); }} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        required
                        placeholder="Votre adresse email..."
                        className="flex-1 bg-white/10 border border-white/20 pl-4 pr-3 py-3 rounded-lg text-xs placeholder-rose-200/50 focus:outline-none focus:ring-1 focus:ring-white bg-white/10 text-white"
                      />
                      <button
                        type="submit"
                        className="bg-white text-shopera-burgundy hover:bg-rose-50 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition"
                      >
                        S&apos;abonner
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            </div>
          )}

          {currentTab === 'shop' && (
            /* PRODUCT CATALOGUE PAGE */
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Sidebar Filters panel */}
                <aside className="w-full lg:w-1/4 flex flex-col gap-6">
                  
                  {/* Category Filter Box */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span>Catégories</span>
                      <Filter className="w-4 h-4 text-shopera-gray" />
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {dynamicCategories.map((cat) => {
                        const isSelected = (cat === 'Tout' && !categoryFilter) || (categoryFilter === cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => onSetCategoryFilter(cat === 'Tout' ? null : cat)}
                            className={`text-left text-xs py-2 px-3 rounded-md transition-all ${
                              isSelected
                                ? 'bg-[#FAF7F2] text-shopera-burgundy font-bold border-l-2 border-shopera-burgundy'
                                : 'text-shopera-gray hover:text-shopera-dark hover:bg-gray-50'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Filter Slider */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                      Filtrer par Prix (FCFA)
                    </h3>
                    <input
                      type="range"
                      min={10000}
                      max={1000000}
                      step={10000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shopera-burgundy"
                    />
                    <div className="flex justify-between items-center text-xs text-shopera-gray mt-2 font-mono">
                      <span>10 000 FCFA</span>
                      <span className="text-shopera-burgundy font-semibold">
                        {maxPrice.toLocaleString('fr-FR')} FCFA max
                      </span>
                    </div>
                  </div>

                  {/* Brands selector widget */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                      Marques
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      <label className="flex items-center gap-2 text-xs text-shopera-gray cursor-pointer">
                        <input
                          type="radio"
                          name="brand_filter"
                          checked={selectedBrand === ''}
                          onChange={() => setSelectedBrand('')}
                          className="rounded text-shopera-burgundy focus:ring-rose-950 border-gray-300"
                        />
                        <span>Toutes les marques</span>
                      </label>
                      {availableBrands.map((b) => (
                        <label key={b} className="flex items-center gap-2 text-xs text-shopera-gray cursor-pointer">
                          <input
                            type="radio"
                            name="brand_filter"
                            checked={selectedBrand === b}
                            onChange={() => setSelectedBrand(b)}
                            className="rounded text-shopera-burgundy focus:ring-rose-950 border-gray-300"
                          />
                          <span>{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Right Content listings */}
                <main className="flex-1">
                  
                  {/* Results Header options */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-shopera-gray text-center sm:text-left">
                      Nous avons trouvé <strong className="text-shopera-dark font-bold">{filteredProducts.length}</strong> produits d&apos;exception.
                      {categoryFilter && (
                        <span> pour la catégorie <strong className="text-shopera-burgundy">{categoryFilter}</strong></span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-shopera-gray hidden sm:inline">Trier par :</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs leading-none focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                        >
                          <option value="recent">Plus récent</option>
                          <option value="price-asc">Prix croissant</option>
                          <option value="price-desc">Prix décroissant</option>
                          <option value="rating">Meilleures notes</option>
                        </select>
                      </div>

                      {/* Display toggle */}
                      <div className="flex items-center border border-gray-200 rounded-lg p-0.5">
                        <button
                          onClick={() => setIsListView(false)}
                          className={`p-1.5 rounded ${!isListView ? 'bg-shopera-tan text-shopera-burgundy' : 'text-shopera-gray'}`}
                          title="Grille"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsListView(true)}
                          className={`p-1.5 rounded ${isListView ? 'bg-shopera-tan text-shopera-burgundy' : 'text-shopera-gray'}`}
                          title="Liste"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Grid or List list output */}
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl py-16 px-4 text-center border border-gray-100">
                      <SlidersHorizontal className="w-12 h-12 text-shopera-gray/30 mx-auto mb-4" />
                      <h4 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider">Aucun produit</h4>
                      <p className="text-xs text-shopera-gray mt-1.5 max-w-sm mx-auto">
                        Nous n&apos;avons pas d&apos;articles satisfaisant ces filtres ou cette recherche. Essayez de réinitialiser vos paramètres.
                      </p>
                      <button
                        onClick={() => {
                          onSetCategoryFilter(null);
                          onSetSearchQuery('');
                          setSelectedBrand('');
                          setMaxPrice(1000000);
                        }}
                        className="mt-4 inline-block bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light font-bold text-xs uppercase px-4 py-2 rounded-lg"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  ) : (
                    <div className={isListView ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"}>
                      {filteredProducts.map((p) => {
                        const isFav = favorites.includes(p.id);
                        return (
                          <ProductCard
                            key={p.id}
                            product={p}
                            isFav={isFav}
                            isListView={isListView}
                            onToggleFavorite={onToggleFavorite}
                            onViewDetails={handleOpenProductDetails}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Simple pagination element */}
                  <div className="flex justify-center items-center gap-1.5 mt-10">
                    <button className="px-3 py-1.5 rounded border border-gray-200 text-xs text-shopera-gray hover:bg-gray-50" disabled>Précédent</button>
                    <button className="px-3 py-1.5 rounded border-2 border-shopera-burgundy bg-white text-xs font-bold text-shopera-burgundy">1</button>
                    <button className="px-3 py-1.5 rounded border border-gray-200 text-xs text-shopera-gray hover:bg-gray-50">2</button>
                    <button className="px-3 py-1.5 rounded border border-gray-200 text-xs text-shopera-gray hover:bg-gray-50">3</button>
                    <span className="text-shopera-gray px-1">...</span>
                    <button className="px-3 py-1.5 rounded border border-gray-200 text-xs text-shopera-gray hover:bg-gray-50">8</button>
                    <button className="px-3 py-1.5 rounded border border-gray-200 text-xs text-shopera-gray hover:bg-gray-50">Suivant</button>
                  </div>
                </main>
              </div>
            </div>
          )}

          {currentTab === 'favorites' && (
            /* FAVORITES SCREEN */
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-extrabold text-shopera-dark tracking-tight mb-2">
                Mes Favoris
              </h2>
              <p className="text-xs text-shopera-gray mb-8">Les articles d&apos;exception que vous avez sauvegardés.</p>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-xl py-12 px-4 text-center border border-gray-100 max-w-md mx-auto">
                  <Heart className="w-12 h-12 text-shopera-gray/30 mx-auto mb-4" />
                  <h4 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider">Aucun favori</h4>
                  <p className="text-xs text-shopera-gray mt-1">Explorez le catalogue et cliquez sur le cœur pour sauvegarder des pièces uniques.</p>
                  <button
                    onClick={() => onChangeTab('shop')}
                    className="mt-5 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light font-bold text-xs uppercase px-5 py-2.5 rounded-lg shadow"
                  >
                    Parcourir les produits
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p) => favorites.includes(p.id) && p.status === 'active')
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-shopera-burgundy transition-all p-4 relative group"
                      >
                        <div className="aspect-square bg-shopera-tan rounded-lg overflow-hidden flex items-center justify-center p-4 relative">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain cursor-pointer"
                            onClick={() => handleOpenProductDetails(p.id)}
                          />
                          <button
                            onClick={() => onToggleFavorite(p.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-shopera-burgundy shadow-xs"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <h4
                          onClick={() => handleOpenProductDetails(p.id)}
                          className="font-bold text-xs text-shopera-dark mt-3 truncate hover:text-shopera-burgundy cursor-pointer"
                        >
                          {p.name}
                        </h4>
                        <div className="text-xs font-sans font-semibold text-shopera-burgundy mt-1.5">
                          {p.price.toLocaleString('fr-FR')} FCFA
                        </div>
                        <button
                          onClick={() => handleOpenProductDetails(p.id)}
                          className="w-full mt-3 bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded transition"
                        >
                          Acheter
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'chat' && (
            /* PERSISTENT MESSAGING SCREEN */
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-4 max-h-[600px] h-[600px]">
                
                {/* Conversations column left */}
                <aside className="border-r border-gray-100 overflow-y-auto flex flex-col h-full bg-gray-50/55">
                  <div className="p-4 border-b border-gray-100 bg-white">
                    <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2">
                      Messagerie Directe
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher une boutique..."
                        className="w-full bg-gray-50 text-xs border border-gray-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                          conv.id === activeConversationId ? 'bg-[#FAF7F2] border-l-4 border-shopera-burgundy' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-shopera-tan flex items-center justify-center font-bold text-shopera-burgundy text-xs">
                          {conv.sellerName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-xs text-shopera-dark truncate">{conv.sellerName}</span>
                            <span className="text-[9px] text-shopera-gray whitespace-nowrap">{conv.lastMessageTime}</span>
                          </div>
                          <p className="text-[11px] text-shopera-gray truncate mt-1 leading-snug">
                            {conv.lastMessageText}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-shopera-burgundy text-white text-[8px] font-mono font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Conversation Chat box middle/right */}
                <main className="lg:col-span-3 flex flex-col h-full bg-[#FAF9F5]">
                  {/* Top Bar chat header */}
                  <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-shopera-burgundy flex items-center justify-center text-white font-bold text-xs">
                        {activeConversation.sellerName[0]}
                      </div>
                      <div>
                        <span className="block font-bold text-xs text-shopera-dark">{activeConversation.sellerName}</span>
                        <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          En ligne (Conseiller de Vente)
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-shopera-gray">
                      ID: {activeConversation.id}
                    </div>
                  </div>

                  {/* Messages list scroll area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                    {/* Reverse to show latest bottom */}
                    {[...activeConversation.messages].reverse().map((msg) => {
                      const isMe = msg.sender === 'buyer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                              isMe
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

                    <div className="text-center py-2">
                      <span className="bg-amber-100/60 border border-amber-200/50 text-[#8B5E3C] text-[10px] font-semibold px-3 py-1 rounded-full">
                        Chat crypté avec {activeConversation.sellerName}
                      </span>
                    </div>
                  </div>

                  {/* Quick responses list for instant demo play */}
                  <div className="bg-white border-t border-gray-100 p-2 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
                    <button
                      onClick={() => sendBuyerChatMessage("Bonjour ! Est-ce qu'il reste du stock sur ce modèle ?")}
                      className="inline-block bg-shopera-tan hover:bg-shopera-burgundy hover:text-white px-3 py-1 rounded-full text-[10px] font-bold text-shopera-burgundy transition"
                    >
                      Demande de stock
                    </button>
                    <button
                      onClick={() => sendBuyerChatMessage("Puis-je avoir un emballage cadeau haut de gamme s'il vous plaît ?")}
                      className="inline-block bg-shopera-tan hover:bg-shopera-burgundy hover:text-white px-3 py-1 rounded-full text-[10px] font-bold text-shopera-burgundy transition"
                    >
                      Emballage cadeau ?
                    </button>
                    <button
                      onClick={() => sendBuyerChatMessage("Quels sont les délais d'expédition vers mon adresse ?")}
                      className="inline-block bg-shopera-tan hover:bg-shopera-burgundy hover:text-white px-3 py-1 rounded-full text-[10px] font-bold text-shopera-burgundy transition"
                    >
                      Délais d&apos;expédition
                    </button>
                  </div>

                  {/* Typing input panel */}
                  <div className="bg-white border-t border-gray-100 p-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendBuyerChatMessage();
                      }}
                      placeholder="Écrivez votre message ici de manière fluide..."
                      className="flex-1 bg-gray-50 border border-gray-200 pl-4 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                    />
                    <button
                      onClick={() => sendBuyerChatMessage()}
                      className="p-2 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light rounded-lg shadow hover:scale-105 active:scale-95 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </main>
              </div>
            </div>
          )}

          {currentTab === 'profile' && (
            /* MY ACCOUNT AND ORDER LOGS - PAGE 4 */
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in font-sans">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Account card profile widget left */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-shopera-burgundy text-white flex items-center justify-center font-bold text-xl mb-3">
                    PV
                  </div>
                  <h3 className="font-extrabold text-sm text-shopera-dark">Profil Visiteur</h3>
                  <p className="text-[10px] text-shopera-gray">Acheteur Libre</p>
                  
                  <div className="w-full mt-6 space-y-2 border-t border-gray-100 pt-4 text-xs text-left text-shopera-gray">
                    <div>
                      <span className="block font-bold text-shopera-dark text-[10px] uppercase">Réseau d&apos;expédition</span>
                      <span>Yaoundé, Cameroun</span>
                    </div>
                    <div>
                      <span className="block font-bold text-shopera-dark text-[10px] uppercase">Email</span>
                      <span>visiteur@assigame.com</span>
                    </div>
                  </div>
                </div>

                {/* Main Order Grid logs table right */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                  <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                    <div>
                      <h2 className="font-extrabold text-sm uppercase tracking-wider text-shopera-dark">
                        Mes commandes historiques
                      </h2>
                      <p className="text-[10px] text-shopera-gray">Consultez l&apos;évolution de vos livraisons.</p>
                    </div>
                    <span className="bg-shopera-tan text-shopera-burgundy text-[10px] font-bold px-3 py-1 rounded">
                      Commandes Totales : {orders.length}
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-shopera-gray">
                      Aucune commande enregistrée pour l&apos;instant.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] uppercase text-shopera-gray">
                            <th className="py-2.5 font-bold">Numéro</th>
                            <th className="py-2.5 font-bold">Date</th>
                            <th className="py-2.5 font-bold">Produit</th>
                            <th className="py-2.5 font-bold">Quantité</th>
                            <th className="py-2.5 font-bold">Total</th>
                            <th className="py-2.5 font-bold">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-shopera-dark font-medium">
                          {orders.map((ord) => {
                            let statusColor = 'bg-gray-100 text-gray-700';
                            if (ord.status === 'Livrée') statusColor = 'bg-emerald-50 text-emerald-700 font-bold';
                            if (ord.status === 'En traitement') statusColor = 'bg-amber-50 text-amber-700';
                            if (ord.status === 'Expédiée') statusColor = 'bg-blue-50 text-blue-700';
                            if (ord.status === 'Annulée') statusColor = 'bg-rose-50 text-rose-700';
                            if (ord.status === 'En attente') statusColor = 'bg-purple-50 text-purple-700 animate-pulse';

                            return (
                              <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                                <td className="py-3 font-mono font-bold text-shopera-burgundy">{ord.id}</td>
                                <td className="py-3 text-[11px] text-shopera-gray">{ord.date}</td>
                                <td className="py-3 flex items-center gap-2">
                                  <img src={ord.productImage} className="w-6 h-6 object-contain rounded bg-shopera-tan" />
                                  <span className="truncate max-w-[120px] md:max-w-[200px]" title={ord.productName}>
                                    {ord.productName}
                                  </span>
                                </td>
                                <td className="py-3 font-mono">{ord.quantity}</td>
                                <td className="py-3 font-mono font-bold text-shopera-dark">
                                  {ord.totalAmount.toLocaleString('fr-FR')} FCFA
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap ${statusColor}`}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bg-[#FCF9F8] border border-gray-100 rounded-lg p-4 mt-6 text-[11px] text-shopera-gray flex items-center justify-between">
                    <div>
                      💡 Des doubts sur un colis ? Contactez le service clients <strong>{(logoConfig?.text || 'ASSIGAME').toUpperCase()}</strong> disponible 24h/24.
                    </div>
                    <button
                      onClick={() => onChangeTab('chat')}
                      className="bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded transition"
                    >
                      Discuter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SHOPPING CART BOTTOM DRAWER / PANEL INTERACTIVES */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-shopera-burgundy animate-bounce" />
                <span className="font-extrabold text-sm uppercase text-shopera-dark tracking-wider">
                  Mon Panier ({cart.length})
                </span>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); setIsCheckingOut(false); }}
                className="p-1 hover:bg-gray-200 rounded-md transition"
              >
                <X className="w-5 h-5 text-shopera-dark" />
              </button>
            </div>

            {/* Content list or checkout form toggler */}
            {isCheckingOut ? (
              /* CHECKOUT FORM VIEW */
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-center pb-2">
                  <span className="text-xs font-bold text-shopera-burgundy uppercase block">Finaliser la Commande</span>
                  <span className="text-[10px] text-shopera-gray">Veuillez renseigner vos coordonnées d&apos;expédition.</span>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-shopera-dark uppercase mb-1">Nom Complet</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded text-xs focus:ring-1 focus:ring-shopera-burgundy bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-shopera-dark uppercase mb-1">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded text-xs focus:ring-1 focus:ring-shopera-burgundy bg-white"
                    />
                  </div>

                  <div className="bg-shopera-tan/50 p-3 rounded-lg text-xs space-y-1.5 text-shopera-gray border border-shopera-tan">
                    <div className="flex justify-between font-bold text-shopera-dark border-b border-gray-200 pb-1.5 mb-1.5">
                      <span>Total à régler :</span>
                      <span className="font-sans font-semibold text-shopera-burgundy">{cartSubtotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      🔒 En confirmant, votre commande sera créée en mode <strong>« En attente de validation »</strong> et sera immédiatement synchronisée avec les tableaux de bord des vendeurs concernés et de l&apos;administrateur.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 border border-gray-300 py-3 rounded-lg text-xs font-bold text-shopera-dark"
                    >
                      Retourner au panier
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow"
                    >
                      Confirmer l&apos;achat
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* BASKET ITEMS LIST */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-shopera-gray">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-xs">Votre panier d&apos;exception est vide.</p>
                    <button
                      onClick={() => { setIsCartOpen(false); onChangeTab('shop'); }}
                      className="mt-4 bg-shopera-burgundy text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded"
                    >
                      Découvrir la boutique
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {cart.map((item) => (
                      <div
                        key={item.product.id + '-' + item.selectedColor}
                        className="flex items-center gap-3 bg-gray-50 border border-gray-200/50 p-2.5 rounded-lg text-xs"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-contain bg-white rounded border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-shopera-dark truncate">{item.product.name}</h4>
                          <span className="text-[10px] text-shopera-gray block">
                            Option : <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor }} />
                          </span>
                          <span className="text-shopera-burgundy font-sans font-semibold block mt-0.5">
                            {item.product.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>

                        {/* Modify count */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => onRemoveFromCart(item.product.id, item.selectedColor)}
                            className="text-[10px] text-rose-600 hover:underline font-bold"
                          >
                            Retirer
                          </button>
                          <div className="flex items-center border border-gray-200 bg-white rounded">
                            <button
                              onClick={() => onUpdateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                              className="px-1.5 py-0.5 hover:bg-gray-100"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 font-mono text-[10px] font-bold">{item.quantity}</span>
                            <button
                              onClick={() => {
                                if (item.quantity < item.product.stock) {
                                  onUpdateCartQuantity(item.product.id, item.selectedColor, item.quantity + 1);
                                }
                              }}
                              className="px-1.5 py-0.5 hover:bg-gray-100"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom calculation summary */}
            {!isCheckingOut && cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-shopera-gray uppercase">Sous-total :</span>
                  <span className="text-lg font-sans font-bold text-[#6D141F]">
                    {cartSubtotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <p className="text-[9px] text-shopera-gray">
                  Livraison gratuite incluse. TVA & commissions de plateforme incluses.
                </p>

                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-lg text-center shadow transition-all block"
                >
                  Procéder au paiement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER DESKTOP COMPLIANT */}
      <Footer
        logoConfig={logoConfig}
        onChangeTab={onChangeTab}
        onSelectProduct={onSelectProduct}
        onEnterSellerSpace={onEnterSellerSpace}
      />

      {/* Floating Design Hub Trigger Button */}
      <button
        onClick={() => setIsCustomizerOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light rounded-full shadow-2xl flex items-center justify-center group transition-all duration-300 ring-4 ring-white cursor-pointer"
        title="Studio Design - Modifier le Logo"
      >
        <Palette className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
      </button>

      {/* LOGO STUDIO SIDE PANEL */}
      <LogoStudioPanel
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        logoConfig={logoConfig}
        onUpdateLogoConfig={onUpdateLogoConfig}
      />
    </div>
  );
}
