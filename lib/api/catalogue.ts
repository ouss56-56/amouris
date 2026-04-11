'use server'

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// --- Generic Helpers (internal, not exported) ---

const fetchAll = async (table: string, orderCol = 'name_fr') => {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select('*').order(orderCol);
  if (error) throw error;
  return data;
};

const createItem = async (table: string, data: any) => {
  const admin = createAdminClient();
  const { data: item, error } = await admin.from(table).insert([data]).select().single();
  if (error) throw error;
  return item;
};

const updateItem = async (table: string, id: string, data: any) => {
  const admin = createAdminClient();
  const { data: item, error } = await admin.from(table).update(data).eq('id', id).select().single();
  if (error) throw error;
  return item;
};

const deleteItem = async (table: string, id: string) => {
  const admin = createAdminClient();
  const { error } = await admin.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
};

// --- Fetch Functions ---

export const fetchCategories = async () => fetchAll('categories');
export const fetchBrands = async () => fetchAll('brands', 'name');
export const fetchTags = async () => fetchAll('tags');
export const fetchCollections = async () => fetchAll('collections');

// --- Category CRUD ---
export const createCategory = async (data: any) => createItem('categories', data);
export const updateCategory = async (id: string, data: any) => updateItem('categories', id, data);
export const removeCategory = async (id: string) => deleteItem('categories', id);

// --- Brand CRUD ---
export const createBrand = async (data: any) => createItem('brands', data);
export const updateBrand = async (id: string, data: any) => updateItem('brands', id, data);
export const removeBrand = async (id: string) => deleteItem('brands', id);

// --- Collection CRUD ---
export const createCollection = async (data: any) => createItem('collections', data);
export const updateCollection = async (id: string, data: any) => updateItem('collections', id, data);
export const removeCollection = async (id: string) => deleteItem('collections', id);

// --- Tag CRUD ---
export const createTag = async (data: any) => createItem('tags', data);
export const updateTag = async (id: string, data: any) => updateItem('tags', id, data);
export const removeTag = async (id: string) => deleteItem('tags', id);
