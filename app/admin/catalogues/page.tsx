import { getCataloguesAction } from '@/lib/actions/catalogues';
import CataloguesClient from './CataloguesClient';

export default async function CataloguesPage() {
  const catalogues = await getCataloguesAction();
  
  return <CataloguesClient initialCatalogues={catalogues} />;
}
