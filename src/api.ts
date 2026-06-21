import { Product, SellerProfile, Order } from './types';

// The API endpoints are proxied via Vite. Configured path prefix is `/api`.
const API_BASE = '/api';

/**
 * Fetch products from Spring Boot backend. Fallback to offline cached / default ones if empty or failed.
 */
export async function getBackendProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((p: any) => ({
        ...p,
        id: String(p.id),
        sellerId: String(p.sellerId),
        colors: Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : [])
      }));
    }
    return [];
  } catch (error) {
    console.warn('Backend products fetch failed, using local fallback:', error);
    throw error;
  }
}

/**
 * Fetch registered sellers from Spring Boot backend.
 */
export async function getBackendSellers(): Promise<SellerProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/sellers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((s: any) => ({
        ...s,
        id: String(s.id),
      }));
    }
    return [];
  } catch (error) {
    console.warn('Backend sellers fetch failed:', error);
    throw error;
  }
}

/**
 * Fetch orders from Spring Boot backend.
 */
export async function getBackendOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((o: any) => ({
        ...o,
        id: String(o.id),
        productId: String(o.productId),
        sellerId: String(o.sellerId),
      }));
    }
    return [];
  } catch (error) {
    console.warn('Backend orders fetch failed:', error);
    throw error;
  }
}

/**
 * Call the backend to login.
 */
export async function loginSellerApi(email: string, password: String): Promise<SellerProfile> {
  const res = await fetch(`${API_BASE}/sellers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Identifiants incorrects ou erreur de serveur.');
  }

  const dtoObj = await res.json();
  // Map SellerResponseDto to client SellerProfile type
  return {
    id: String(dtoObj.id),
    storeName: dtoObj.storeName,
    ownerName: dtoObj.ownerName,
    email: dtoObj.email,
    phone: dtoObj.phone,
    address: dtoObj.address,
    status: dtoObj.isSuspended ? 'rejected' : 'approved',
    joinDate: dtoObj.joinDate,
    rating: dtoObj.rating || 5.0,
    isSuspended: dtoObj.isSuspended,
    token: dtoObj.token, // Store JWT token for secure API calls
  };
}

/**
 * Call the backend to register a high-end seller boutique.
 */
export async function registerSellerApi(payload: any): Promise<SellerProfile> {
  const res = await fetch(`${API_BASE}/sellers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur de validation des données d'enregistrement.");
  }

  const dtoObj = await res.json();
  return {
    id: String(dtoObj.id),
    storeName: dtoObj.storeName,
    ownerName: dtoObj.ownerName,
    email: dtoObj.email,
    phone: dtoObj.phone,
    address: dtoObj.address,
    status: 'approved',
    joinDate: dtoObj.joinDate,
    rating: dtoObj.rating || 5.0,
    isSuspended: dtoObj.isSuspended,
    token: dtoObj.token, // Signed session token
  };
}

/**
 * Post a luxury article into the Spring Boot backend catalog.
 */
export async function addProductApi(product: Omit<Product, 'id'>, token: string): Promise<Product> {
  const colorsText = Array.isArray(product.colors) ? product.colors.join(',') : '';

  const payload = {
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    imageUrl: product.imageUrl,
    stock: product.stock,
    brand: product.brand,
    description: product.description,
    colors: colorsText,
    isHot: product.isHot || false,
    isNew: product.isNew || false,
  };

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la publication de l’article.');
  }

  const saved = await res.json();
  return {
    ...saved,
    id: String(saved.id),
    colors: saved.colors ? saved.colors.split(',') : [],
  };
}

/**
 * Delete a product from the Spring Boot backend catalog.
 */
export async function deleteProductApi(productId: string, token: string): Promise<void> {
  // Extract number component from id format (supports product-12 or 12 directly)
  const idToCall = productId.includes('-') ? productId.split('-')[1] : productId;

  const res = await fetch(`${API_BASE}/products/${idToCall}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la suppression de l’article.');
  }
}

/**
 * Checkout and place order items through guest checkout backend.
 */
export async function checkoutApi(orders: Order[]): Promise<Order[]> {
  const backendOrders = orders.map((o) => {
    // Extract numerical key components or keep them
    const pId = o.productId.includes('-') ? o.productId.split('-')[1] : o.productId;
    const sId = String(o.sellerId).includes('-') ? String(o.sellerId).split('-')[1] : o.sellerId;

    return {
      date: o.date,
      productId: isNaN(Number(pId)) ? 1 : Number(pId), // Fallback safeties for dynamic values
      productName: o.productName,
      productImage: o.productImage,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      quantity: o.quantity,
      totalAmount: o.totalAmount,
      status: o.status,
      sellerId: isNaN(Number(sId)) ? 1 : Number(sId),
    };
  });

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendOrders),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors du traitement de la commande.');
  }

  const saved = await res.json();
  return saved.map((o: any, idx: number) => ({
    ...orders[idx],
    id: `CMD-${o.id}`, // Maintain custom format prefix for continuity
  }));
}

/**
 * Update active order state securely inside DB.
 */
export async function updateOrderStatusApi(orderId: string, status: string, token: string): Promise<void> {
  const numericId = orderId.includes('-') ? orderId.split('-')[1] : orderId;

  const res = await fetch(`${API_BASE}/orders/${numericId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la mise à jour du statut.');
  }
}
