export interface Category {
  id: string;
  nameAR: string;
  nameFR: string;
  slug: string;
  image?: string;
}

export interface Brand {
  id: string;
  nameAR: string;
  nameFR: string;
  logo: string;
}

export interface Collection {
  id: string;
  nameAR: string;
  nameFR: string;
  coverImage?: string;
}

export interface Tag {
  id: string;
  nameAR: string;
  nameFR: string;
  slug: string;
  showOnHomepage?: boolean;
  homepageOrder?: number;
}

export type ProductType = 'perfume' | 'flacon';

export interface BaseProduct {
  id: string;
  type: ProductType;
  nameAR: string;
  nameFR: string;
  slug: string;
  descriptionAR: string;
  descriptionFR: string;
  categoryId: string;
  brandId?: string;
  collectionId?: string;
  tagIds: string[];
  images: string[];
  status: 'active' | 'draft';
  createdAt: string;
}

export interface PerfumeProduct extends BaseProduct {
  type: 'perfume';
  pricePerGram: number; // DZD
  stockInGrams: number;
}

export interface FlaconVariant {
  id: string;
  size: string; // e.g., '30ml', '50ml', '100ml'
  color: string; // Hex color code or name
  shape: string; // e.g., 'carré', 'rond', 'atomiseur'
  price: number; // DZD
  stock: number;
}

export interface FlaconProduct extends BaseProduct {
  type: 'flacon';
  variants: FlaconVariant[];
}

export type Product = PerfumeProduct | FlaconProduct;

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  shopName?: string;
  phoneNumber: string; // User ID/Login
  wilaya: string;
  commune: string;
  status: 'active' | 'frozen';
  joinedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface OrderItem {
  productId: string;
  variantId?: string; // For flacons
  quantity: number; // Grams for perfume, units for flacons
  unitPrice: number;
  productNameAR: string;
  productNameFR: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., AM-100234
  customerId: string | 'guest'; // 'guest' for guests
  guestInfo?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    wilaya: string;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., FAC-00123
  orderId: string;
  issueDate: string;
}
