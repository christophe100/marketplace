import React from 'react';
import sacsImg from '../assets/images/categorie/sacs-removebg-preview.png';
import meublesImg from '../assets/images/categorie/meubles.png';
import montresImg from '../assets/images/categorie/montre-removebg-preview.png';
import chaussuresImg from '../assets/images/categorie/chaussure-removebg-preview.png';
import lunettesImg from '../assets/images/categorie/lunette-removebg-preview.png';
import parfumsImg from '../assets/images/categorie/parfum-removebg-preview.png';

interface CategoryItem {
  id: string;
  name: string;
  badge: string;
  number: string;
  description: string;
  bgClass: string;
  imageUrl: string;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 'Sacs',
    name: 'Sacs',
    badge: 'SACS',
    number: '01',
    description: 'Élégance au quotidien.',
    bgClass: 'from-[#1D63ED] to-[#013CC6]',
    imageUrl: sacsImg,
  },
  {
    id: 'Meubles',
    name: 'Meubles',
    badge: 'MEUBLES',
    number: '02',
    description: 'Confort et design pour votre intérieur.',
    bgClass: 'from-[#FA7215] to-[#E25500]',
    imageUrl: meublesImg,
  },
  {
    id: 'Montres',
    name: 'Montres',
    badge: 'MONTRES',
    number: '03',
    description: 'Le temps avec style.',
    bgClass: 'from-[#884BFD] to-[#591BDD]',
    imageUrl: montresImg,
  },
  {
    id: 'Chaussures',
    name: 'Chaussures',
    badge: 'CHAUSSURES',
    number: '04',
    description: 'Confort et performance à chaque pas.',
    bgClass: 'from-[#EF3A4B] to-[#C91325]',
    imageUrl: chaussuresImg,
  },
  {
    id: 'Lunettes',
    name: 'Lunettes',
    badge: 'LUNETTES',
    number: '05',
    description: 'Affirmez votre regard.',
    bgClass: 'from-[#10B981] to-[#047857]',
    imageUrl: lunettesImg,
  },
  {
    id: 'Parfums',
    name: 'Parfums',
    badge: 'PARFUMS',
    number: '06',
    description: "L'essence de votre personnalité.",
    bgClass: 'from-[#EC4899] to-[#BE185D]',
    imageUrl: parfumsImg,
  },
];

interface CategoriesGridProps {
  onSelectCategory: (name: string) => void;
}

export default function CategoriesGrid({ onSelectCategory }: CategoriesGridProps) {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 md:px-8 font-sans">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-shopera-dark tracking-tight">
            Catégories populaires
          </h2>
          <p className="text-sm text-shopera-gray mt-1">
            Explorez nos sélections exclusives et pièces de créateurs haut de gamme.
          </p>
        </div>
        <button
          onClick={() => onSelectCategory('Tout')}
          className="text-shopera-burgundy text-sm font-extrabold hover:underline transition cursor-pointer"
        >
          Voir toute la boutique →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {CATEGORY_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectCategory(item.name)}
            className={`relative rounded-xl p-4 md:p-5 overflow-visible flex flex-col justify-between h-[145px] sm:h-[155px] md:h-[165px] text-white shadow hover:shadow-xl group transition-all duration-300 select-none cursor-pointer bg-gradient-to-br ${item.bgClass}`}
          >
            {/* Translucent translucent number on background */}
            <div className="absolute top-2 right-6 font-black text-[60px] md:text-[75px] leading-none text-white/10 select-none tracking-tighter">
              {item.number}
            </div>

            {/* Content metadata */}
            <div className="space-y-2.5 max-w-[55%] z-10">
              <span className="inline-block bg-white/20 backdrop-blur-md text-[9px] md:text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full text-white border border-white/10">
                {item.badge}
              </span>

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-300">
                  {item.name}
                </h3>
                <p className="text-[11px] md:text-xs text-white/85 leading-snug font-medium line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Discover CTA Button */}
            <div className="z-10">
              <button className="flex items-center gap-1.5 border border-white/50 bg-white/10 hover:bg-white hover:text-black font-extrabold text-[9px] md:text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer">
                Découvrir <span className="text-[10px] transition-transform group-hover:translate-x-1">➔</span>
              </button>
            </div>

            {/* 3D Looking Object floating frame overlay on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-[48%] flex items-center justify-center p-2 overflow-visible">
              <div className="w-full h-full relative flex items-center justify-center overflow-visible">
                {/* Visual shadow effect on image bottom */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-black/45 blur-md rounded-full scale-y-45 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500" />
                
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-w-[105%] max-h-[105%] md:max-w-[115%] md:max-h-[115%] w-auto h-auto object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_16px_22px_rgba(0,0,0,0.45)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 ease-out z-20 rounded-lg bg-transparent"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
