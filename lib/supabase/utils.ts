import { Product, ProductType } from "@/lib/types";

interface DbTag {
  tag: { id: string };
}

interface DbProductTag {
  tag_id: string;
}

interface DbVariant {
  id: string;
  size_ml?: number;
  color?: string;
  shape?: string;
  price: number | string;
  stock_units: number;
}

interface DbProduct {
  id: string;
  product_type: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  description_ar?: string;
  description_fr?: string;
  category_id: string;
  brand_id?: string;
  collection_id?: string;
  images?: string[];
  status: 'active' | 'draft';
  created_at: string;
  price_per_gram?: number | string;
  stock_grams?: number | string;
  tags?: DbTag[];
  product_tags?: DbProductTag[];
  variants?: DbVariant[];
  flacon_variants?: DbVariant[];
}

export function mapDbProductToFrontend(dbProduct: DbProduct): Product {
  const base = {
    id: dbProduct.id,
    type: dbProduct.product_type as ProductType,
    nameAR: dbProduct.name_ar,
    nameFR: dbProduct.name_fr,
    slug: dbProduct.slug,
    descriptionAR: dbProduct.description_ar || '',
    descriptionFR: dbProduct.description_fr || '',
    categoryId: dbProduct.category_id,
    brandId: dbProduct.brand_id || '',
    collectionId: dbProduct.collection_id || '',
    tagIds: dbProduct.tags?.map((t: DbTag) => t.tag.id) || dbProduct.product_tags?.map((t: DbProductTag) => t.tag_id) || [],
    images: dbProduct.images || [],
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
  };

  if (dbProduct.product_type === 'perfume') {
    return {
      ...base,
      type: 'perfume' as const,
      pricePerGram: Number(dbProduct.price_per_gram),
      stockInGrams: Number(dbProduct.stock_grams),
    };
  } else {
    const variants = (dbProduct.variants || dbProduct.flacon_variants || []).map((v: DbVariant) => ({
      id: v.id,
      size: v.size_ml ? `${v.size_ml}ml` : '',
      color: v.color || '',
      shape: v.shape || '',
      price: Number(v.price),
      stock: v.stock_units,
    }));

    return {
      ...base,
      type: 'flacon' as const,
      variants,
    };
  }
}
