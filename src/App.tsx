

import React, { useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_SELLERS,
  Product,
  Order,
  Conversation,
  SellerProfile,
  CartItem,
  LogoConfig,
  DEFAULT_LOGO_CONFIG,
} from './types';
import BuyerPerspective from './components/BuyerPerspective';
import SellerPerspective from './components/SellerPerspective';
function parseStoredState<T>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved) as T;
  } catch {
    localStorage.removeItem(key);
    return defaultValue;
  }
}

import SellerAuthPortal from './components/SellerAuthPortal';
import AdminPerspective from './components/AdminPerspective';
import { 
  getBackendProducts, 
  getBackendSellers, 
  getBackendOrders, 
  checkoutApi, 
  addProductApi, 
  deleteProductApi, 
  updateOrderStatusApi 
} from './api';

export default function App() {
  // Global Connected States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shopera_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('shopera_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('shopera_conversations_v2');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [sellers, setSellers] = useState<SellerProfile[]>(() => {
    const saved = localStorage.getItem('shopera_sellers_v2');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopera_cart_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('shopera_favorites_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Logged Seller session state
  const [loggedSeller, setLoggedSeller] = useState<SellerProfile | null>(() => {
    const saved = localStorage.getItem('shopera_logged_seller_v2');
    return saved ? JSON.parse(saved) : null;
  });

  // Current active view: 'buyer' (the public site) or 'seller' (the authenticated panel) or 'seller_auth' (the login/signup screen) or 'admin' (the super-administrator panel)
  const [currentPerspective, setCurrentPerspective] = useState<'buyer' | 'seller' | 'seller_auth' | 'admin'>('buyer');
  const [sellerAuthInitialMode, setSellerAuthInitialMode] = useState<'login' | 'signup'>('login');

  // Unified buyer navigation states
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentBuyerTab, setCurrentBuyerTab] = useState<'home' | 'shop' | 'favorites' | 'profile'>('home');
  const [buyerCategoryFilter, setBuyerCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Logo Customization State loaded from localStorage with default 'ASSIGAME' branding
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => {
    const saved = localStorage.getItem('assigame_logo_config_v2');
    return saved ? JSON.parse(saved) : DEFAULT_LOGO_CONFIG;
  });

  // Persist State loops securely
  useEffect(() => {
    localStorage.setItem('shopera_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shopera_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('shopera_conversations_v2', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('shopera_sellers_v2', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('shopera_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shopera_favorites_v2', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('shopera_logged_seller_v2', JSON.stringify(loggedSeller));
  }, [loggedSeller]);

  useEffect(() => {
    localStorage.setItem('assigame_logo_config_v2', JSON.stringify(logoConfig));
  }, [logoConfig]);

  // Initial load of products, sellers, and orders from the Spring Boot backend
  useEffect(() => {
    async function loadData() {
      try {
        const backendProducts = await getBackendProducts();
        if (backendProducts && backendProducts.length > 0) {
          setProducts(backendProducts);
        }
      } catch (err) {
        console.warn("Using offline cached products:", err);
      }

      try {
        const backendSellers = await getBackendSellers();
        if (backendSellers && backendSellers.length > 0) {
          setSellers(backendSellers);
        }
      } catch (err) {
        console.warn("Using offline cached sellers:", err);
      }

      try {
        const backendOrders = await getBackendOrders();
        if (backendOrders && backendOrders.length > 0) {
          setOrders(backendOrders);
        }
      } catch (err) {
        console.warn("Using offline cached orders:", err);
      }
    }
    loadData();
  }, []);

  // ACTIONS FOR BUYERS
  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product, quantity: number, color: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.product.id) === String(product.id) && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(product.stock, next[existingIndex].quantity + quantity),
        };
        return next;
      }
      return [...prev, { product, quantity, selectedColor: color }];
    });
  };

  const handleRemoveFromCart = (productId: string, color: string) => {
    setCart((prev) =>
      prev.filter((item) => !(String(item.product.id) === String(productId) && item.selectedColor === color))
    );
  };

  const handleUpdateCartQuantity = (productId: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, color);
      return;
    }
    setCart((prev) => {
      const index = prev.findIndex(
        (item) => String(item.product.id) === String(productId) && item.selectedColor === color
      );
      if (index > -1) {
        const next = [...prev];
        next[index] = { ...next[index], quantity };
        return next;
      }
      return prev;
    });
  };

  const handleCheckout = async (buyerName: string, buyerEmail: string) => {
    if (cart.length === 0) return;

    const localOrders: Order[] = cart.map((item) => {
      const trackingNumber = `CMD-0${Math.floor(Math.random() * 900) + 100}`;
      const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const orderDate = formatter.format(new Date());

      return {
        id: trackingNumber,
        date: orderDate,
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        buyerName,
        buyerEmail,
        quantity: item.quantity,
        totalAmount: item.product.price * item.quantity,
        status: 'En attente',
        sellerId: item.product.sellerId,
      };
    });

    try {
      const savedOrders = await checkoutApi(localOrders);
      setOrders((prev) => [...savedOrders, ...prev]);
    } catch (err) {
      console.warn("Placing orders offline:", err);
      setOrders((prev) => [...localOrders, ...prev]);
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const boughtItem = cart.find((item) => item.product.id === p.id);
        if (boughtItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - boughtItem.quantity),
          };
        }
        return p;
      })
    );

    setCart([]);
  };

  const handleSendMessage = (conversationId: string, text: string, sender: 'buyer' | 'seller') => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const nowMsg = new Date();
          const timeStr = nowMsg.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const newMsg = {
            id: `msg-${Date.now()}-${Math.random()}`,
            sender,
            senderName: sender === 'buyer' ? 'Visiteur' : conv.sellerName,
            text,
            timestamp: timeStr,
          };
          return {
            ...conv,
            lastMessageText: text,
            lastMessageTime: timeStr,
            unreadCount: sender === 'seller' && currentPerspective === 'buyer' ? conv.unreadCount + 1 : conv.unreadCount,
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  // ACTIONS FOR SELLERS
  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!loggedSeller || !loggedSeller.token) {
      alert("Erreur : vous devez être connecté pour publier un article de luxe.");
      return;
    }

    try {
      const savedProd = await addProductApi(newProduct, loggedSeller.token);
      setProducts((prev) => [...prev, savedProd]);
      alert("Votre œuvre d'artisanat a été publiée et enregistrée sur le serveur avec succès !");
    } catch (err: any) {
      alert(`Échec de la publication sécurisée : ${err.message || "erreur serveur"}`);
      // Failover local state addition for offline capability (or testing without active DB process)
      const newId = `product-${Date.now()}`;
      setProducts((prev) => [...prev, { id: newId, ...newProduct }]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!loggedSeller || !loggedSeller.token) {
      alert("Erreur de session : veuillez vous reconnecter.");
      return;
    }

    try {
      await deleteProductApi(productId, loggedSeller.token);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("L'article de luxe a été retiré du catalogue.");
    } catch (err: any) {
      alert(`Erreur de suppression sur le serveur : ${err.message || 'code inconnu'}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!loggedSeller || !loggedSeller.token) {
      alert("Erreur de session : impossible d'enregistrer.");
      return;
    }

    try {
      await updateOrderStatusApi(orderId, status, loggedSeller.token);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
      );
      alert(`Le statut de la commande ${orderId} est maintenant "${status}".`);
    } catch (err: any) {
      alert(`Erreur de traitement : ${err.message || 'code inconnu'}`);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
      );
    }
  };

  // GATEWAY HANDLERS FOR ENTERING/LEAVING SELLER SPACE
  const handleEnterSellerSpace = (initialMode: 'login' | 'signup' = 'login') => {
    setSelectedProductId(null); // Close any open detail tabs
    if (loggedSeller) {
      if (loggedSeller.id === 'admin') {
        setCurrentPerspective('admin');
      } else {
        setCurrentPerspective('seller');
      }
    } else {
      setSellerAuthInitialMode(initialMode);
      setCurrentPerspective('seller_auth');
    }
  };

  const handleSellerLogin = (seller: SellerProfile) => {
    setLoggedSeller(seller);
    if (seller.id === 'admin') {
      setCurrentPerspective('admin');
    } else {
      setCurrentPerspective('seller');
    }
  };

  const handleSellerRegister = (newSellerData: Omit<SellerProfile, 'id' | 'joinDate' | 'status'>) => {
    const newStore: SellerProfile = {
      id: `sell-${Date.now()}`,
      storeName: newSellerData.storeName,
      ownerName: newSellerData.ownerName,
      email: newSellerData.email,
      phone: newSellerData.phone,
      address: newSellerData.address,
      status: 'approved', // Automatically validated for premium UX
      joinDate: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      rating: 5.0,
    };

    setSellers((prev) => [newStore, ...prev]);
    setLoggedSeller(newStore);
    setCurrentPerspective('seller');
    alert(`Félicitations pour l'ouverture de votre boutique ! "${newStore.storeName}" a été créée et activée avec succès. Vous pouvez maintenant publier vos articles de luxe.`);
  };

  const handleSellerLogout = () => {
    const wasAdmin = loggedSeller?.id === 'admin';
    setLoggedSeller(null);
    setCurrentPerspective('buyer');
    if (wasAdmin) {
      alert("Vous avez bien été déconnecté de l'espace d'administration suprême Assigame.");
    } else {
      alert("Vous avez bien été déconnecté de votre espace vendeur.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-shopera-dark antialiased">
      
      {/* PERSPECTIVE SWITCHING ROUTER */}
      <div className="flex-1">
        {currentPerspective === 'buyer' && (
          <BuyerPerspective
            products={products}
            orders={orders}
            conversations={conversations}
            cart={cart}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onCheckout={handleCheckout}
            onSendMessage={handleSendMessage}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
            currentTab={currentBuyerTab}
            onChangeTab={setCurrentBuyerTab}
            categoryFilter={buyerCategoryFilter}
            onSetCategoryFilter={setBuyerCategoryFilter}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
            loggedSeller={loggedSeller}
            onEnterSellerSpace={handleEnterSellerSpace}
            onLogout={handleSellerLogout}
            logoConfig={logoConfig}
            onUpdateLogoConfig={setLogoConfig}
          />
        )}

        {currentPerspective === 'seller_auth' && (
          <SellerAuthPortal
            sellers={sellers}
            onLogin={handleSellerLogin}
            onRegister={handleSellerRegister}
            onCancel={() => setCurrentPerspective('buyer')}
            logoConfig={logoConfig}
            initialMode={sellerAuthInitialMode}
          />
        )}

        {currentPerspective === 'seller' && loggedSeller && (
          <SellerPerspective
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            conversations={conversations}
            onSendMessage={handleSendMessage}
            activeSeller={loggedSeller}
            onLogout={handleSellerLogout}
            onBackToShop={() => setCurrentPerspective('buyer')}
            logoConfig={logoConfig}
          />
        )}

        {currentPerspective === 'admin' && (
          <AdminPerspective
            products={products}
            orders={orders}
            sellers={sellers}
            onUpdateSellers={setSellers}
            onUpdateProducts={setProducts}
            onUpdateOrders={setOrders}
            logoConfig={logoConfig}
            onUpdateLogoConfig={setLogoConfig}
            onLogout={handleSellerLogout}
          />
        )}
      </div>
    </div>
  );
}
