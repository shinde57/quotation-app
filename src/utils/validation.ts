import { QuotationItem } from '../types';

export const validateQuotationForm = (
  customerName: string,
  email: string,
  quotationDate: string,
  items: QuotationItem[]
): string | null => {
  if (!customerName.trim()) return 'Customer name is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) return 'A valid email is required';
  
  if (!quotationDate) return 'Quotation date is required';
  
  if (items.length === 0) return 'At least one product/service is required';
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.product_name.trim()) return `Product name is required in row ${i + 1}`;
    if (item.quantity <= 0) return `Quantity must be greater than 0 in row ${i + 1}`;
    if (item.unit_price < 0) return `Unit price cannot be negative in row ${i + 1}`;
    if (item.discount < 0 || item.discount > 100) return `Discount must be between 0 and 100 in row ${i + 1}`;
  }
  
  return null;
};
