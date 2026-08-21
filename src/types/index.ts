export type QuotationItem = {
  id?: string;
  quotation_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  amount: number;
};

export type Quotation = {
  id?: string;
  quotation_number: string;
  customer_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  quotation_date: string;
  valid_until?: string;
  subtotal: number;
  gst_percent?: number;
  gst: number;
  total: number;
  status?: 'approved' | 'pending' | 'draft' | 'rejected';
  created_at?: string;
  user_id?: string;
};
