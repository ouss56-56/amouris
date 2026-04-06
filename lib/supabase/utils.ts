import { Product, ProductType } from "@/lib/types";

export function mapDbProductToFrontend(dbProduct: any): Product {
  const base = {
    id: dbProduct.id,
    type: dbProduct.product_type as ProductType,
    nameAR: dbProduct.name_ar,
    nameFR: dbProduct.name_fr,
    descriptionAR: dbProduct.description_ar || '',
    descriptionFR: dbProduct.description_fr || '',
    categoryId: dbProduct.category_id,
    brandId: dbProduct.brand_id,
    collectionId: dbProduct.collection_id,
    tagIds: dbProduct.tags?.map((t: any) => t.tag.id) || dbProduct.product_tags?.map((t: any) => t.tag_id) || [],
    images: dbProduct.images || [],
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
  };

  if (dbProduct.product_type === 'perfume') {
    return {
      ...base,
      type: 'perfume',
      pricePerGram: Number(dbProduct.price_per_gram),
      stockInGrams: Number(dbProduct.stock_grams),
    } as any;
  } else {
    // Handle flacons
    const variants = (dbProduct.variants || dbProduct.flacon_variants || []).map((v: any) => ({
      id: v.id,
      size: v.size_ml ? `${v.size_ml}ml` : '',
      color: v.color || '',
      shape: v.shape || '',
      price: Number(v.price),
      stock: v.stock_units,
    }));

    return {
      ...base,
      type: 'flacon',
      variants,
    } as any;
  }
}
