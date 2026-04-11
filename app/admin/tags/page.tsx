import { createClient } from '@/lib/supabase/server'
import TagsClient from './TagsClient'

export default async function AdminTagsPage() {
  const supabase = await createClient()

  const [
    { data: tags },
    { data: productTags }
  ] = await Promise.all([
    supabase.from('tags').select('*').order('name_fr', { ascending: true }),
    supabase.from('product_tags').select('tag_id')
  ])
  
  const simplifiedProducts = (productTags || []).map(pt => ({
    tag_ids: [pt.tag_id]
  }))

  return (
    <TagsClient 
      initialTags={tags || []} 
      initialProducts={simplifiedProducts} 
    />
  )
}
