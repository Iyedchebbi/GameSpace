export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  created_at: string;
  avatar_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  is_on_deal: boolean;
  discount_percent: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  fullname?: string;
  email?: string;
  phone?: string;
  address?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface CartItemWithProduct extends CartItem {
  products: Product;
}
