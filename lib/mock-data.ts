import { Category, Brand, Collection, Tag, Product, Customer, Order, Invoice } from './types';

export const categories: Category[] = [
  { id: 'c1', nameAR: 'عود', nameFR: 'Oud' },
  { id: 'c2', nameAR: 'زهري', nameFR: 'Floral' },
  { id: 'c3', nameAR: 'شرقي', nameFR: 'Oriental' },
  { id: 'c4', nameAR: 'منعش', nameFR: 'Frais' },
  { id: 'c5', nameAR: 'خشبي', nameFR: 'Boisé' },
];

export const brands: Brand[] = [
  { id: 'b1', nameAR: 'أمواج', nameFR: 'Amouage', logo: '/images/brands/amouage.jpg' },
  { id: 'b2', nameAR: 'لطافة', nameFR: 'Lattafa', logo: '/images/brands/lattafa.jpg' },
  { id: 'b3', nameAR: 'سويس أربيان', nameFR: 'Swiss Arabian', logo: '/images/brands/swiss-arabian.jpg' },
  { id: 'b4', nameAR: 'ميزون طهارة', nameFR: 'Maison Tahara', logo: '/images/brands/maison-tahara.jpg' },
  { id: 'b5', nameAR: 'رصاصي', nameFR: 'Rasasi', logo: '/images/brands/rasasi.jpg' },
  { id: 'b6', nameAR: 'الحرمين', nameFR: 'Al Haramain', logo: '/images/brands/al-haramain.jpg' },
];

export const collections: Collection[] = [
  { id: 'col1', nameAR: 'المجموعة الملكية', nameFR: 'Collection Royale' },
  { id: 'col2', nameAR: 'صيف عربي', nameFR: 'Été Arabe' },
  { id: 'col3', nameAR: 'ليالي الصحراء', nameFR: 'Nuit de Sahara' },
  { id: 'col4', nameAR: 'برستيج', nameFR: 'Prestige' },
];

export const tags: Tag[] = [
  { id: 't1', nameAR: 'وصل جديد', nameFR: 'Arrivage', showOnHomepage: true },
  { id: 't2', nameAR: 'الأكثر مبيعاً', nameFR: 'Best-seller', showOnHomepage: true },
  { id: 't3', nameAR: 'عرض خاص', nameFR: 'Offre spéciale', showOnHomepage: false },
  { id: 't4', nameAR: 'حصري', nameFR: 'Exclusif', showOnHomepage: false },
  { id: 't5', nameAR: 'موسمي', nameFR: 'Saisonnier', showOnHomepage: false },
  { id: 't6', nameAR: 'مميز', nameFR: 'Premium', showOnHomepage: true },
];

// Reusing some placeholder images based on gradients since we asked about image generation.
// For now, I'll use placeholders that standard next-image can load.
const PLACEHOLDER = 'https://images.unsplash.com/photo-1594035910387-fea477262dc0?width=800&q=80';
const FLACON_PLACEHOLDER = 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?width=800&q=80';

export const products: Product[] = [
  {
    id: 'p1',
    type: 'perfume',
    nameAR: 'أمير العود الأصلي',
    nameFR: 'Amir Al Oudh Original',
    descriptionAR: 'مزيج فاخر من العود والورد المخصص لكبار الشخصيات.',
    descriptionFR: 'Mélange luxueux de oud et de rose conçu pour les VIP.',
    categoryId: 'c1',
    brandId: 'b2',
    collectionId: 'col1',
    tagIds: ['t1', 't2', 't6'],
    images: [PLACEHOLDER, PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2023-10-01').toISOString(),
    pricePerGram: 15, // 15 DZD per gram
    stockInGrams: 5000,
  },
  {
    id: 'p2',
    type: 'perfume',
    nameAR: 'زهرة الخليج',
    nameFR: 'Zahrat Al Khaleej',
    descriptionAR: 'مكونات زهرية طازجة تأسر القلوب.',
    descriptionFR: 'Des notes florales fraîches qui captivent les cœurs.',
    categoryId: 'c2',
    brandId: 'b3',
    collectionId: 'col4',
    tagIds: ['t2'],
    images: [PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2023-11-15').toISOString(),
    pricePerGram: 12,
    stockInGrams: 8000,
  },
  {
    id: 'p3',
    type: 'perfume',
    nameAR: 'ليلة خميس',
    nameFR: 'Laylat Khamis',
    descriptionAR: 'توليفة شرقية دافئة.',
    descriptionFR: 'Composition orientale chaleureuse.',
    categoryId: 'c3',
    brandId: 'b5',
    collectionId: 'col3',
    tagIds: [],
    images: [PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2024-01-20').toISOString(),
    pricePerGram: 10,
    stockInGrams: 10000,
  },
  {
    id: 'p4',
    type: 'perfume',
    nameAR: 'طهارة بيضاء',
    nameFR: 'Tahara Blanc',
    descriptionAR: 'مسك نقي لجميع الأوقات.',
    descriptionFR: 'Musc pur pour tout moment.',
    categoryId: 'c4',
    brandId: 'b4',
    tagIds: ['t1', 't6'],
    images: [PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2024-02-10').toISOString(),
    pricePerGram: 20,
    stockInGrams: 3000,
  },
  // Flacons
  {
    id: 'f1',
    type: 'flacon',
    nameAR: 'قارورة كريستال مربعة',
    nameFR: 'Flacon Cristal Carré',
    descriptionAR: 'قارورة زجاجية فاخرة بتصميم مربع.',
    descriptionFR: 'Flacon en verre luxueux avec design carré.',
    categoryId: 'c1',
    tagIds: ['t1', 't2'],
    images: [FLACON_PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2023-09-05').toISOString(),
    variants: [
      { id: 'v1', size: '30ml', color: 'Gold', shape: 'Carré', price: 150, stock: 500 },
      { id: 'v2', size: '50ml', color: 'Gold', shape: 'Carré', price: 200, stock: 300 },
      { id: 'v3', size: '100ml', color: 'Silver', shape: 'Carré', price: 280, stock: 200 },
    ],
  },
  {
    id: 'f2',
    type: 'flacon',
    nameAR: 'رول أون صغير',
    nameFR: 'Roll-on Petit',
    descriptionAR: 'قارورة رول أون مثالية للعطور الزيتية المركزة.',
    descriptionFR: 'Flacon roll-on idéal pour les huiles de parfum concentrées.',
    categoryId: 'c5',
    tagIds: ['t2'],
    images: [FLACON_PLACEHOLDER],
    status: 'active',
    createdAt: new Date('2023-10-12').toISOString(),
    variants: [
      { id: 'v4', size: '3ml', color: 'Clear', shape: 'Cylindre', price: 30, stock: 2000 },
      { id: 'v5', size: '6ml', color: 'Clear', shape: 'Cylindre', price: 40, stock: 1500 },
      { id: 'v6', size: '12ml', color: 'Amber', shape: 'Cylindre', price: 60, stock: 800 },
    ],
  }
];

export const customers: Customer[] = [
  {
    id: 'cust1',
    firstName: 'Ahmed',
    lastName: 'Benali',
    shopName: 'Boutique Parfums Oran',
    phoneNumber: '0555123456',
    wilaya: 'Oran',
    commune: 'Es Senia',
    status: 'active',
    joinedAt: new Date('2023-05-10').toISOString()
  },
  {
    id: 'cust2',
    firstName: 'Samira',
    lastName: 'Kaddour',
    shopName: 'Senteurs d\'Alger',
    phoneNumber: '0770987654',
    wilaya: 'Alger',
    commune: 'Hydra',
    status: 'active',
    joinedAt: new Date('2023-08-22').toISOString()
  }
];

export const orders: Order[] = [
  {
    id: 'ord1',
    orderNumber: 'AM-100001',
    customerId: 'cust1',
    items: [
      { productId: 'p1', quantity: 250, unitPrice: 15 }, // 250g
      { productId: 'f1', variantId: 'v1', quantity: 50, unitPrice: 150 } // 50 flacons
    ],
    total: 3750 + 7500, // 11250
    status: 'delivered',
    paymentStatus: 'paid',
    amountPaid: 11250,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: 'ord2',
    orderNumber: 'AM-100002',
    customerId: 'cust2',
    items: [
      { productId: 'p4', quantity: 500, unitPrice: 20 },
    ],
    total: 10000,
    status: 'pending',
    paymentStatus: 'unpaid',
    amountPaid: 0,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString(),
  }
];
