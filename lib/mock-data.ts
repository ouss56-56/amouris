import { Category, Brand, Collection, Tag, Product, Customer, Order } from './types';

type Compatible<T> = T & Record<string, any>;

const categoriesData: Compatible<Category>[] = [
  { 
    id: 'cat-01', 
    nameAR: 'عود', nameFR: 'Oud', 
    name_ar: 'عود', name_fr: 'Oud',
    slug: 'oud',
    image: 'https://images.unsplash.com/photo-1546190255-451a91afc548?q=80&w=800'
  },
  { 
    id: 'cat-02', 
    nameAR: 'زهري', nameFR: 'Floral', 
    name_ar: 'زهري', name_fr: 'Floral',
    slug: 'floral',
    image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=800'
  },
  { id: 'cat-03', nameAR: 'شرقي', nameFR: 'Oriental', name_ar: 'شرقي', name_fr: 'Oriental', slug: 'oriental' },
  { id: 'cat-04', nameAR: 'منعش', nameFR: 'Frais', name_ar: 'منعش', name_fr: 'Frais', slug: 'frais' },
  { id: 'cat-05', nameAR: 'خشبي', nameFR: 'Boisé', name_ar: 'خشبي', name_fr: 'Boisé', slug: 'boise' },
  { id: 'cat-06', nameAR: 'مسكي', nameFR: 'Musqué', name_ar: 'مسكي', name_fr: 'Musqué', slug: 'musque' },
  { id: 'cat-07', nameAR: 'توابل', nameFR: 'Épicé', name_ar: 'توابل', name_fr: 'Épicé', slug: 'epice' },
  { id: 'cat-08', nameAR: 'حمضيات', nameFR: 'Citrus', name_ar: 'حمضيات', name_fr: 'Citrus', slug: 'citrus' },
  { id: 'cat-09', nameAR: 'مائي', nameFR: 'Aquatique', name_ar: 'مائي', name_fr: 'Aquatique', slug: 'aquatique' },
  { id: 'cat-10', nameAR: 'عنبري', nameFR: 'Ambré', name_ar: 'عنبري', name_fr: 'Ambré', slug: 'ambre' },
  { id: 'cat-11', nameAR: 'حلويات', nameFR: 'Gourmet', name_ar: 'حلويات', name_fr: 'Gourmet', slug: 'gourmet' },
  { id: 'cat-12', nameAR: 'جلدي', nameFR: 'Cuir', name_ar: 'جلدي', name_fr: 'Cuir', slug: 'cuir' },
  { id: 'cat-13', nameAR: 'فاكهي', nameFR: 'Fruité', name_ar: 'فاكهي', name_fr: 'Fruité', slug: 'fruite' },
]

const brandsData: Compatible<Brand>[] = [
  { id: 'b1', nameAR: 'الحرمين', nameFR: 'Al Haramain', name_ar: 'الحرمين', name_fr: 'Al Haramain', logo: '/brands/alharamain.png' },
  { id: 'b2', nameAR: 'عمواج', nameFR: 'Amouage', name_ar: 'عمواج', name_fr: 'Amouage', logo: '/brands/amouage.png' },
  { id: 'b3', nameAR: 'لطافة', nameFR: 'Lattafa', name_ar: 'لطافة', name_fr: 'Lattafa', logo: '/brands/lattafa.png' },
  { id: 'b4', nameAR: 'ميزون طهارة', nameFR: 'Maison Tahara', name_ar: 'ميزون طهارة', name_fr: 'Maison Tahara', logo: '/brands/maison.png' },
  { id: 'b5', nameAR: 'رصاصي', nameFR: 'Rasasi', name_ar: 'رصاصي', name_fr: 'Rasasi', logo: '/brands/rasasi.png' },
  { id: 'b6', nameAR: 'سويس أربيان', nameFR: 'Swiss Arabian', name_ar: 'سويس أربيان', name_fr: 'Swiss Arabian', logo: '/brands/swiss.png' },
]

const collectionsData: Compatible<Collection>[] = [
  { id: 'col1', nameAR: 'المجموعة الملكية', nameFR: 'Collection Royale', name_ar: 'المجموعة الملكية', name_fr: 'Collection Royale' },
  { id: 'col2', nameAR: 'الصيف العربي', nameFR: 'Été Arabe', name_ar: 'الصيف العربي', name_fr: 'Été Arabe' },
]

const tagsData: Compatible<Tag>[] = [
  { id: 'tag-01', nameAR: 'وصل جديد', nameFR: 'Arrivage', name_ar: 'وصل جديد', name_fr: 'Arrivage', showOnHomepage: true, show_on_homepage: true, homepage_order: 1, slug: 'arrivage' },
  { id: 'tag-02', nameAR: 'الأكثر مبيعاً', nameFR: 'Best-seller', name_ar: 'الأكثر مبيعاً', name_fr: 'Best-seller', showOnHomepage: true, show_on_homepage: true, homepage_order: 2, slug: 'best-seller' },
  { id: 'tag-03', nameAR: 'مميز', nameFR: 'Premium', name_ar: 'مميز', name_fr: 'Premium', showOnHomepage: true, show_on_homepage: true, homepage_order: 3, slug: 'premium' },
  { id: 'tag-04', nameAR: 'عرض خاص', nameFR: 'Offre spéciale', name_ar: 'عرض خاص', name_fr: 'Offre spéciale', showOnHomepage: false, show_on_homepage: false, homepage_order: 4, slug: 'offre' },
]

const productsData: Compatible<Product>[] = [
  // PARFUMS
  {
    id: 'p1', type: 'perfume', product_type: 'perfume', slug: 'rose-du-taif',
    nameAR: 'وردة الطائف', nameFR: 'Rose du Taif', name_ar: 'وردة الطائف', name_fr: 'Rose du Taif',
    descriptionAR: 'زيت عطري فاخر', descriptionFR: 'Une huile de parfum luxueuse',
    categoryId: 'cat-02', category_id: 'cat-02', brandId: 'b1', brand_id: 'b1', tagIds: ['tag-01', 'tag-02'], tag_ids: ['tag-01', 'tag-02'],
    pricePerGram: 850, price_per_gram: 850, stockInGrams: 5000, stock_grams: 5000,
    images: ['https://images.unsplash.com/photo-1594035910387-fea477262dc0?q=80&w=800'], status: 'active', createdAt: new Date().toISOString()
  },
  {
    id: 'p2', type: 'perfume', product_type: 'perfume', slug: 'oud-malaki',
    nameAR: 'عود ملكي', nameFR: 'Oud Malaki', name_ar: 'عود ملكي', name_fr: 'Oud Malaki',
    descriptionAR: 'العود الملكي الفاخر', descriptionFR: 'L\'oud royal luxueux',
    categoryId: 'cat-01', category_id: 'cat-01', brandId: 'b2', brand_id: 'b2', tagIds: ['tag-02', 'tag-03'], tag_ids: ['tag-02', 'tag-03'],
    pricePerGram: 1200, price_per_gram: 1200, stockInGrams: 3000, stock_grams: 3000,
    images: ['https://images.unsplash.com/photo-1546190255-451a91afc548?q=80&w=800'], status: 'active', createdAt: new Date().toISOString()
  },

  // FLACONS
  {
    id: 'f1', type: 'flacon', product_type: 'flacon', slug: 'flacon-classique',
    nameAR: 'قارورة كلاسيكية شفافة', nameFR: 'Flacon Classique Transparent', name_ar: 'قارورة كلاسيكية شفافة', name_fr: 'Flacon Classique Transparent',
    descriptionAR: 'قارورة زجاجية أنيقة', descriptionFR: 'Un flacon en verre élégant',
    categoryId: 'cat-01', category_id: 'cat-01', tagIds: ['tag-01'], tag_ids: ['tag-01'],
    base_price: 350, images: ['https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=800'], status: 'active', createdAt: new Date().toISOString(),
    variants: [
      { id: 'fv1', size: '30ml', color: 'transparent', shape: 'carré', price: 350, stock: 100 },
      { id: 'fv2', size: '50ml', color: 'transparent', shape: 'carré', price: 450, stock: 80 }
    ]
  },
  {
    id: 'p-new-1', type: 'perfume', product_type: 'perfume', slug: 'vanille-supreme',
    nameAR: 'فانيلا سوبريم', nameFR: 'Vanille Suprême', name_ar: 'فانيلا سوبريم', name_fr: 'Vanille Suprême',
    descriptionAR: 'خلاصة فانيليا مدغشقر اللذيذة', descriptionFR: 'Une essence gourmande de vanille de Madagascar',
    categoryId: 'cat-11', category_id: 'cat-11', brandId: 'b1', brand_id: 'b1', tagIds: ['tag-01'], tag_ids: ['tag-01'],
    pricePerGram: 950, price_per_gram: 950, stockInGrams: 2000, stock_grams: 2000,
    images: [], status: 'active', createdAt: new Date().toISOString()
  },
  {
    id: 'p-new-2', type: 'perfume', product_type: 'perfume', slug: 'cuir-d-orient',
    nameAR: 'جلد شرقي', nameFR: 'Cuir d\'Orient', name_ar: 'جلد شرقي', name_fr: 'Cuir d\'Orient',
    descriptionAR: 'جلد مدخن بلمسات الزعفران', descriptionFR: 'Un cuir fumé aux accents de safran',
    categoryId: 'cat-12', category_id: 'cat-12', brandId: 'b2', brand_id: 'b2', tagIds: ['tag-03'], tag_ids: ['tag-03'],
    pricePerGram: 1100, price_per_gram: 1100, stockInGrams: 1500, stock_grams: 1500,
    images: [], status: 'active', createdAt: new Date().toISOString()
  },
  {
    id: 'p-new-3', type: 'perfume', product_type: 'perfume', slug: 'mangue-doree',
    nameAR: 'مانجو ذهبية', nameFR: 'Mangue Dorée', name_ar: 'مانجو ذهبية', name_fr: 'Mangue Dorée',
    descriptionAR: 'انفجار فاكهي من المانجو الناضجة', descriptionFR: 'Une explosion fruitée de mangue mûre',
    categoryId: 'cat-13', category_id: 'cat-13', brandId: 'b3', brand_id: 'b3', tagIds: ['tag-01', 'tag-03'], tag_ids: ['tag-01', 'tag-03'],
    pricePerGram: 750, price_per_gram: 750, stockInGrams: 3000, stock_grams: 3000,
    images: [], status: 'active', createdAt: new Date().toISOString()
  },
  {
    id: 'f-new-1', type: 'flacon', product_type: 'flacon', slug: 'flacon-cristal-d-or',
    nameAR: 'قارورة كريستال ذهبية', nameFR: 'Flacon Cristal d\'Or', name_ar: 'قارورة كريستال ذهبية', name_fr: 'Flacon Cristal d\'Or',
    descriptionAR: 'قارورة كريستال بلمسات من الذهب الخالص', descriptionFR: 'Flacon en cristal avec finitions à l\'or fin',
    categoryId: 'cat-01', category_id: 'cat-01', tagIds: ['tag-03'], tag_ids: ['tag-03'],
    base_price: 2500, images: [], status: 'active', createdAt: new Date().toISOString(),
    variants: [
      { id: 'fvn1', size: '50ml', color: 'gold', shape: 'cristal', price: 2500, stock: 50 }
    ]
  },
  {
    id: 'f-new-2', type: 'flacon', product_type: 'flacon', slug: 'flacon-ambre-royal',
    nameAR: 'قارورة عنبر ملكية', nameFR: 'Flacon Ambre Royal', name_ar: 'قارورة عنبر ملكية', name_fr: 'Flacon Ambre Royal',
    descriptionAR: 'زجاج عنبري عميق بسدادة منحوتة', descriptionFR: 'Verre ambré profond avec bouchon sculpté',
    categoryId: 'cat-10', category_id: 'cat-10', tagIds: ['tag-02'], tag_ids: ['tag-02'],
    base_price: 1800, images: [], status: 'active', createdAt: new Date().toISOString(),
    variants: [
      { id: 'fvn2', size: '100ml', color: 'amber', shape: 'royal', price: 1800, stock: 30 }
    ]
  },
]

const customersData: Compatible<Customer>[] = [
  { 
    id: 'cu1', 
    firstName: 'Mohammed', lastName: 'Benali', 
    first_name: 'Mohammed', last_name: 'Benali', 
    shopName: 'Parfumerie El Nour', 
    phoneNumber: '0550123456', phone: '0550123456', 
    wilaya: 'Alger', commune: 'Bab El Oued', 
    status: 'active', joinedAt: '2025-01-01'
  },
]

const ordersData: Compatible<Order>[] = [
  {
    id: 'o1', 
    orderNumber: 'AM-000001', order_number: 'AM-000001', 
    customerId: 'cu1', customer_id: 'cu1',
    total: 425000, total_amount: 425000, 
    status: 'delivered', order_status: 'delivered', 
    paymentStatus: 'paid', payment_status: 'paid',
    amountPaid: 425000, 
    createdAt: '2026-03-15T12:00:00Z', created_at: '2026-03-15T12:00:00Z',
    updatedAt: '2026-03-15T12:00:00Z', 
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
