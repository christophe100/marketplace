/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Gem, 
  ShoppingCart, 
  Store, 
  Crown, 
  Gift, 
  Heart,
  Eye,
  EyeOff,
  CornerDownLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  MapPin,
  User,
  CheckCircle,
  Mail,
  Lock
} from 'lucide-react';
import { SellerProfile, LogoConfig } from '../types';
import { loginSellerApi, registerSellerApi } from '../api';

interface SellerAuthPortalProps {
  sellers: SellerProfile[];
  onLogin: (seller: SellerProfile) => void;
  onRegister: (newSeller: Omit<SellerProfile, 'id' | 'joinDate' | 'status'>) => void;
  onCancel: () => void;
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

export default function SellerAuthPortal({
  sellers,
  onLogin,
  onRegister,
  onCancel,
  logoConfig,
}: SellerAuthPortalProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>('login');
  
  // Custom states matching "COSMOS" design
  const [showPassword, setShowPassword] = useState(false);

  // Login variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup variables
  const [signupStoreName, setSignupStoreName] = useState('');
  const [signupOwnerName, setSignupOwnerName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('Bastos, Yaoundé');
  const [signupPassword, setSignupPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      alert("Veuillez saisir votre adresse email et votre mot de passe.");
      return;
    }
    
    setLoading(true);
    setApiError('');
    try {
      const loggedSellerProfile = await loginSellerApi(loginEmail.trim(), loginPassword);
      onLogin(loggedSellerProfile);
    } catch (err: any) {
      const errMsg = err.message || "Impossible de se connecter.";
      setApiError(errMsg);
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupStoreName.trim() || !signupOwnerName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }
    if (!termsAccepted) {
      alert("Veuillez accepter la charte d'excellence pour continuer.");
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const newSellerProfile = await registerSellerApi({
        storeName: signupStoreName,
        ownerName: signupOwnerName,
        email: signupEmail,
        phone: signupPhone,
        address: signupAddress,
        password: signupPassword,
      });
      onLogin(newSellerProfile);
    } catch (err: any) {
      const errMsg = err.message || "Erreur lors de la création de la boutique.";
      setApiError(errMsg);
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8] text-[#1C1B1B] font-sans antialiased selection:bg-[#4A1118] selection:text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient background glows for premium look */}
      <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-[#4A1118]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#C5A059]/5 blur-[120px] pointer-events-none" />

      {/* CENTERED PORTAL CONTAINER */}
      <div className="w-full max-w-[440px] space-y-8 py-4 relative z-10">

        {/* Majestic Cosmos 8-Dot circle loader element */}
        <div className="flex items-center justify-center mb-1">
          <div className="relative w-8 h-8 animate-spin" style={{ animationDuration: '10s' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i * 360) / 8;
              return (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[#4A1118] rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    opacity: 0.2 + (i * 0.1),
                    transform: `rotate(${angle}deg) translate(0, -11px) translate(-50%, -50%)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Form Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-sans tracking-tight text-[#1C1B1B] font-semibold">
            {activeMode === 'login' ? 'Se Connecter' : 'Créer sa Boutique'}
          </h1>
          
          <div className="flex justify-center items-center gap-1.5 text-xs text-[#717171]">
            {activeMode === 'login' ? (
              <>
                <span>Nouveau créateur ?</span>
                <button 
                  onClick={() => setActiveMode('signup')}
                  className="text-[#4A1118] font-semibold hover:underline underline-offset-4 cursor-pointer"
                  type="button"
                >
                  Demander une boutique
                </button>
              </>
            ) : (
              <>
                <span>Vous possédez déjà un compte ?</span>
                <button 
                  onClick={() => setActiveMode('login')}
                  className="text-[#4A1118] font-semibold hover:underline underline-offset-4 cursor-pointer"
                  type="button"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form scenarios */}
        {activeMode === 'login' ? (
          /* SCENARIO 1: SIGN IN FORM */
          <form onSubmit={handleCustomLogin} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                Adresse Email ou ID Boutique
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#717171]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="boutique@example.com"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-11 py-3 text-sm rounded-xl text-[#1C1B1B] placeholder-[#717171]/50 focus:outline-none focus:border-[#4A1118] transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline pl-1">
                <label className="block text-[10px] uppercase tracking-widest text-[#717171] font-sans font-semibold">
                  Mot de passe
                </label>
                <button type="button" className="text-[10px] text-[#717171] hover:text-[#4A1118] transition">
                  Oublié ?
                </button>
              </div>
              
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#717171]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-11 py-3 text-sm rounded-xl text-[#1C1B1B] placeholder-[#717171]/50 focus:outline-none focus:border-[#4A1118] transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#717171] hover:text-[#4A1118] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A1118] hover:bg-[#60101B] disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 mt-6 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>{loading ? 'Authentification...' : 'Accéder à ma Boutique'}</span>
            </button>
            
          </form>
        ) : (
          /* SCENARIO 2: SIGN UP / CREATION DE BOUTIQUE FORM */
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in pb-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                  Nom de Boutique *
                </label>
                <input
                  type="text"
                  required
                  value={signupStoreName}
                  onChange={(e) => setSignupStoreName(e.target.value)}
                  placeholder="ex: Royal Leather Co"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                  Nom Artisan Propriétaire *
                </label>
                <input
                  type="text"
                  required
                  value={signupOwnerName}
                  onChange={(e) => setSignupOwnerName(e.target.value)}
                  placeholder="ex: François Mvondo"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                Adresse Email Professionnelle *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#717171] text-xs">@</span>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="artisan@assigame.com"
                  className="w-full bg-white border border-[#1C1B1B]/15 pl-9 pr-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                  Téléphone WhatsApp (+237) *
                </label>
                <input
                  type="text"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+237 6 99 99 99 99"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                  Ville & Quartier d'atelier *
                </label>
                <input
                  type="text"
                  required
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  placeholder="Yaoundé ou Douala"
                  className="w-full bg-white border border-[#1C1B1B]/15 px-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-[#717171] pl-1 font-sans font-semibold">
                Mot de passe securisé *
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#1C1B1B]/15 px-4 py-2.5 text-xs rounded-xl text-[#1C1B1B] placeholder-gray-400 focus:outline-none focus:border-[#4A1118] transition"
              />
            </div>

            {/* Charter agreement checkbox styled beautifully */}
            <div className="flex items-start gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#4A1118]/10 mt-3">
              <input
                type="checkbox"
                id="exclusive-terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded accent-[#4A1118] bg-white border-[#1C1B1B]/15 text-white focus:ring-0 cursor-pointer h-3.5 w-3.5"
              />
              <label htmlFor="exclusive-terms" className="text-[10px] text-[#717171] leading-normal select-none">
                Je m'engage à commercialiser uniquement des créations certifiées d'excellence, de haute facture artisanale et de fabrication locale.
              </label>
            </div>

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A1118] hover:bg-[#60101B] disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 mt-6 flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <span>{loading ? 'Création de l\'espace...' : 'Inaugurer mon espace'}</span>
            </button>

          </form>
        )}

        {/* Majestic bottom return button */}
        <div className="pt-6 border-t border-[#1C1B1B]/10 flex justify-center">
          <button
            onClick={onCancel}
            className="text-[10px] font-semibold text-[#717171] hover:text-[#4A1118] uppercase tracking-[0.2em] flex items-center gap-2 transition duration-150 cursor-pointer font-sans"
            type="button"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Retourner vers le site public</span>
          </button>
        </div>

      </div>

    </div>
  );
}
