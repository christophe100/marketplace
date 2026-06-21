import React from 'react';
import { Heart, Star } from 'lucide-react';
import { Product } from '../types';

export interface ProductCardProps {
  product: Product;
  isFav: boolean;
  isListView: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (id: string) => void;
  key?: React.Key;
}

export default function ProductCard({
  product,
  isFav,
  isListView,
  onToggleFavorite,
  onViewDetails,
}: ProductCardProps): React.JSX.Element {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-shopera-burgundy transition-all duration-200 shadow-xs hover:shadow-md flex ${
        isListView ? 'flex-row p-4 gap-6' : 'flex-col p-4'
      } group relative`}
    >
      {/* Product photo frame */}
      <div className={`${isListView ? 'w-1/3 aspect-square' : 'w-full aspect-square'} bg-[#FAF7F2] rounded-lg relative overflow-hidden flex items-center justify-center p-4`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain drop-shadow transition duration-200 group-hover:scale-105 cursor-pointer"
          onClick={() => onViewDetails(product.id)}
        />
        
        {/* Toggle Favorite Badge */}
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-gray-400 hover:text-shopera-burgundy shadow-xs hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-shopera-burgundy text-shopera-burgundy' : ''}`} />
        </button>

        {product.isHot && (
          <span className="absolute top-2 left-2 bg-shopera-burgundy text-white text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
            HOT
          </span>
        )}
      </div>

      {/* Info Block */}
      <div className={`flex-1 flex flex-col justify-between ${isListView ? 'py-1' : 'pt-4'}`}>
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-mono font-extrabold text-shopera-gold tracking-wider uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h4
            onClick={() => onViewDetails(product.id)}
            className="font-extrabold text-sm text-shopera-dark leading-tight tracking-tight hover:text-shopera-burgundy transition cursor-pointer line-clamp-2"
          >
            {product.name}
          </h4>

          <p className="text-[11px] text-shopera-gray mt-1 leading-relaxed line-clamp-2 max-w-sm">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm font-sans font-semibold text-[#6D141F]">
            {product.price.toLocaleString('fr-FR')} FCFA
          </div>
          <button
            onClick={() => onViewDetails(product.id)}
            className="bg-[#FAF7F2] hover:bg-shopera-burgundy hover:text-white text-shopera-burgundy font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded transition duration-150 cursor-pointer"
          >
            Voir l&apos;offre
          </button>
        </div>
      </div>
    </div>
  );
}
