import { Category, Brand, Collection, Tag, Product, Customer, Order } from './types';

type Compatible<T> = T & Record<string, any>;

const categoriesData: Category[] = [
  { 
    id: 'cat-01', 
    name_ar: 'عود', name_fr: 'Oud', 
    slug: 'oud',
    image: 'https://images.unsplash.com/photo-1546190255-451a91afc548?q=80&w=800'
  },
  { 
    id: 'cat-02', 
    name_ar: 'زهري', name_fr: 'Floral', 
    slug: 'floral',
    image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=800'
  },
  { id: 'cat-03', name_ar: 'شرقي', name_fr: 'Oriental', slug: 'oriental' },
  { id: 'cat-04', name_ar: 'منعش', name_fr: 'Frais', slug: 'frais' },
  { id: 'cat-05', name_ar: 'خشبي', name_fr: 'Boisé', slug: 'boise' },
  { id: 'cat-06', name_ar: 'مسكي', name_fr: 'Musqué', slug: 'musque' },
  { id: 'cat-07', name_ar: 'توابل', name_fr: 'Épicé', slug: 'epice' },
  { id: 'cat-08', name_ar: 'حمضيات', name_fr: 'Citrus', slug: 'citrus' },
  { id: 'cat-09', name_ar: 'مائي', name_fr: 'Aquatique', slug: 'aquatique' },
  { id: 'cat-10', name_ar: 'عنبري', name_fr: 'Ambré', slug: 'ambre' },
  { id: 'cat-11', name_ar: 'حلويات', name_fr: 'Gourmet', slug: 'gourmet' },
  { id: 'cat-12', name_ar: 'جلدي', name_fr: 'Cuir', slug: 'cuir' },
  { id: 'cat-13', name_ar: 'فاكهي', name_fr: 'Fruité', slug: 'fruite' },
]

const brandsData: Brand[] = [
  { id: 'b1', name_ar: 'الحرمين', name_fr: 'Al Haramain', logo: '/brands/alharamain.png' },
  { id: 'b2', name_ar: 'عمواج', name_fr: 'Amouage', logo: '/brands/amouage.png' },
  { id: 'b3', name_ar: 'لطافة', name_fr: 'Lattafa', logo: '/brands/lattafa.png' },
  { id: 'b4', name_ar: 'ميزون طهارة', name_fr: 'Maison Tahara', logo: '/brands/maison.png' },
  { id: 'b5', name_ar: 'رصاصي', name_fr: 'Rasasi', logo: '/brands/rasasi.png' },
  { id: 'b6', name_ar: 'سويس أربيان', name_fr: 'Swiss Arabian', logo: '/brands/swiss.png' },
]

const collectionsData: Collection[] = [
  { id: 'col1', name_ar: 'المجموعة الملكية', name_fr: 'Collection Royale' },
  { id: 'col2', name_ar: 'الصيف العربي', name_fr: 'Été Arabe' },
]

const tagsData: Tag[] = [
  { id: 'tag-01', name_ar: 'وصل جديد', name_fr: 'Arrivage', show_on_homepage: true, homepage_order: 1, slug: 'arrivage' },
  { id: 'tag-02', name_ar: 'الأكثر مبيعاً', name_fr: 'Best-seller', show_on_homepage: true, homepage_order: 2, slug: 'best-seller' },
  { id: 'tag-03', name_ar: 'مميز', name_fr: 'Premium', show_on_homepage: true, homepage_order: 3, slug: 'premium' },
  { id: 'tag-04', name_ar: 'عرض خاص', name_fr: 'Offre spéciale', show_on_homepage: false, homepage_order: 4, slug: 'offre' },
]

const productsData: Product[] = [
  // PARFUMS
  {
    id: 'p1', product_type: 'perfume', slug: 'rose-du-taif',
    name_ar: 'وردة الطائف', name_fr: 'Rose du Taif',
    description_ar: 'زيت عطري فاخر', description_fr: 'Une huile de parfum luxueuse',
    category_id: 'cat-02', brand_id: 'b1', tag_ids: ['tag-01', 'tag-02'],
    price_per_gram: 850, stock_grams: 5000,
    images: ['https://images.unsplash.com/photo-1594035910387-fea477262dc0?q=80&w=800'], status: 'active', created_at: new Date().toISOString()
  },
  {
    id: 'p2', product_type: 'perfume', slug: 'oud-malaki',
    name_ar: 'عود ملكي', name_fr: 'Oud Malaki',
    description_ar: 'العود الملكي الفاخر', description_fr: 'L\'oud royal luxueux',
    category_id: 'cat-01', brand_id: 'b2', tag_ids: ['tag-02', 'tag-03'],
    price_per_gram: 1200, stock_grams: 3000,
    images: ['https://images.unsplash.com/photo-1546190255-451a91afc548?q=80&w=800'], status: 'active', created_at: new Date().toISOString()
  },

  // FLACONS
  {
    id: 'f1', product_type: 'flacon', slug: 'flacon-classique',
    name_ar: 'قارورة كلاسيكية شفافة', name_fr: 'Flacon Classique Transparent',
    description_ar: 'قارورة زجاجية أنيقة', description_fr: 'Un flacon en verre élégant',
    category_id: 'cat-01', tag_ids: ['tag-01'],
    images: ['https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=800'], status: 'active', created_at: new Date().toISOString(),
    variants: [
      { id: 'fv1', size_ml: 30, color: '#FFFFFF', color_name: 'Transparent', shape: 'carré', price: 350, stock_units: 100 },
      { id: 'fv2', size_ml: 50, color: '#FFFFFF', color_name: 'Transparent', shape: 'carré', price: 450, stock_units: 80 }
    ]
  },
]

const customersData: Customer[] = [
  { 
    id: 'cu1', 
    first_name: 'Mohammed', last_name: 'Benali', 
    shop_name: 'Parfumerie El Nour', 
    phone: '0550123456', 
    wilaya: 'Alger', commune: 'Bab El Oued', 
    role: 'customer', is_frozen: false, created_at: '2025-01-01'
  },
]

const ordersData: Order[] = [
  {
    id: 'o1', 
    order_number: 'AM-000001', 
    customer_id: 'cu1',
    is_registered_customer: true,
    total_amount: 425000, 
    amount_paid: 425000, 
    payment_status: 'paid',
    order_status: 'delivered', 
    created_at: '2026-03-15T12:00:00Z',
    updated_at: '2026-03-15T12:00:00Z',
  },
]

export const mockCategories = categoriesData;
export const mockBrands = brandsData;
export const mockCollections = collectionsData;
export const mockTags = tagsData;
export const mockProducts = productsData;
export const mockCustomers = customersData;
export const mockOrders = ordersData;

export const categories = categoriesData;
export const brands = brandsData;
export const collections = collectionsData;
export const tags = tagsData;
export const products = productsData;
export const customers = customersData;
export const orders = ordersData;
, 
    guest_first_name: null, guest_last_name: null,
    items: []
  },
]

// Named exports asked by the USER
export const mockCategories = categoriesData;
export const mockBrands = brandsData;
export const mockCollections = collectionsData;
export const mockTags = tagsData;
export const mockProducts = productsData;
export const mockCustomers = customersData;
export const mockOrders = ordersData;

// Aliases for compatibility with existing files
export const categories = categoriesData;
export const brands = brandsData;
export const collections = collectionsData;
export const tags = tagsData;
export const products = productsData;
export const customers = customersData;
export const orders = ordersData;
