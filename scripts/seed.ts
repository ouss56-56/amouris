import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { categories, brands, collections, tags, products, customers, orders } from '../lib/mock-data';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mappings from mock IDs to real UUIDs
const idMap: Record<string, string> = {};

function getUuid(mockId: string) {
  if (!idMap[mockId]) {
    idMap[mockId] = uuidv4();
  }
  return idMap[mockId];
}

async function seed() {
  console.log('Seeding database...');

  // 1. Categories
  console.log('Seeding categories...');
  for (const cat of categories) {
    const id = getUuid(cat.id);
    const { error } = await supabase.from('categories').upsert({
      id,
      name_ar: cat.nameAR,
      name_fr: cat.nameFR,
      slug: cat.nameFR.toLowerCase().replace(/\s+/g, '-'),
    });
    if (error) console.error('Category seed error:', error);
  }

  // 2. Brands
  console.log('Seeding brands...');
  for (const brand of brands) {
    const id = getUuid(brand.id);
    const { error } = await supabase.from('brands').upsert({
      id,
      name: brand.nameFR,
      name_ar: brand.nameAR,
      logo_url: brand.logo,
    });
    if (error) console.error('Brand seed error:', error);
  }

  // 3. Collections
  console.log('Seeding collections...');
  for (const col of collections) {
    const id = getUuid(col.id);
    const { error } = await supabase.from('collections').upsert({
      id,
      name_fr: col.nameFR,
      name_ar: col.nameAR,
    });
    if (error) console.error('Collection seed error:', error);
  }

  // 4. Tags
  console.log('Seeding tags...');
  for (const tag of tags) {
    const id = getUuid(tag.id);
    const { error } = await supabase.from('tags').upsert({
      id,
      name_fr: tag.nameFR,
      name_ar: tag.nameAR,
      slug: tag.nameFR.toLowerCase().replace(/\s+/g, '-'),
      show_on_homepage: tag.showOnHomepage,
    });
    if (error) console.error('Tag seed error:', error);
  }

  // 5. Products & Variants
  console.log('Seeding products...');
  for (const prod of products) {
    const id = getUuid(prod.id);
    const isPerfume = prod.type === 'perfume';
    const { error } = await supabase.from('products').upsert({
      id,
      product_type: prod.type,
      name_fr: prod.nameFR,
      name_ar: prod.nameAR,
      slug: prod.nameFR.toLowerCase().replace(/\s+/g, '-'),
      description_fr: prod.descriptionFR,
      description_ar: prod.descriptionAR,
      category_id: getUuid(prod.categoryId),
      brand_id: prod.brandId ? getUuid(prod.brandId) : null,
      collection_id: prod.collectionId ? getUuid(prod.collectionId) : null,
      price_per_gram: isPerfume ? prod.pricePerGram : null,
      stock_grams: isPerfume ? (prod as any).stockInGrams : null,
      images: prod.images,
      status: prod.status,
      created_at: prod.createdAt,
    });

    if (error) {
      console.error('Product seed error:', error);
      continue;
    }

    // Variants for Flacons
    if (prod.type === 'flacon' && (prod as any).variants) {
      for (const v of (prod as any).variants) {
        const vid = getUuid(v.id);
        const { error: ventError } = await supabase.from('flacon_variants').upsert({
          id: vid,
          product_id: id,
          size_ml: parseInt(v.size),
          color: v.color,
          shape: v.shape,
          price: v.price,
          stock_units: v.stock,
        });
        if (ventError) console.error('Variant seed error:', ventError);
      }
    }

    // Tags Junction
    if (prod.tagIds && prod.tagIds.length > 0) {
      for (const tid of prod.tagIds) {
        await supabase.from('product_tags').upsert({
            product_id: id,
            tag_id: getUuid(tid)
        });
      }
    }
  }

  console.log('Seeding finished!');
}

seed();

