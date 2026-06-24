import React, { useState } from 'react';
import { Sparkles, Truck, RotateCcw, ShieldCheck, User, Star } from 'lucide-react';
import { Product, LogoConfig } from '../types';
import HeroSlideshow from './HeroSlideshow';
import CategoriesGrid from './CategoriesGrid';

interface PublicHomepageViewProps {
  spotlightProducts: Product[];
  logoConfig?: LogoConfig;
  handleApplyCategory: (cat: string) => void;
  handleOpenProductDetails: (productId: string) => void;
}

export default function PublicHomepageView({
  spotlightProducts,
  logoConfig,
  handleApplyCategory,
  handleOpenProductDetails,
}: PublicHomepageViewProps) {
  const [clubEmail, setClubEmail] = useState('');
  const [clubJoined, setClubJoined] = useState(false);

  return (
    <div id="public-homepage-view" className="animate-fade-in text-sans">
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
                className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-8 py-4 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Acheter maintenant
              </button>
              <button
                onClick={() => handleApplyCategory('Tout')}
                className="bg-white border border-gray-200 text-shopera-dark hover:bg-gray-50 px-8 py-4 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
              <p className="text-[10px] text-shopera-gray font-sans">Dès 50 000 FCFA d&apos;achat</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-shopera-dark">Retours faciles</h4>
              <p className="text-[10px] text-shopera-gray font-sans">Satisfait ou remboursé sous 30j</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-shopera-dark">Paiement sécurisé</h4>
              <p className="text-[10px] text-shopera-gray font-sans">Cryptage SSL 100% garanti</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F2] p-2.5 rounded-full text-shopera-burgundy shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-shopera-dark">Support 24/7</h4>
              <p className="text-[10px] text-shopera-gray font-sans">Assistance téléphonique & WhatsApp</p>
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
            {spotlightProducts.map((p, idx) => {
              const badgeText = idx === 0 ? "PREMIUM LISTING" : "CONSEILLÉ";
              const badgeBg = idx === 0 ? "bg-amber-600" : "bg-emerald-600";
              const shouldRotate = idx === 0 && p.id === 'prod-8'; // Subtle rotation effect for original headphones only
              
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden shadow-xs hover:shadow transition duration-200">
                  <span className={`absolute top-4 left-4 ${badgeBg} text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-[20px] shadow`}>
                    {badgeText}
                  </span>
                  
                  <div className="w-full sm:w-1/2 aspect-square bg-[#FAF7F2] rounded-xl flex items-center justify-center p-4">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className={`max-h-full max-w-full object-contain ${shouldRotate ? 'transform -rotate-12' : ''}`}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <span className="text-[10px] tracking-wider uppercase font-extrabold text-shopera-gold block mb-1">
                        {p.brand || 'HERITAGE LUXE'}
                      </span>
                      <h3 className="font-extrabold text-shopera-dark text-lg leading-snug hover:text-shopera-burgundy cursor-pointer text-ellipsis line-clamp-2" onClick={() => handleOpenProductDetails(p.id)}>
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1.5 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isStarActive = s < Math.round(p.rating || 5);
                          return (
                            <Star key={s} className={`w-3 h-3 ${isStarActive ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                          );
                        })}
                        <span className="text-[10px] font-semibold text-shopera-gray">({p.reviewsCount || 0} avis)</span>
                      </div>
                      
                      <p className="text-xs text-shopera-gray leading-relaxed mb-3 line-clamp-2 font-sans">
                        {p.description}
                      </p>
                    </div>

                    <div>
                      <div className="text-lg font-sans font-semibold text-[#6D141F] mb-3">
                        {p.price.toLocaleString('fr-FR')} FCFA
                      </div>
                      <button
                        onClick={() => handleOpenProductDetails(p.id)}
                        className="bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light px-4 py-2 rounded-[20px] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        DÉCOUVRIR LE PRODUIT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Callout area */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-shopera-burgundy rounded-3xl text-white py-12 px-8 md:px-16 text-center relative overflow-hidden border border-rose-950/20 shadow-xl">
          {/* Backdrop lights */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-shopera-gold/15 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 uppercase">
              Rejoignez le club {(logoConfig?.text || 'ASSIGAME').toUpperCase()}
            </h2>
            <p className="text-xs text-rose-100/70 mb-8 leading-relaxed">
              Abonnez-vous pour recevoir des offres exclusives, des invitations à nos ventes privées et un bon de réduction de 10% sur votre première commande d&apos;exception.
            </p>

            {clubJoined ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center animate-fade-in relative z-10">
                <span className="inline-block bg-[#C5A059] text-white p-2 rounded-full mb-3 text-xs">&#10003;</span>
                <h4 className="font-extrabold text-[#C5A059] text-sm uppercase mb-1">Inscription Réussie !</h4>
                <p className="text-xs text-rose-100 leading-normal font-sans">
                  Félicitations, l'adresse <strong className="font-mono text-white underline">{clubEmail}</strong> a rejoint le club d'exception <strong>{(logoConfig?.text || 'ASSIGAME').toUpperCase()}</strong>. Votre bon-cadeau de bienvenue de 10% a été généré avec succès !
                </p>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault(); 
                if (clubEmail.trim()) {

  await fetch("http://localhost:3000/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: clubEmail,
    }),
  });

  setClubJoined(true);
}
                }} 
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  value={clubEmail}
                  onChange={(e) => setClubEmail(e.target.value)}
                  placeholder="Votre adresse email d'exception..."
                  className="flex-1 bg-white/10 border border-white/20 pl-4 pr-3 py-3 rounded-lg text-xs placeholder-rose-200/50 focus:outline-none focus:ring-1 focus:ring-white text-white"
                />
                <button
                  type="submit"
                  className="bg-white text-shopera-burgundy hover:bg-rose-50 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition shrink-0 cursor-pointer"
                >
                  S&apos;abonner
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
