import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, Grid, List, Search } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductCatalogueViewProps {
  products: Product[];
  categoryFilter: string | null;
  onSetCategoryFilter: (category: string | null) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  handleOpenProductDetails: (productId: string) => void;
  dynamicCategories: string[];
}

const ITEMS_PER_PAGE = 9;

export default function ProductCatalogueView({
  products,
  categoryFilter,
  onSetCategoryFilter,
  searchQuery,
  onSetSearchQuery,
  favorites,
  onToggleFavorite,
  handleOpenProductDetails,
  dynamicCategories,
}: ProductCatalogueViewProps) {
  // Local Filter Preferences
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isListView, setIsListView] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset pagination when any search/filter preference changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery, selectedBrand, maxPrice, sortBy]);

  // Filtered public products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be approved / active
      if (p.status !== 'active') return false;

      // Category Scope Filter
      if (categoryFilter && categoryFilter !== 'Tout') {
        if (p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Search matching text
      if (searchQuery) {
        const text = (p.name + ' ' + p.description + ' ' + p.category + ' ' + p.brand).toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }

      // Brand selection widget
      if (selectedBrand) {
        if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // Price slider
      if (p.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default / brand-new
      return String(b.id).localeCompare(String(a.id));
    });
  }, [products, categoryFilter, searchQuery, selectedBrand, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Unique list of active product brands to display inside checkout filters
  const availableBrands = useMemo(() => {
    const list = products.filter(p => p.status === 'active').map((p) => p.brand);
    return Array.from(new Set(list));
  }, [products]);

  return (
    <div id="product-catalogue-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in text-sans">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters panel */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          
          {/* Category Filter Box */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Catégories</span>
              <Filter className="w-4 h-4 text-shopera-gray" />
            </h3>
            <div className="flex flex-col gap-1.5">
              {dynamicCategories.map((cat) => {
                const isSelected = (cat === 'Tout' && !categoryFilter) || (categoryFilter === cat);
                return (
                  <button
                    key={cat}
                    onClick={() => onSetCategoryFilter(cat === 'Tout' ? null : cat)}
                    className={`text-left text-xs py-2 px-3 rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] text-shopera-burgundy font-bold border-l-2 border-shopera-burgundy'
                        : 'text-shopera-gray hover:text-shopera-dark hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Filter Slider */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Filtrer par Prix (FCFA)
            </h3>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shopera-burgundy"
            />
            <div className="flex justify-between items-center text-xs text-shopera-gray mt-2 font-mono">
              <span>10 000 FCFA</span>
              <span className="text-shopera-burgundy font-semibold">
                {maxPrice.toLocaleString('fr-FR')} FCFA max
              </span>
            </div>
          </div>

          {/* Brands selector widget */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Marques
            </h3>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2 text-xs text-shopera-gray cursor-pointer">
                <input
                  type="radio"
                  name="brand_filter"
                  checked={selectedBrand === ''}
                  onChange={() => setSelectedBrand('')}
                  className="rounded text-shopera-burgundy focus:ring-rose-950 border-gray-300"
                />
                <span>Toutes les marques</span>
              </label>
              {availableBrands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-xs text-shopera-gray cursor-pointer">
                  <input
                    type="radio"
                    name="brand_filter"
                    checked={selectedBrand === b}
                    onChange={() => setSelectedBrand(b)}
                    className="rounded text-shopera-burgundy focus:ring-rose-950 border-gray-300"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content listings */}
        <main className="flex-1">
          
          {/* Results Header options */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-shopera-gray text-center sm:text-left">
              Nous avons trouvé <strong className="text-shopera-dark font-bold">{filteredProducts.length}</strong> produits d&apos;exception.
              {categoryFilter && (
                <span> pour la catégorie <strong className="text-shopera-burgundy">{categoryFilter}</strong></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-shopera-gray hidden sm:inline">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs leading-none focus:outline-none focus:ring-1 focus:ring-shopera-burgundy"
                >
                  <option value="recent">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Meilleures notes</option>
                </select>
              </div>

              {/* Display toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white">
                <button
                  onClick={() => setIsListView(false)}
                  className={`p-1.5 rounded transition cursor-pointer ${!isListView ? 'bg-shopera-tan text-shopera-burgundy font-bold' : 'text-shopera-gray'}`}
                  title="Grille"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsListView(true)}
                  className={`p-1.5 rounded transition cursor-pointer ${isListView ? 'bg-shopera-tan text-shopera-burgundy font-bold' : 'text-shopera-gray'}`}
                  title="Liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid or List list output */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl py-16 px-4 text-center border border-gray-100">
              <SlidersHorizontal className="w-12 h-12 text-shopera-gray/30 mx-auto mb-4" />
              <h4 className="font-extrabold text-sm text-shopera-dark uppercase tracking-wider">Aucun produit</h4>
              <p className="text-xs text-shopera-gray mt-1.5 max-w-sm mx-auto font-sans">
                Nous n&apos;avons pas d&apos;articles satisfaisant ces filtres ou cette recherche. Essayez de réinitialiser vos paramètres.
              </p>
              <button
                onClick={() => {
                  onSetCategoryFilter(null);
                  onSetSearchQuery('');
                  setSelectedBrand('');
                  setMaxPrice(1000000);
                }}
                className="mt-4 inline-block bg-shopera-burgundy text-white hover:bg-shopera-burgundy-light font-bold text-xs uppercase px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className={isListView ? "space-y-4 font-sans" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"}>
              {paginatedProducts.map((p) => {
                const isFav = favorites.includes(p.id);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav={isFav}
                    isListView={isListView}
                    onToggleFavorite={onToggleFavorite}
                    onViewDetails={handleOpenProductDetails}
                  />
                );
              })}
            </div>
          )}

          {/* Real interactive pagination element */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-[#eaeaea] bg-[#fcfcfc] rounded-[20px] text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-shopera-dark transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Précédent
              </button>
              
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Dynamic smart pagination matching layout [ 1 ] [ 2 ] [ 3 ] ... [ 8 ]
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, '...', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage, '...', totalPages);
                  }
                }
                
                return pages.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-gray-400 select-none tracking-widest shrink-0">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(page);
                  const isCurrent = currentPage === pageNum;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3.5 py-2 min-w-[38px] text-center rounded-[20px] text-xs font-bold transition cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'border-2 border-shopera-burgundy bg-white text-shopera-burgundy font-extrabold shadow-sm'
                          : 'border border-[#eaeaea] bg-[#fcfcfc] text-gray-500 hover:bg-gray-100 font-medium'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-[#eaeaea] bg-[#fcfcfc] rounded-[20px] text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-shopera-dark transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
