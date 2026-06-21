import React, { useState, useEffect } from 'react';
import heroMarketplace from '../assets/images/hero_marketplace_1781735119105.jpg';

const HERO_IMAGES = [
  heroMarketplace,
  'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
];

export default function HeroSlideshow() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] lg:h-[480px] overflow-hidden bg-transparent group">
      {HERO_IMAGES.map((imgUrl, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[1000ms] ease-in-out ${
            idx === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            alt={`ASSIGAME Premium Artisan Showcase ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out hover:scale-105"
            src={imgUrl}
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Soft gradient overlay at the bottom for aesthetic blending */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent z-20 pointer-events-none" />

      {/* Slideshow dots controller inside the container */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-full">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentHeroIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentHeroIndex 
                ? 'bg-white w-4' 
                : 'bg-white/45 hover:bg-white/80'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
