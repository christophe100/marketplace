
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in FCFA
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  status: 'active' | 'inactive' | 'pending';
  stock: number;
  brand: string;
  description: string;
  features: string[];
  dimensions?: string;
  colors: string[];
  sellerId: string;
  sellerName: string;
  isHot?: boolean;
  isNew?: boolean;
}

export interface Order {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalAmount: number;
  status: 'Livrée' | 'En traitement' | 'Expédiée' | 'Annulée' | 'En attente';
  sellerId: string;
}

export interface Message {
  id: string;
  sender: 'buyer' | 'seller' | 'admin' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerName: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface SellerProfile {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'approved' | 'pending' | 'rejected';
  joinDate: string;
  logoUrl?: string;
  rating?: number;
  isSuspended?: boolean;
  token?: string; // JWT Bearer token for secure backend communications
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface LogoConfig {
  text: string;
  iconName: string;
  bgColor: string;
  textColor: string;
  logoType: 'text_icon' | 'image';
  imageUrl: string;
  borderRadius: string;
}

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  text: 'ASSIGAME',
  iconName: 'ShoppingBag',
  bgColor: '#4A1118',
  textColor: '#4A1118',
  logoType: 'text_icon',
  imageUrl: '',
  borderRadius: 'rounded-lg'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Sac Élégant en Cuir Premium',
    category: 'Sacs',
    price: 79000,
    originalPrice: 95000,
    rating: 4.7,
    reviewsCount: 76,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', // Beautiful luxury tan handbag
    status: 'active',
    stock: 12,
    brand: 'Fashion Store',
    description: 'Ce sac élégant est conçu avec du cuir de haute qualité et une attention particulière aux détails. Il dispose de plusieurs compartiments pour garder vos essentiels bien organisés, tout en conservant une silhouette gracieuse et structurée. Que ce soit pour un rendez-vous d\'affaires ou une sortie décontractée, il s\'adapte parfaitement à votre style.',
    features: [
      'Cuir de qualité supérieure',
      'Plusieurs compartiments intérieurs',
      'Bandoulière réglable et amovible',
      'Fermeture zippée sécurisée'
    ],
    dimensions: '25cm x 20cm x 12cm',
    colors: ['#D2B48C', '#321414', '#1A1A1A'], // Beige, Brown, Black
    sellerId: 'sell-1',
    sellerName: 'Fashion Store',
    isHot: true,
    isNew: true
  },
  {
    id: 'prod-2',
    name: 'Fauteuil Moderne Scandi-Luxe',
    category: 'Meubles',
    price: 249000,
    rating: 4.8,
    reviewsCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80', // Stylish scandinavian green armchair
    status: 'active',
    stock: 8,
    brand: 'Home Decor',
    description: 'Un fauteuil moderne alliant design scandinave classique et confort exceptionnel. Rembourré dans un tissu de velours résistant et supporté par des pieds en bois massif robuste, cette pièce est parfaite pour enrichir le décor de votre salon ou de votre espace lecture.',
    features: [
      'Tissu velours ultra-doux',
      'Pieds en chêne massif',
      'Structure ergonomique confortable',
      'Design scandinave minimaliste'
    ],
    dimensions: '85cm x 80cm x 75cm',
    colors: ['#2E4F4F', '#0E2954', '#555555'],
    sellerId: 'sell-2',
    sellerName: 'Home Decor',
    isNew: true
  },
  {
    id: 'prod-3',
    name: 'Montre Classique Chronographe',
    category: 'Montres',
    price: 129000,
    rating: 4.6,
    reviewsCount: 80,
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80', // Classy watch
    status: 'active',
    stock: 15,
    brand: 'Tech World',
    description: 'Une montre analogique intemporelle conçue pour l\'homme moderne. Elle intègre un mécanisme à quartz fiable, un cadran avec dateur et chronographe, et un bracelet en cuir véritable cousu main qui prend de la patine avec le temps.',
    features: [
      'Mécanisme d\'horlogerie à quartz japonais',
      'Bracelet en cuir véritable brun',
      'Boîtier en acier inoxydable poli',
      'Résistance à l\'eau jusqu\'à 50 mètres'
    ],
    dimensions: 'Diamètre cadran : 42mm',
    colors: ['#3A2212', '#1C1C1C'],
    sellerId: 'sell-3',
    sellerName: 'Tech World'
  },
  {
    id: 'prod-4',
    name: 'Baskets Minimalistes Premium',
    category: 'Chaussures',
    price: 89000,
    rating: 4.5,
    reviewsCount: 60,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', // Clean shoes
    status: 'active',
    stock: 22,
    brand: 'Elite Sneakers',
    description: 'Baskets minimalistes épurées conçues pour une élégance quotidienne absolue. Faites de cuir pleine fleur avec une semelle extérieure cousue robuste en caoutchouc pour un confort durable de jour comme de nuit.',
    features: [
      'Cuir pleine fleur blanc italien',
      'Semelle de confort hybride à mémoire de forme',
      'Lacets de coton ciré premium',
      'Couture de renfort latérale'
    ],
    dimensions: 'Tailles disponibles : 40 à 45',
    colors: ['#FFFFFF', '#EAEAEA', '#333333'],
    sellerId: 'sell-1',
    sellerName: 'Fashion Store'
  },
  {
    id: 'prod-5',
    name: 'Lunettes de Soleil Aviator Luxury',
    category: 'Lunettes',
    price: 49000,
    rating: 4.6,
    reviewsCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', // Sunglasses
    status: 'active',
    stock: 30,
    brand: 'Sun & Style',
    description: 'Protégez vos yeux avec un style intemporel. Ces lunettes de soleil de style aviateur possèdent une monture métallique plaquée ultra-légère et des verres polarisés de couleur ambrée qui éliminent les reflets tout en accentuant les couleurs.',
    features: [
      'Verres polarisés de catégorie 3',
      'Monture métallique légère en alliage d\'or',
      'Plaquettes de nez douces ajustables',
      'Protection UV400 complète'
    ],
    colors: ['#C5A059', '#1C1B1B'],
    sellerId: 'sell-3',
    sellerName: 'Tech World'
  },
  {
    id: 'prod-6',
    name: 'Parfum Oudh Extrême',
    category: 'Parfums',
    price: 35000,
    rating: 4.3,
    reviewsCount: 22,
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80', // Parfum bottle
    status: 'active',
    stock: 18,
    brand: 'Luxury Scents',
    description: 'Une fragrance sensuelle et mystique, dominée par les notes envoûtantes de bois d\'oudh oriental, de rose de Damas fraîche et de vanille veloutée. L\'essence ultime de l\'élégance discrète et du luxe olfactif.',
    features: [
      'Notes de tête : Safran, Poivre Rose',
      'Notes de cœur : Rose de Damas, Bois de Santal',
      'Notes de fond : Oudh d\'origine, Vanille bourbon, Cuir chaud',
      'Flacon de 100ml rechargeable'
    ],
    colors: ['#1A0C06', '#EBC49F'],
    sellerId: 'sell-2',
    sellerName: 'Home Decor'
  },
  {
    id: 'prod-7',
    name: 'Smartphone Pro Max X30',
    category: 'Électroniques',
    price: 699000,
    rating: 4.7,
    reviewsCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', // Smart phone
    status: 'active',
    stock: 6,
    brand: 'Tech World',
    description: 'Le summum de l\'innovation mobile. Écran OLED de 6.7 pouces ultra-fluide 120Hz, triple objectif photo de 108 Mpx avec zoom optique longue portée, et un processeur de dernière génération gérant l\'IA en temps réel pour optimiser vos performances quotidiennes.',
    features: [
      'Processeur Octa-core AI ready 4nm',
      'Mémoire interne de 256 Go / 12 Go de RAM',
      'Écran Super Retina XDR 120Hz',
      'Super charge rapide 65W par USB-C'
    ],
    colors: ['#2C302E', '#E5E5E5', '#A5D7E8'],
    sellerId: 'sell-3',
    sellerName: 'Tech World'
  },
  {
    id: 'prod-8',
    name: 'Casques Audio Studio Studio-X',
    category: 'Électroniques',
    price: 159000,
    rating: 4.5,
    reviewsCount: 67,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', // High end headphones
    status: 'active',
    stock: 14,
    brand: 'Tech Luxe',
    description: 'Une clarté sonore exceptionnelle et une réduction de bruit active hybride de pointe. Conçu pour les audiophiles exigeants et les professionnels, le Studio-X enveloppe vos sens pour une immersion sonore totale sans compromis de confort.',
    features: [
      'Réduction Active de Bruit (ANC) hybride de 40dB',
      'Autonomie incroyable de 45 heures avec ANC',
      'Pilotes en résine acoustique de 40mm',
      'Bluetooth multipoint 5.2 à latence minimale'
    ],
    colors: ['#1a1a1a', '#FDFBF9', '#4A1118'],
    sellerId: 'sell-3',
    sellerName: 'Tech World'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'CMD-001',
    date: '15 Juin 2026',
    productId: 'prod-1',
    productName: 'Sac Élégant en Cuir Premium',
    productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    buyerName: 'John Doe',
    buyerEmail: 'john.doe@gmail.com',
    quantity: 1,
    totalAmount: 79000,
    status: 'Livrée',
    sellerId: 'sell-1'
  },
  {
    id: 'CMD-002',
    date: '10 Juin 2026',
    productId: 'prod-3',
    productName: 'Montre Classique Chronographe',
    productImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80',
    buyerName: 'Jane Smith',
    buyerEmail: 'jane.smith@yahoo.fr',
    quantity: 1,
    totalAmount: 129000,
    status: 'En traitement',
    sellerId: 'sell-3'
  },
  {
    id: 'CMD-003',
    date: '05 Juin 2026',
    productId: 'prod-7',
    productName: 'Smartphone Pro Max X30',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    buyerName: 'Mike Johnson',
    buyerEmail: 'mike.j@hotmail.com',
    quantity: 1,
    totalAmount: 699000,
    status: 'Expédiée',
    sellerId: 'sell-3'
  },
  {
    id: 'CMD-004',
    date: '28 Mai 2026',
    productId: 'prod-5',
    productName: 'Lunettes de Soleil Aviator Luxury',
    productImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    buyerName: 'Sarah Wilson',
    buyerEmail: 'sarah.w@gmail.com',
    quantity: 2,
    totalAmount: 98000,
    status: 'Livrée',
    sellerId: 'sell-3'
  },
  {
    id: 'CMD-005',
    date: '20 Mai 2026',
    productId: 'prod-8',
    productName: 'Casques Audio Studio Studio-X',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    buyerName: 'David Brown',
    buyerEmail: 'david.b@gmail.com',
    quantity: 1,
    totalAmount: 159000,
    status: 'Annulée',
    sellerId: 'sell-3'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    buyerName: 'Client Bastos',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sellerName: 'Fashion Store',
    lastMessageText: 'Parfait, merci ! Je vais finaliser mon panier maintenant. Est-ce qu\'il y a une promotion en cours ?',
    lastMessageTime: '14:20',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        sender: 'buyer',
        senderName: 'Client Bastos',
        text: 'Bonjour, je suis intéressé par le sac "Sac Élégant" en beige. Est-il disponible immédiatement pour une livraison à Douala ?',
        timestamp: '14:15'
      },
      {
        id: 'm2',
        sender: 'seller',
        senderName: 'Fashion Store',
        text: 'Bonjour ! Oui, il nous en reste exactement 3 en stock dans ce coloris. Si vous commandez avant 16h, l\'expédition se fera dès demain matin.',
        timestamp: '14:18'
      },
      {
        id: 'm3',
        sender: 'buyer',
        senderName: 'Client Bastos',
        text: 'Parfait, merci ! Je vais finaliser mon panier maintenant. Est-ce qu\'il y a une promotion en cours ?',
        timestamp: '14:20'
      }
    ]
  },
  {
    id: 'conv-2',
    buyerName: 'Sophie Bernard',
    buyerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    sellerName: 'Fashion Store',
    lastMessageText: 'Merci pour votre réponse rapide !',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        sender: 'buyer',
        senderName: 'Sophie Bernard',
        text: 'Bonjour, proposez-vous un emballage cadeau pour la fête des mères ?',
        timestamp: 'Hier 10:00'
      },
      {
        id: 'm5',
        sender: 'seller',
        senderName: 'Fashion Store',
        text: 'Oui tout à fait Sophie ! Vous pouvez nous le préciser lors de l\'achat ou par message direct ici. Nous offrons une boîte cadeau rigide gaufrée élégante.',
        timestamp: 'Hier 11:15'
      },
      {
        id: 'm6',
        sender: 'buyer',
        senderName: 'Sophie Bernard',
        text: 'Merci pour votre réponse rapide !',
        timestamp: 'Hier 11:20'
      }
    ]
  },
  {
    id: 'conv-3',
    buyerName: 'Jean Dupont',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sellerName: 'Tech World',
    lastMessageText: 'Pouvez-vous m\'envoyer les dimensions exactes de l\'écran ?',
    lastMessageTime: '10:45',
    unreadCount: 2,
    messages: [
      {
        id: 'm7',
        sender: 'buyer',
        senderName: 'Jean Dupont',
        text: 'Bonjour, j\'aimerais connaître le type exact du processeur.',
        timestamp: '10:30'
      },
      {
        id: 'm8',
        sender: 'seller',
        senderName: 'Tech World',
        text: 'C\'est la puce Snapdragon 8 Gen 2 optimisée, soit la version cadencée à 3.36 GHz.',
        timestamp: '10:38'
      },
      {
        id: 'm9',
        sender: 'buyer',
        senderName: 'Jean Dupont',
        text: 'Pouvez-vous m\'envoyer les dimensions exactes de l\'écran ?',
        timestamp: '10:45'
      }
    ]
  }
];

export const INITIAL_SELLERS: SellerProfile[] = [
  {
    id: 'sell-1',
    storeName: 'Fashion Store',
    ownerName: 'Alina Putri',
    email: 'info@fashionstore.com',
    phone: '+237 6 95 12 34 56',
    address: 'Bastos, Yaoundé',
    status: 'approved',
    joinDate: '12 Jan 2025'
  },
  {
    id: 'sell-2',
    storeName: 'Home Decor',
    ownerName: 'Grace Wilson',
    email: 'contact@homedecor.com',
    phone: '+237 6 77 88 99 00',
    address: 'Akwa, Douala',
    status: 'approved',
    joinDate: '28 Fév 2025'
  },
  {
    id: 'sell-3',
    storeName: 'Tech World',
    ownerName: 'Mike Johnson',
    email: 'sales@techworld.com',
    phone: '+237 6 88 11 22 33',
    address: 'Mvan, Yaoundé',
    status: 'approved',
    joinDate: '01 Mars 2025'
  },
  {
    id: 'sell-4',
    storeName: 'Luxury Bags Co',
    ownerName: 'John Doe',
    email: 'john.bags@gmail.com',
    phone: '+237 6 99 00 11 22',
    address: 'Bonapriso, Douala',
    status: 'pending',
    joinDate: '15 Juin 2026'
  }
];
