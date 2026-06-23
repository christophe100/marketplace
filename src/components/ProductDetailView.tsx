import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Minus, Plus, Phone, Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Product, LogoConfig } from '../types';

interface ProductDetailViewProps {
  selectedProduct: Product;
  onSelectProduct: (id: string | null) => void;
  onChangeTab: (tab: 'home' | 'shop' | 'favorites' | 'profile') => void;
  onAddToCart: (product: Product, quantity: number, color: string) => void;
  setIsCartOpen: (open: boolean) => void;
  logoConfig?: LogoConfig;
}

export default function ProductDetailView({
  selectedProduct,
  onSelectProduct,
  onChangeTab,
  onAddToCart,
  setIsCartOpen,
  logoConfig,
}: ProductDetailViewProps) {
  const [detailColor, setDetailColor] = useState<string>('');
  const [detailQty, setDetailQty] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<'desc' | 'tech' | 'reviews'>('desc');

  // Initialize selected color once selectedProduct ranges change
  useEffect(() => {
    if (selectedProduct && selectedProduct.colors && selectedProduct.colors.length > 0) {
      setDetailColor(selectedProduct.colors[0]);
    } else {
      setDetailColor('#999999');
    }
    setDetailQty(1);
    setDetailTab('desc');
  }, [selectedProduct]);

  const handleAddToCartFromDetails = () => {
    onAddToCart(selectedProduct, detailQty, detailColor);
    setIsCartOpen(true);
  };

  return (
    <div id="product-detail-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
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
              <img src={selectedProduct.imageUrl} className="max-h-full object-contain" alt="Angle 1" />
            </div>
            {/* Simulated other angles */}
            <div className="aspect-square rounded-lg border border-gray-200 p-1 hover:border-shopera-burgundy transition bg-white cursor-pointer overflow-hidden opacity-80 hover:opacity-100 flex items-center justify-center">
              <img src={selectedProduct.imageUrl} className="max-h-full object-contain rotate-12 scale-90" alt="Angle 2" />
            </div>
            <div className="aspect-square rounded-lg border border-gray-200 p-1 hover:border-shopera-burgundy transition bg-white cursor-pointer overflow-hidden opacity-80 hover:opacity-100 flex items-center justify-center">
              <img src={selectedProduct.imageUrl} className="max-h-full object-contain -scale-x-100" alt="Angle 3" />
            </div>
            <div className="aspect-square rounded-lg border border-gray-200 p-0.5 bg-gray-50 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-4 h-4 text-shopera-gold animate-bounce" />
              <span className="text-[8px] font-bold text-shopera-gray mt-1 font-sans">Vue HD</span>
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
                {(selectedProduct.colors || []).map((color) => (
                  <button
                    key={color}
                    onClick={() => setDetailColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer ${
                      detailColor === color ? 'border-shopera-burgundy scale-105 shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Ticker and Actions Row */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2">
                    Quantité :
                  </span>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button
                      onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 rounded-l-lg transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 text-shopera-dark" />
                    </button>
                    <span className="px-4 font-mono font-semibold text-sm">
                      {detailQty}
                    </span>
                    <button
                      onClick={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 rounded-r-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-shopera-dark" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 pt-6">
                  <button
                    onClick={handleAddToCartFromDetails}
                    className="w-full bg-shopera-burgundy hover:bg-shopera-burgundy-light text-white font-bold py-3.5 px-6 rounded-[20px] text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer block text-center"
                  >
                    Ajouter au Panier
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <a
                  href={`https://wa.me/228900000000?text=${encodeURIComponent(
                    `Bonjour, je suis intéressé par le produit "${selectedProduct.name}" (Couleur: ${detailColor || 'Standard'}, Quantité: ${detailQty}) au prix de ${selectedProduct.price.toLocaleString('fr-FR')} FCFA. Est-il disponible immédiatement ?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00A884] hover:bg-[#008f70] text-white font-bold py-3 px-4 rounded-[20px] text-xs text-center shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.48 4.91 1.481 5.482 0 9.942-4.46 9.945-9.942.001-2.656-1.031-5.152-2.905-7.028-1.876-1.875-4.373-2.906-7.031-2.907-5.483 0-9.943 4.46-9.946 9.943-.001 1.764.49 3.27 1.439 4.887L1.134 22.18l4.903-1.288L6.59 19.14z" />
                  </svg>
                  Écrire sur WhatsApp
                </a>
                <a
                  href="tel:+228900000000"
                  className="bg-white border border-[#dfdfdf] hover:border-gray-300 hover:bg-gray-50 text-shopera-dark font-bold py-3 px-4 rounded-[20px] text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-shopera-dark shrink-0" />
                  Appeler le secrétariat
                </a>
              </div>
            </div>

            {/* Contact Secretary Widget */}
            <div className="bg-amber-50/50 border border-[#C5A059]/20 rounded-xl p-4 mb-6">
              <span className="block text-xs font-bold text-shopera-dark uppercase tracking-wider mb-2 text-center">
                DES QUESTIONS SUR CET ARTICLE ?
              </span>
              <p className="text-[11px] text-gray-500 text-center mb-3 leading-relaxed">
                Contactez directement notre secrétariat par Téléphone ou WhatsApp pour finaliser votre commande.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/228900000000?text=${encodeURIComponent(`Bonjour, je suis intéressé par le produit "${selectedProduct.name}" au prix de ${selectedProduct.price} FCFA. Est-il disponible immédiatement ?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-3 rounded-[20px] flex items-center justify-center gap-2 shadow text-center cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
                  WhatsApp
                </a>
                <a
                  href="tel:+228900000000"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-shopera-dark font-semibold text-xs py-2.5 px-3 rounded-[20px] flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  Téléphone
                </a>
              </div>
            </div>
          </div>

          {/* Small trust columns */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-[10px] text-shopera-gray">
            <div className="flex items-center gap-1.5 justify-center">
              <Truck className="w-4 h-4 text-shopera-gold" />
              <span>Livraison Rapide</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <RotateCcw className="w-4 h-4 text-shopera-gold" />
              <span>Retours 30 jours</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
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
            className={`py-3 text-xs uppercase tracking-wider font-extrabold cursor-pointer border-b-2 transition-all ${
              detailTab === 'desc' ? 'text-shopera-burgundy border-shopera-burgundy font-black' : 'text-shopera-gray border-transparent'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setDetailTab('tech')}
            className={`py-3 text-xs uppercase tracking-wider font-extrabold cursor-pointer border-b-2 transition-all ${
              detailTab === 'tech' ? 'text-shopera-burgundy border-shopera-burgundy font-black' : 'text-shopera-gray border-transparent'
            }`}
          >
            Informations complémentaires
          </button>
          <button
            onClick={() => setDetailTab('reviews')}
            className={`py-3 text-xs uppercase tracking-wider font-extrabold cursor-pointer border-b-2 transition-all ${
              detailTab === 'reviews' ? 'text-shopera-burgundy border-shopera-burgundy font-black' : 'text-shopera-gray border-transparent'
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
              {(selectedProduct.features || []).map((feat, idx) => (
                <li key={idx}>{feat}</li>
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
                  <td className="py-2.5 font-bold text-[#1a1a1a]">Disponibilité d&apos;expédition</td>
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
                  <span className="text-[10px] text-shopera-gray font-mono">Le 12 Juin 2026 à Yaoundé</span>
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
  );
}
