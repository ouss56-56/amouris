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

export function mapDbProductToFrontend(p: DbProduct): Product {
  const base = {
    id: p.id,
    product_type: p.product_type as ProductType,
    name_ar: p.name_ar,
    name_fr: p.name_fr,
    slug: p.slug,
    description_ar: p.description_ar || '',
    description_fr: p.description_fr || '',
    category_id: p.category_id,
    brand_id: p.brand_id || null,
    collection_id: p.collection_id || null,
    tag_ids: p.tags?.map((t: DbTag) => t.tag.id) || p.product_tags?.map((t: DbProductTag) => t.tag_id) || [],
    images: p.images || [],
    status: p.status,
    created_at: p.created_at,
  };

  if (p.product_type === 'perfume') {
    return {
      ...base,
      product_type: 'perfume',
      price_per_gram: Number(p.price_per_gram || 0),
      stock_grams: Number(p.stock_grams || 0),
    } as Product;
  } else {
    const variants = (p.variants || p.flacon_variants || []).map((v: DbVariant) => ({
      id: v.id,
      size_ml: v.size_ml || 0,
      color: v.color || '',
      color_name: v.color || '', // Default to color if color_name missing in DB
      shape: v.shape || '',
      price: Number(v.price || 0),
      stock_units: v.stock_units || 0,
    }));

    return {
      ...base,
      product_type: 'flacon',
      variants,
    } as Product;
  }
}
