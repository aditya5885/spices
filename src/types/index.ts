export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInINR: number;
  image: string;
  badge?: string;
  specs?: string;
  stockQty?: number;
  isActive?: number;
}

export interface OrderFormInputs {
  productSlug: string;
  packSize: string; // "250g" | "500g" | "1kg"
  quantity: number; // number of packs
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
}

export interface OrderDetails extends OrderFormInputs {
  id: string;
  subtotal: number;
  shippingCost: number;
  codFee?: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  date: string;
}
