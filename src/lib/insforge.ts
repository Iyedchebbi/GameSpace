import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});

export const PRODUCTS_BUCKET = 'products';
export const AVATARS_BUCKET = 'avatars';
export const STORAGE_URL = `${process.env.NEXT_PUBLIC_INSFORGE_URL}/storage/v1/object/public`;
