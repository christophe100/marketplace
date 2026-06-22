import React from 'react';
import { Menu, Search, Heart, ShoppingBag } from 'lucide-react';
import { LogoConfig, CartItem } from '../types';
import AssigameLogo from './AssigameLogo';

// Let's import LOGO_ICONS or define it here
import {
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart as HeartIcon,
} from 'lucide-react';

const LOGO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart: HeartIcon,
};

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  onChangeTab: (tab: string) => void;
  onSelectProduct: (val: null) => void;
  currentTab: string;
  selectedProductId: string | null;
  searchQuery: string;
  onSetSearchQuery: (text: string) => void;
  favorites: string[];
  cart: CartItem[];
  setIsCartOpen: (val: boolean) => void;
  logoConfig?: LogoConfig;
  onEnterSellerSpace?: (initialMode?: 'login' | 'signup') => void;
}

export default function Navbar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onChangeTab,
  onSelectProduct,
  currentTab,
  selectedProductId,
  searchQuery,
  onSetSearchQuery,
  favorites,
  cart,
  setIsCartOpen,
  logoConfig,
  onEnterSellerSpace,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Logo & Hamburguer menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            <Menu className="w-6 h-6 text-shopera-dark" />
          </button>
          <div
            onClick={() => { onChangeTab('home'); onSelectProduct(null); }}
            className="flex items-center gap-2.5 cursor-pointer group py-1"
          >
            <AssigameLogo 
              className="text-2xl transition-transform duration-150 group-hover:scale-[1.02]"
              color={logoConfig?.textColor || '#4A1118'}
            />
          </div>
        </div>

        {/* Desktop Search Engine & Tab Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => { onChangeTab('home'); onSelectProduct(null); }}
            className={`hover:text-shopera-burgundy transition-all duration-150 py-1 cursor-pointer ${
              currentTab === 'home' && !selectedProductId ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy font-bold' : 'text-shopera-gray'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => { onChangeTab('shop'); onSelectProduct(null); }}
            className={`hover:text-shopera-burgundy transition-all duration-150 py-1 cursor-pointer ${
              currentTab === 'shop' || selectedProductId ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy font-bold' : 'text-shopera-gray'
            }`}
          >
            Boutique
          </button>
          <button
            onClick={() => { onChangeTab('favorites'); onSelectProduct(null); }}
            className={`hover:text-shopera-burgundy transition-all duration-150 py-1 cursor-pointer ${
              currentTab === 'favorites' ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy font-bold' : 'text-shopera-gray'
            }`}
          >
            Favoris
          </button>
          <button
            onClick={() => { onChangeTab('chat'); onSelectProduct(null); }}
            className={`hover:text-shopera-burgundy transition-all duration-150 py-1 cursor-pointer ${
              currentTab === 'chat' ? 'text-shopera-burgundy border-b-2 border-shopera-burgundy font-bold' : 'text-shopera-gray'
            }`}
          >
            Messages
          </button>
        </div>

        {/* Search Inputs & Shopping Stats Panel */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              placeholder="Rechercher un produit..."
              onChange={(e) => {
                onSetSearchQuery(e.target.value);
                if (currentTab !== 'shop') onChangeTab('shop');
              }}
              className="w-48 xl:w-64 pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-shopera-burgundy bg-white"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Icons indicators */}
          <button
            onClick={() => onChangeTab('favorites')}
            className="p-2 text-shopera-dark hover:text-shopera-burgundy rounded-full hover:bg-gray-50 relative cursor-pointer"
            title="Mes favoris"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-shopera-burgundy text-shopera-burgundy' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 bg-shopera-gold text-shopera-dark font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-shopera-dark hover:text-shopera-burgundy rounded-full hover:bg-gray-50 relative cursor-pointer"
            title="Mon Panier"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-shopera-burgundy text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animated-pulse">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Seller Action Buttons */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-150">
            <button
              onClick={() => onEnterSellerSpace?.('login')}
              className="inline-flex items-center justify-center bg-[#4A1118] hover:bg-[#5C161E] text-white text-[10px] font-extrabold px-4 py-2.5 uppercase tracking-wider transition-colors duration-150 rounded-[30px] shadow-xs cursor-pointer"
            >
              Se Connecter Vendeur
            </button>
            <button
              onClick={() => onEnterSellerSpace?.('signup')}
              className="inline-flex items-center justify-center border border-[#4A1118] text-[#4A1118] bg-white hover:bg-red-50/50 text-[10px] font-extrabold px-4 py-2 md:py-2.5 uppercase tracking-wider transition-colors duration-150 rounded-[30px] cursor-pointer"
            >
              Inscription Vendeur
            </button>
          </div>
        </div>
      </div>

      {/* Mobile quick search strip */}
      <div className="sm:hidden px-4 pb-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            placeholder="Rechercher un produit..."
            onChange={(e) => {
              onSetSearchQuery(e.target.value);
              if (currentTab !== 'shop') onChangeTab('shop');
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Mobile slide drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-2 shadow-inner" id="mobile-navigation-drawer">
          <button
            onClick={() => { onChangeTab('home'); onSelectProduct(null); setIsMobileMenuOpen(false); }}
            className={`text-left py-2 text-sm font-semibold cursor-pointer ${currentTab === 'home' ? 'text-shopera-burgundy' : 'text-shopera-dark'}`}
          >
            Accueil
          </button>
          <button
            onClick={() => { onChangeTab('shop'); onSelectProduct(null); setIsMobileMenuOpen(false); }}
            className={`text-left py-2 text-sm font-semibold cursor-pointer ${currentTab === 'shop' ? 'text-shopera-burgundy' : 'text-shopera-dark'}`}
          >
            Boutique
          </button>
          <button
            onClick={() => { onChangeTab('favorites'); setIsMobileMenuOpen(false); }}
            className={`text-left py-2 text-sm font-semibold cursor-pointer ${currentTab === 'favorites' ? 'text-shopera-burgundy' : 'text-shopera-dark'}`}
          >
            Favoris ({favorites.length})
          </button>
          <button
            onClick={() => { onChangeTab('chat'); setIsMobileMenuOpen(false); }}
            className={`text-left py-2 text-sm font-semibold cursor-pointer ${currentTab === 'chat' ? 'text-shopera-burgundy' : 'text-shopera-dark'}`}
          >
            Messages
          </button>
          
          {/* Mobile Seller Buttons */}
          <div className="border-t border-gray-150 pt-3 mt-1 flex flex-col gap-2">
            <button
              onClick={() => { onEnterSellerSpace?.('login'); setIsMobileMenuOpen(false); }}
              className="bg-[#4A1118] text-white text-xs font-bold py-2.5 px-4 uppercase tracking-wider text-center rounded-[30px] shadow-xs cursor-pointer"
            >
              Se Connecter Vendeur
            </button>
            <button
              onClick={() => { onEnterSellerSpace?.('signup'); setIsMobileMenuOpen(false); }}
              className="border border-[#4A1118] text-[#4A1118] bg-white text-xs font-bold py-2 px-4 uppercase tracking-wider text-center rounded-[30px] cursor-pointer"
            >
              Inscription Vendeur
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
