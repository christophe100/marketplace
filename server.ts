import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_SELLERS, INITIAL_ORDERS } from './src/types';


const PORT = 3000;
const STORE_PATH = path.join(process.cwd(), 'src', 'data-store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'shopera_luxury_marketplace_ultra_secure_jwt_secret_token_key_2026';

interface DbState {
  products: any[];
  sellers: any[];
  orders: any[];
  nextProductId: number;
  nextSellerId: number;
  nextOrderId: number;
}

let db: DbState;

function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function loadDb() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      console.log(`[Database] Loaded ${db.products.length} products, ${db.sellers.length} sellers, ${db.orders.length} orders.`);
      return;
    } catch (e) {
      console.error('[Database] Failed to parse store, reinitializing...', e);
    }
  }

  console.log('[Database] Seeding initial data rows...');
  
  const mappedSellers = INITIAL_SELLERS.map((s) => {
    const rawId = Number(s.id.split('-')[1]) || Math.floor(Math.random() * 1000) + 1;
    const salt = generateSalt();
    const passwordHash = hashPassword('Password123', salt);
    return {
      id: rawId,
      storeName: s.storeName,
      ownerName: s.ownerName,
      email: s.email.toLowerCase(),
      phone: s.phone,
      address: s.address,
      status: s.status,
      joinDate: s.joinDate,
      rating: s.rating || 5.0,
      isSuspended: s.isSuspended || false,
      salt,
      passwordHash
    };
  });
  
  const mappedProducts = INITIAL_PRODUCTS.map((p) => {
    const rawId = Number(p.id.split('-')[1]) || Math.floor(Math.random() * 1000) + 1;
    const sellerRawId = Number(p.sellerId.split('-')[1]) || 1;
    return {
      id: rawId,
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating || 5.0,
      reviewsCount: p.reviewsCount || 0,
      imageUrl: p.imageUrl,
      status: p.status || 'active',
      stock: p.stock || 0,
      brand: p.brand,
      description: p.description,
      colors: Array.isArray(p.colors) ? p.colors.join(',') : '',
      sellerId: sellerRawId,
      sellerName: p.sellerName,
      isHot: p.isHot || false,
      isNew: p.isNew || false
    };
  });
  
  const mappedOrders = INITIAL_ORDERS.map((o) => {
    const rawId = Number(o.id.split('-')[1]) || Math.floor(Math.random() * 1000) + 1;
    const prodRawId = Number(o.productId.split('-')[1]) || 1;
    const sellerRawId = Number(o.sellerId.split('-')[1]) || 1;
    return {
      id: rawId,
      date: o.date,
      productId: prodRawId,
      productName: o.productName,
      productImage: o.productImage,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      quantity: o.quantity,
      totalAmount: o.totalAmount,
      status: o.status || 'En traitement',
      sellerId: sellerRawId
    };
  });

  db = {
    products: mappedProducts,
    sellers: mappedSellers,
    orders: mappedOrders,
    nextProductId: 100,
    nextSellerId: 10,
    nextOrderId: 100
  };
  
  saveDb();
}

function saveDb() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf8');
}


function generateToken(sellerId: number, email: string, storeName: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: 'shopera-marketplace',
    sub: email,
    sellerId: sellerId,
    storeName: storeName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
  };
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
    
  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyToken(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }
  const [base64Header, base64Payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
  
  const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired');
  }
  return payload;
}


const ipLimits = new Map<string, { tokens: number; lastRefill: number }>();
const AUTH_MAX_TOKENS = 30; // Increased thresholds slightly in dev to prevent prompt spam blockages
const GLOBAL_MAX_TOKENS = 300; 
const REFILL_DURATION = 60000;

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const path = req.path;
  const isAuthEndpoint = path.includes('/sellers/login') || path.includes('/sellers/register');
  const key = `${ip}:${isAuthEndpoint ? 'auth' : 'global'}`;
  const maxTokens = isAuthEndpoint ? AUTH_MAX_TOKENS : GLOBAL_MAX_TOKENS;
  
  let entry = ipLimits.get(key);
  const now = Date.now();
  
  if (!entry) {
    entry = { tokens: maxTokens, lastRefill: now };
    ipLimits.set(key, entry);
  } else {
    const elapsed = now - entry.lastRefill;
    if (elapsed > 0) {
      entry.tokens = Math.min(maxTokens, entry.tokens + (elapsed / REFILL_DURATION) * maxTokens);
      entry.lastRefill = now;
    }
  }
  
  if (entry.tokens < 1.0) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Trop de requêtes détectées de manière consécutive. Veuillez patienter une minute avant de réessayer.',
      status: 429
    });
  }
  
  entry.tokens -= 1.0;
  next();
}

interface AuthenticatedRequest extends express.Request {
  authenticatedSellerId?: number;
  authenticatedStoreName?: string;
  authenticatedEmail?: string;
}

function authMiddleware(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return next();
  }
  
  // Public checkouts and seller auth are bypassable
  if (
    (req.path === '/api/orders' && req.method === 'POST') ||
    req.path === '/api/sellers/register' ||
    req.path === '/api/sellers/login' ||
    req.path === '/sellers/register' ||
    req.path === '/sellers/login'
  ) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Accès refusé: Jeton d\'authentification manquant dans l\'en-tête Authorization.',
      status: 401
    });
  }
  
  const token = authHeader.substring(7);
  try {
    const claims = verifyToken(token);
    req.authenticatedSellerId = Number(claims.sellerId);
    req.authenticatedStoreName = claims.storeName;
    req.authenticatedEmail = claims.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Jeton invalide ou expiré. Veuillez vous reconnecter.',
      status: 401
    });
  }
}


async function startServer() {
  loadDb();

  const app = express();
  app.use(express.json());
  
  // Rate-limiting and Security headers (matching SecurityHeadersFilter)
  app.use(rateLimitMiddleware);
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('Permission-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // Authentication context parser
  app.use(authMiddleware);


  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // --- PRODUCTS ---
  app.get('/api/products', (req, res) => {
    const { category, sellerId } = req.query;
    let list = db.products;

    if (category && category !== 'Tout') {
      const sanitizedCategory = sanitizeHtml(String(category)).toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === sanitizedCategory);
    }
    if (sellerId) {
      list = list.filter((p) => p.sellerId === Number(sellerId));
    }

    // Remap response color fields from strings to true JS arrays for modern frontend luxury UX
    const mapped = list.map((p) => ({
      ...p,
      colors: p.colors ? p.colors.split(',') : []
    }));

    res.json(mapped);
  });

  app.get('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }
    res.json({
      ...product,
      colors: product.colors ? product.colors.split(',') : []
    });
  });

  app.post('/api/products', (req: AuthenticatedRequest, res) => {
    const { authenticatedSellerId, authenticatedStoreName } = req;
    if (!authenticatedSellerId) {
      return res.status(401).json({ message: 'Identification de boutique requise pour ajouter un article.' });
    }

    const { name, category, price, originalPrice, imageUrl, stock, brand, description, colors, isHot, isNew } = req.body;
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: 'Données produit incomplètes ou invalides.' });
    }

    const product = {
      id: db.nextProductId++,
      name: sanitizeHtml(name),
      category: sanitizeHtml(category),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      imageUrl: imageUrl || '',
      stock: Number(stock),
      brand: brand ? sanitizeHtml(brand) : '',
      description: description ? sanitizeHtml(description) : '',
      colors: colors || '',
      isHot: !!isHot,
      isNew: !!isNew,
      sellerId: authenticatedSellerId,
      sellerName: authenticatedStoreName,
      status: 'active',
      rating: 5.0,
      reviewsCount: 0
    };

    db.products.unshift(product);
    saveDb();

    res.status(201).json(product);
  });

  app.put('/api/products/:id', (req: AuthenticatedRequest, res) => {
    const { authenticatedSellerId } = req;
    if (!authenticatedSellerId) {
      return res.status(401).json({ message: 'Authentification requise.' });
    }

    const id = Number(req.params.id);
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    const product = db.products[index];
    if (product.sellerId !== authenticatedSellerId) {
      return res.status(403).json({ message: 'Accès refusé: Cet article appartient à une autre enseigne.' });
    }

    const { name, category, price, originalPrice, imageUrl, stock, brand, description, colors, isHot, isNew } = req.body;
    
    product.name = name ? sanitizeHtml(name) : product.name;
    product.category = category ? sanitizeHtml(category) : product.category;
    product.price = price !== undefined ? Number(price) : product.price;
    product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.brand = brand !== undefined ? sanitizeHtml(brand) : product.brand;
    product.description = description !== undefined ? sanitizeHtml(description) : product.description;
    product.colors = colors !== undefined ? colors : product.colors;
    product.isHot = isHot !== undefined ? !!isHot : product.isHot;
    product.isNew = isNew !== undefined ? !!isNew : product.isNew;

    saveDb();
    res.json(product);
  });

  app.delete('/api/products/:id', (req: AuthenticatedRequest, res) => {
    const { authenticatedSellerId } = req;
    if (!authenticatedSellerId) {
      return res.status(401).json({ message: 'Authentification requise.' });
    }

    const id = Number(req.params.id);
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    if (db.products[index].sellerId !== authenticatedSellerId) {
      return res.status(403).json({ message: 'Accès refusé: Vous ne disposez pas des permissions pour supprimer cet article.' });
    }

    db.products.splice(index, 1);
    saveDb();
    res.json({ message: 'Article retiré de la boutique avec succès.' });
  });

  // --- SELLERS ---
  app.get('/api/sellers', (req, res) => {
    // Satisfies both spring-boot DTO requirements and React profiles perfectly
    const responseList = db.sellers.map((s) => ({
      id: s.id,
      storeName: s.storeName,
      ownerName: s.ownerName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      joinDate: s.joinDate,
      rating: s.rating,
      isSuspended: s.isSuspended,
      status: s.isSuspended ? 'rejected' : (s.status || 'approved')
    }));
    res.json(responseList);
  });

  app.get('/api/sellers/:id', (req, res) => {
    const id = Number(req.params.id);
    const s = db.sellers.find((x) => x.id === id);
    if (!s) {
      return res.status(404).json({ message: 'Boutique non trouvée.' });
    }
    res.json({
      id: s.id,
      storeName: s.storeName,
      ownerName: s.ownerName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      joinDate: s.joinDate,
      rating: s.rating,
      isSuspended: s.isSuspended,
      status: s.isSuspended ? 'rejected' : (s.status || 'approved')
    });
  });

  app.post('/api/sellers/register', (req, res) => {
    const { storeName, ownerName, email, phone, address, password } = req.body;
    
    if (!storeName || !ownerName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStore = storeName.trim();

    if (db.sellers.some((s) => s.email === normalizedEmail)) {
      return res.status(400).json({ message: 'L\'adresse email est déjà utilisée par une autre boutique.' });
    }
    if (db.sellers.some((s) => s.storeName.toLowerCase() === normalizedStore.toLowerCase())) {
      return res.status(400).json({ message: 'Le nom de la boutique est déjà utilisé. Veuillez en choisir un autre unique.' });
    }

    // Password composition audit (matches Java regex)
    const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({
        message: 'Sécurité du mot de passe insuffisante. Le mot de passe doit mesurer au moins 8 caractères, contenir au moins un chiffre, une lettre minuscule et une lettre majuscule.'
      });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const dateOptions = { day: 'numeric' as const, month: 'long' as const, year: 'numeric' as const };
    const joinDate = new Intl.DateTimeFormat('fr-FR', dateOptions).format(new Date());

    const newSeller = {
      id: db.nextSellerId++,
      storeName: sanitizeHtml(storeName),
      ownerName: sanitizeHtml(ownerName),
      email: normalizedEmail,
      phone: sanitizeHtml(phone),
      address: sanitizeHtml(address),
      rating: 5.0,
      isSuspended: false,
      status: 'approved',
      joinDate,
      salt,
      passwordHash
    };

    db.sellers.unshift(newSeller);
    saveDb();

    const token = generateToken(newSeller.id, newSeller.email, newSeller.storeName);

    res.status(201).json({
      id: newSeller.id,
      storeName: newSeller.storeName,
      ownerName: newSeller.ownerName,
      email: newSeller.email,
      phone: newSeller.phone,
      address: newSeller.address,
      joinDate: newSeller.joinDate,
      rating: newSeller.rating,
      isSuspended: newSeller.isSuspended,
      status: newSeller.status,
      token
    });
  });

  app.post('/api/sellers/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Adresse email et mot de passe requis.' });
    }

    const s = db.sellers.find((x) => x.email === email.trim().toLowerCase());
    if (!s) {
      return res.status(404).json({ message: 'Aucune boutique enregistrée avec cette adresse email.' });
    }

    if (s.isSuspended) {
      return res.status(403).json({ message: 'Votre boutique exclusive a été suspendue temporairement de la plateforme.' });
    }

    const matches = hashPassword(password, s.salt) === s.passwordHash;
    if (!matches) {
      return res.status(401).json({ message: 'Mot de passe incorrect. Veuillez réessayer.' });
    }

    const token = generateToken(s.id, s.email, s.storeName);

    res.json({
      id: s.id,
      storeName: s.storeName,
      ownerName: s.ownerName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      joinDate: s.joinDate,
      rating: s.rating,
      isSuspended: s.isSuspended,
      status: s.isSuspended ? 'rejected' : (s.status || 'approved'),
      token
    });
  });

  // --- ORDERS ---
  app.get('/api/orders', (req, res) => {
    const { sellerId, buyerEmail } = req.query;
    let list = db.orders;

    if (sellerId) {
      list = list.filter((o) => o.sellerId === Number(sellerId));
    }
    if (buyerEmail) {
      list = list.filter((o) => o.buyerEmail.toLowerCase() === String(buyerEmail).trim().toLowerCase());
    }

    res.json(list);
  });

  app.post('/api/orders', (req, res) => {
    const orders = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: 'La liste de commandes ne peut pas être vide.' });
    }

    const savedOrders: any[] = [];
    orders.forEach((o) => {
      const newOrder = {
        id: db.nextOrderId++,
        date: o.date || new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
        productId: Number(o.productId),
        productName: sanitizeHtml(o.productName),
        productImage: o.productImage || '',
        buyerName: sanitizeHtml(o.buyerName),
        buyerEmail: sanitizeHtml(o.buyerEmail).toLowerCase(),
        quantity: Number(o.quantity),
        totalAmount: Number(o.totalAmount),
        status: 'En traitement',
        sellerId: Number(o.sellerId)
      };
      
      // Update inventory stock quietly
      const prod = db.products.find((p) => p.id === newOrder.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - newOrder.quantity);
      }

      db.orders.unshift(newOrder);
      savedOrders.push(newOrder);
    });

    saveDb();
    res.status(201).json(savedOrders);
  });

  app.put('/api/orders/:id/status', (req: AuthenticatedRequest, res) => {
    const { authenticatedSellerId } = req;
    if (!authenticatedSellerId) {
      return res.status(401).json({ message: 'Authentification requise.' });
    }

    const id = Number(req.params.id);
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    if (order.sellerId !== authenticatedSellerId) {
      return res.status(403).json({ message: 'Accès refusé: Vous ne pouvez pas modifier une commande d\'une autre boutique.' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Statut manquant.' });
    }

    order.status = sanitizeHtml(status).trim();
    saveDb();

    res.json({
      message: 'Le statut de la commande a été mis à jour de manière sécurisée !',
      status: order.status
    });
  });



  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shopera Server] Running full-stack on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Shopera Server] Failed to bootstrap server:', err);
});
