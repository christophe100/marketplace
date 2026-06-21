import React from 'react';
import {
  Palette,
  X,
  ShoppingBag,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart,
} from 'lucide-react';
import { LogoConfig } from '../types';

const LOGO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Sparkles,
  Gem,
  ShoppingCart,
  Store,
  Crown,
  Gift,
  Heart,
};

interface LogoStudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logoConfig?: LogoConfig;
  onUpdateLogoConfig?: (config: LogoConfig) => void;
}

export default function LogoStudioPanel({
  isOpen,
  onClose,
  logoConfig,
  onUpdateLogoConfig,
}: LogoStudioPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in font-sans">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      
      {/* Customizer Sidebar Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-l border-gray-100">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-shopera-burgundy" />
              <h3 className="text-lg font-bold text-shopera-dark">Studio Design ASSIGAME</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 text-gray-400 hover:text-shopera-dark hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Guide description */}
          <p className="text-xs text-shopera-gray mb-6 leading-relaxed">
            Personnalisez le nom de votre site et le style graphique de votre logo en temps réel. Toutes les modifications instantanées sont enregistrées localement et visibles sur l&apos;ensemble de la plateforme.
          </p>

          <div className="space-y-6">
            {/* Text Logo Input */}
            <div>
              <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                Nom de l&apos;enseigne (Texte)
              </label>
              <input
                type="text"
                value={logoConfig?.text || ''}
                onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, text: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                placeholder="Ex: ASSIGAME"
              />
            </div>

            {/* Logo Type Selector */}
            <div>
              <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                Type de Rendu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, logoType: 'text_icon' })}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    logoConfig?.logoType === 'text_icon'
                      ? 'border-shopera-burgundy bg-shopera-burgundy/5 text-shopera-burgundy'
                      : 'border-gray-200 text-shopera-gray hover:border-gray-300'
                  }`}
                >
                  Icône & Texte
                </button>
                <button
                  onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, logoType: 'image' })}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    logoConfig?.logoType === 'image'
                      ? 'border-shopera-burgundy bg-shopera-burgundy/5 text-shopera-burgundy'
                      : 'border-gray-200 text-shopera-gray hover:border-gray-300'
                  }`}
                >
                  Image Graphique
                </button>
              </div>
            </div>

            {logoConfig?.logoType === 'text_icon' ? (
              <>
                {/* Icon Selection Catalog */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                    Icône du Fleuron
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(LOGO_ICONS).map((iconName) => {
                      const IconComp = LOGO_ICONS[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, iconName })}
                          className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            logoConfig?.iconName === iconName
                              ? 'border-shopera-gold bg-shopera-gold/10 text-shopera-gold'
                              : 'border-gray-100 hover:bg-gray-50 text-shopera-gray'
                          }`}
                          title={iconName}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Color Customization */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                    Couleur de Fond de l&apos;Icône
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={logoConfig?.bgColor || '#4A1118'}
                      onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, bgColor: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={logoConfig?.bgColor || ''}
                      onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, bgColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-semibold uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['#4A1118', '#C5A059', '#1C1B1B', '#2E5A44', '#1F3A60', '#A83B47', '#E28743'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, bgColor: color })}
                        className="w-6 h-6 rounded-full border border-white shadow-md cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Text Color Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                    Couleur du Texte
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={logoConfig?.textColor || '#4A1118'}
                      onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, textColor: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={logoConfig?.textColor || ''}
                      onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-semibold uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['#4A1118', '#C5A059', '#1C1B1B', '#2E5A44', '#1F3A60', '#E28743'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, textColor: color })}
                        className="w-6 h-6 rounded-full border border-white shadow-md cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Logo Outer Border Radius Shape */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                    Forme de l&apos;Arrière-plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, borderRadius: 'rounded-none' })}
                      className={`py-1.5 text-[10px] uppercase font-bold rounded border transition cursor-pointer ${
                        logoConfig?.borderRadius === 'rounded-none'
                          ? 'border-shopera-burgundy bg-shopera-burgundy/5 text-shopera-burgundy'
                          : 'border-gray-100 text-shopera-gray'
                      }`}
                    >
                      Carré
                    </button>
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, borderRadius: 'rounded-lg' })}
                      className={`py-1.5 text-[10px] uppercase font-bold rounded border transition cursor-pointer ${
                        logoConfig?.borderRadius === 'rounded-lg'
                          ? 'border-shopera-burgundy bg-shopera-burgundy/5 text-shopera-burgundy'
                          : 'border-gray-100 text-shopera-gray'
                      }`}
                    >
                      Moderne
                    </button>
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, borderRadius: 'rounded-full' })}
                      className={`py-1.5 text-[10px] uppercase font-bold rounded border transition cursor-pointer ${
                        logoConfig?.borderRadius === 'rounded-full'
                          ? 'border-shopera-burgundy bg-shopera-burgundy/5 text-shopera-burgundy'
                          : 'border-gray-100 text-shopera-gray'
                      }`}
                    >
                      Cercle
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Custom Logo Image Link Form */
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#1C1B1B] mb-2">
                    Adresse internet du Fichier Logo
                  </label>
                  <input
                    type="url"
                    value={logoConfig?.imageUrl || ''}
                    onChange={(e) => onUpdateLogoConfig?.({ ...logoConfig!, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-shopera-burgundy bg-white"
                    placeholder="Ex: https://images.unsplash.com/... ou URL absolue"
                  />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-shopera-gray mb-2">Modèles d&apos;icônes d&apos;artisanat :</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=120&auto=format&fit=crop&q=80' })}
                      className="border border-gray-200 p-1.5 rounded hover:bg-gray-100 transition text-[10px] text-left overflow-hidden whitespace-nowrap text-ellipsis font-bold flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=120&auto=format&fit=crop&q=80" className="w-5 h-5 rounded object-cover shrink-0" />
                      <span>Drapeau Art</span>
                    </button>
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=120&auto=format&fit=crop&q=80' })}
                      className="border border-gray-200 p-1.5 rounded hover:bg-gray-100 transition text-[10px] text-left overflow-hidden whitespace-nowrap text-ellipsis font-bold flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <img src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=120&auto=format&fit=crop&q=80" className="w-5 h-5 rounded object-cover shrink-0" />
                      <span>Fleuron Prestige</span>
                    </button>
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, imageUrl: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=120&auto=format&fit=crop&q=80' })}
                      className="border border-gray-200 p-1.5 rounded hover:bg-gray-100 transition text-[10px] text-left overflow-hidden whitespace-nowrap text-ellipsis font-bold flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <img src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=120&auto=format&fit=crop&q=80" className="w-5 h-5 rounded object-cover shrink-0" />
                      <span>Sceau Ornemental</span>
                    </button>
                    <button
                      onClick={() => onUpdateLogoConfig?.({ ...logoConfig!, imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&auto=format&fit=crop&q=80' })}
                      className="border border-gray-200 p-1.5 rounded hover:bg-gray-100 transition text-[10px] text-left overflow-hidden whitespace-nowrap text-ellipsis font-bold flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&auto=format&fit=crop&q=80" className="w-5 h-5 rounded object-cover shrink-0" />
                      <span>Forme d&apos;Horizon</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel footer operations */}
        <div className="border-t border-gray-100 pt-4 mt-6">
          <button
            onClick={() => {
              onUpdateLogoConfig?.({
                text: 'ASSIGAME',
                iconName: 'ShoppingBag',
                bgColor: '#4A1118',
                textColor: '#4A1118',
                logoType: 'text_icon',
                imageUrl: '',
                borderRadius: 'rounded-lg'
              });
            }}
            className="w-full py-2.5 border border-dashed border-gray-300 text-gray-400 hover:text-shopera-burgundy hover:border-shopera-burgundy text-[10px] uppercase font-extrabold tracking-widest rounded-lg text-center transition cursor-pointer"
          >
            Réinitialiser la charte par Défaut
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-3 bg-shopera-dark hover:bg-black text-white text-xs font-extrabold uppercase tracking-widest rounded-lg text-center transition cursor-pointer"
          >
            Valider la Personnalisation
          </button>
        </div>
      </div>
    </div>
  );
}
