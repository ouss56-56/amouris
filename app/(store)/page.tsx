import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { getActiveAnnouncements } from '@/lib/actions/announcements';
import { getHomepageTags, getProductsByTag } from '@/lib/actions/tags';
import HomeClient from './HomeClient';
import { Tag } from '@/lib/types';

export default async function HomePage() {
  const [categories, brands, announcements, homeTags] = await Promise.all([
    getCategories(),
    getBrands(),
    getActiveAnnouncements(),
    getHomepageTags()
  ]);

  // Fetch products for each homepage tag
  const tagSections = await Promise.all(
    homeTags.map(async (tag: Tag) => ({
      ...tag,
      products: await getProductsByTag(tag.id, 4)
    }))
  );

  return (
    <HomeClient 
      categories={categories} 
      brands={brands} 
      announcements={announcements} 
      tagSections={tagSections}
    />
  );
}

