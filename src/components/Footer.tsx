import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { LogoConfig } from '../types';
import AssigameLogo from './AssigameLogo';

// Icons used inside the logo/footer
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

interface FooterProps {
  logoConfig?: LogoConfig;
  onChangeTab: (tab: string) => void;
  onSelectProduct: (val: null) => void;
  onEnterSellerSpace: () => void;
}

export default function Footer({
  logoConfig,
  onChangeTab,
  onSelectProduct,
  onEnterSellerSpace,
}: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 md:px-8 mt-16 text-xs text-shopera-gray">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        
        {/* Col 1 Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AssigameLogo 
              className="text-xl"
              color={logoConfig?.textColor || '#4A1118'}
            />
          </div>
          <p className="leading-relaxed mb-4 max-w-xs">
            Votre destination de prestige pour le shopping panafricain. L&apos;alliance suprême entre tradition, design haut de gamme et efficacité technologique de pointe.
          </p>
          <div className="text-[10px] text-shopera-dark font-mono">
            © 2026 ASSIGAME. Tous droits réservés.
          </div>
        </div>

        {/* Col 2 Exploration */}
        <div>
          <h4 className="font-extrabold text-shopera-dark uppercase tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => { onChangeTab('home'); onSelectProduct(null); }} 
                className="hover:text-shopera-burgundy text-left cursor-pointer"
              >
                Page d&apos;accueil
              </button>
            </li>
            <li>
              <button 
                onClick={() => { onChangeTab('shop'); onSelectProduct(null); }} 
                className="hover:text-shopera-burgundy text-left cursor-pointer"
              >
                Nos produits catalogue
              </button>
            </li>
            <li>
              <button 
                onClick={() => onChangeTab('favorites')} 
                className="hover:text-shopera-burgundy text-left cursor-pointer"
              >
                Vœux & Favoris
              </button>
            </li>
            <li>
              <button 
                onClick={() => onChangeTab('chat')} 
                className="hover:text-shopera-burgundy text-left cursor-pointer"
              >
                Messagerie Directe
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3 Services Assistance */}
        <div>
          <h4 className="font-extrabold text-[#111111] uppercase tracking-wider mb-4 font-sans">Assistance</h4>
          <ul className="space-y-2">
            <li className="hover:text-shopera-burgundy cursor-pointer">Conditions d&apos;utilisation</li>
            <li className="hover:text-shopera-burgundy cursor-pointer">Foire Aux Questions (FAQ)</li>
            <li className="hover:text-shopera-burgundy cursor-pointer">Centre de litige Vendeurs</li>
            <li className="hover:text-shopera-burgundy cursor-pointer">Politique de retour de 30j</li>
          </ul>
        </div>

        {/* Col 4 Contacts */}
        <div>
          <h4 className="font-extrabold text-[#111111] uppercase tracking-wider mb-4 font-sans">Secrétariat</h4>
          <p className="leading-relaxed mb-2">
            Bastos, Yaoundé. Immeuble Or, Cameroun.
          </p>
          <p className="font-bold text-[#111111] font-mono">
            +237 6 95 12 34 56
          </p>
          <p className="text-[10px] mt-1 text-shopera-gray">
            support@shopera-pro.com
          </p>
        </div>

        {/* Col 5 Espace Créateurs / Vendeurs */}
        <div className="bg-[#FAF7F2]/40 border border-[#FAF7F2] p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-shopera-burgundy uppercase tracking-wider mb-2 font-sans text-xs">Portail Artisans</h4>
            <p className="leading-relaxed text-[11px] text-shopera-gray mb-4">
              Vous souhaitez exposer vos œuvres, meubles ou produits sur ASSIGAME ? Rejoignez notre réseau d'artisans.
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={onEnterSellerSpace}
              className="w-full bg-[#4A1118] hover:bg-[#60101B] text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded text-center transition cursor-pointer"
            >
              Se Connecter Vendeur
            </button>
            <button
              onClick={onEnterSellerSpace}
              className="w-full bg-white hover:bg-gray-50 border border-[#4A1118]/25 text-[#4A1118] font-bold text-[10px] uppercase tracking-wider py-1.5 rounded text-center transition cursor-pointer"
            >
              Inscription Vendeur
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
