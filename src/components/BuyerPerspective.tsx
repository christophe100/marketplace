
import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  X,
  Minus,
  Plus,
} from 'lucide-react';
import { Product, Order, Conversation, CartItem, LogoConfig } from '../types';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductDetailView from './ProductDetailView';
import PublicHomepageView from './PublicHomepageView';
import ProductCatalogueView from './ProductCatalogueView';

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
  currentTab: 'home' | 'shop' | 'favorites' | 'profile';
  onChangeTab: (tab: 'home' | 'shop' | 'favorites' | 'profile') => void;
  categoryFilter: string | null;
  onSetCategoryFilter: (category: string | null) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
  loggedSeller: any;
  onEnterSellerSpace: (initialMode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  logoConfig?: LogoConfig;
  onUpdateLogoConfig?: (config: LogoConfig) => void;
}

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
  onLogout,
  logoConfig,
}: BuyerPerspectiveProps) {
  
  
  // Local UI status state variables
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

// Produits similaires
const [similarProducts, setSimilarProducts] = useState<any[]>([]);

// Checkout Sim Info
const [checkoutName, setCheckoutName] = useState('');
const [checkoutEmail, setCheckoutEmail] = useState('');
const [isCheckingOut, setIsCheckingOut] = useState(false);

// Récupération des produits similaires
const fetchSimilar = async (id: number) => {
  await new Promise((r) => setTimeout(r, 300));

  const res = await fetch(
    `http://localhost:3000/api/products/${id}/similar`
  );

  const data = await res.json();

  setSimilarProducts(data);

  return data;
};

// Historique des produits consultés
const handleViewProduct = async (product: Product) => {
  const history = JSON.parse(
    localStorage.getItem("viewed_products") || "[]"
  );

  const updated = [product.category, ...history]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  localStorage.setItem(
    "viewed_products",
    JSON.stringify(updated)
  );

  await fetch("http://localhost:3000/api/user-activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user@test.com",
      categories: updated,
    }),
  });
};
useEffect(() => {
  if (selectedProductId) {
    fetchSimilar(Number(selectedProductId));
  }
}, [selectedProductId]);

const dynamicCategories = useMemo(() => {
  const list = [...CATEGORIES];

  products.forEach((p) => {
    if (p.category && !list.includes(p.category)) {
      list.push(p.category);
    }
  });

  return list;
}, [products]);

// Active product details helper
const selectedProduct = useMemo(() => {
  return products.find(
    (p) =>
      String(p.id) === String(selectedProductId) &&
      p.status === 'active'
  );
}, [products, selectedProductId]);

  // Unique list of products for the "Nouveautés & Coups de Cœur" section
  const spotlightProducts = useMemo(() => {
    const activeProds = products.filter(p => p.status === 'active');
    return activeProds.sort((a, b) => {
      const getScore = (p: Product) => {
        const matches = p.id.match(/\d+/g);
        if (matches) {
          return Number(matches.join(''));
        }
        return 0;
      };
      return getScore(b) - getScore(a);
    }).slice(0, 2);
  }, [products]);

  // Calculations for basket subtotal
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const handleApplyCategory = (cat: string) => {
    onSetCategoryFilter(cat === 'Tout' ? null : cat);
    onChangeTab('shop');
    onSelectProduct(null);
  };

  const handleOpenProductDetails = (productId: string) => {
    onSelectProduct(productId);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    onCheckout(checkoutName || 'Client Anonyme', checkoutEmail || 'client@assigame.com');
    setIsCheckingOut(false);
    setIsCartOpen(false);
    alert("Votre commande a été passée avec succès ! Merci de votre confiance et d'encourager nos artisans locaux.");
    onChangeTab('shop'); 
  };

  return (
    <div id="buyer-perspective" className="min-h-screen bg-shopera-cream pb-12 text-sans">
      {/* NAVIGATION BAR */}
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
        loggedSeller={loggedSeller}
        onLogout={onLogout}
      />

      {/* DETAILED VIEW OR MAIN ROUTING CONTENT DECIDER */}
      {selectedProduct ? (
        <ProductDetailView
          selectedProduct={selectedProduct}
          onSelectProduct={onSelectProduct}
          onChangeTab={onChangeTab}
          onAddToCart={onAddToCart}
          setIsCartOpen={setIsCartOpen}
          similarProducts={similarProducts}
          logoConfig={logoConfig}
        />
      ) : (
        <div>
          {currentTab === 'home' && (
            <PublicHomepageView
              spotlightProducts={spotlightProducts}
              logoConfig={logoConfig}
              handleApplyCategory={handleApplyCategory}
              handleOpenProductDetails={handleOpenProductDetails}
            />
          )}

          {currentTab === 'shop' && (
            <ProductCatalogueView
              products={products}
              categoryFilter={categoryFilter}
              onSetCategoryFilter={onSetCategoryFilter}
              searchQuery={searchQuery}
              onSetSearchQuery={onSetSearchQuery}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              handleOpenProductDetails={handleOpenProductDetails}
              dynamicCategories={dynamicCategories}
            />
          )}

          {currentTab === 'favorites' && (
            /* FAVORITES SCREEN */
            <div id="favorites-screen" className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-extrabold text-shopera-dark tracking-tight mb-2">
                Mes Favoris
              </h2>
              <p className="text-xs text-shopera-gray mb-8">Les articles d&apos;exception que vous avez sauvegardés.</p>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-xl py-12 px-4 text-center border border-gray-100 max-w-md mx-auto">
                  <Heart className="w-12 h-12 text-shopera-gray/30 mx-auto mb-4" />
                  <h4 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider">Aucun favori</h4>
                  <p className="text-xs text-shopera-gray mt-1 leading-relaxed">
                    Explorez le catalogue et cliquez sur le cœur pour sauvegarder des pièces uniques.
                  </p>
                  <button
                    onClick={() => onChangeTab('shop')}
                    className="mt-5 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light font-bold text-xs uppercase px-5 py-2.5 rounded-lg shadow cursor-pointer"
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
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain cursor-pointer"
                            onClick={() => handleOpenProductDetails(p.id)}
                          />
                          <button
                            onClick={() => onToggleFavorite(p.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-shopera-burgundy shadow-xs cursor-pointer"
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
                          className="w-full mt-3 bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded transition cursor-pointer"
                        >
                          Acheter
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'profile' && (
            /* MY ACCOUNT AND ORDER LOGS */
            <div id="profile-screen" className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Account card profile widget left */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-shopera-burgundy text-white flex items-center justify-center font-bold text-xl mb-3">
                    PV
                  </div>
                  <h3 className="font-extrabold text-sm text-shopera-dark">Profil Visiteur</h3>
                  <p className="text-[10px] text-shopera-gray">Acheteur Libre</p>
                  
                  <div className="w-full mt-6 space-y-2 border-t border-gray-100 pt-4 text-xs text-left text-shopera-gray font-sans">
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
                    <div className="py-12 text-center text-shopera-gray text-xs">
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
                                <td className="py-3 text-[11px] text-shopera-gray font-sans">{ord.date}</td>
                                <td className="py-3 flex items-center gap-2 font-sans">
                                  <img src={ord.productImage} className="w-6 h-6 object-contain rounded bg-shopera-tan" alt="produit" />
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

                  <div className="bg-[#FCF9F8] border border-gray-100 rounded-lg p-4 mt-6 text-[11px] text-shopera-gray flex items-center justify-between font-sans leading-relaxed">
                    <div>
                      💡 Des doutes sur un colis ? Contactez directement notre service clients <strong>{(logoConfig?.text || 'ASSIGAME').toUpperCase()}</strong> par WhatsApp ou Téléphone au <strong>+228 90 00 00 00</strong> (disponible 24h/24).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SHOPPING CART BOTTOM DRAWER / PANEL INTERACTIVES */}
      {isCartOpen && (
        <div id="shopping-cart-drawer" className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sans">
                <ShoppingBag className="w-4 h-4 text-shopera-burgundy animate-bounce" />
                <span className="font-extrabold text-sm uppercase text-shopera-dark tracking-wider">
                  Mon Panier ({cart.length})
                </span>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); setIsCheckingOut(false); }}
                className="p-1 hover:bg-gray-200 rounded-md transition cursor-pointer"
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
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded text-xs focus:ring-1 focus:ring-shopera-burgundy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-shopera-dark uppercase mb-1">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded text-xs focus:ring-1 focus:ring-shopera-burgundy"
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
                      className="flex-1 border border-gray-300 py-3 rounded-lg text-xs font-bold text-shopera-dark cursor-pointer transition hover:bg-gray-50"
                    >
                      Retourner au panier
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition"
                    >
                      Confirmer l&apos;achat
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* BASKET ITEMS LIST */
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-shopera-gray">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-xs">Votre panier d&apos;exception est vide.</p>
                    <button
                      onClick={() => { setIsCartOpen(false); onChangeTab('shop'); }}
                      className="mt-4 bg-shopera-burgundy text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded cursor-pointer hover:bg-shopera-burgundy-light"
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
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain bg-white rounded border border-gray-100 hover:scale-105 transition"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-shopera-dark truncate">{item.product.name}</h4>
                          <span className="text-[10px] text-shopera-gray block">
                            Option : <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 align-middle" style={{ backgroundColor: item.selectedColor }} />
                          </span>
                          <span className="text-shopera-burgundy font-sans font-semibold block mt-0.5">
                            {item.product.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>

                        {/* Modify count */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => onRemoveFromCart(item.product.id, item.selectedColor)}
                            className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                          >
                            Retirer
                          </button>
                          <div className="flex items-center border border-gray-200 bg-white rounded">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1);
                                }
                              }}
                              className="px-1.5 py-0.5 hover:bg-gray-100 cursor-pointer"
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
                              className="px-1.5 py-0.5 hover:bg-gray-100 cursor-pointer"
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
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3 font-sans">
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
                  className="w-full bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-lg text-center shadow transition-all block cursor-pointer"
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

    </div>
  );
}
