import { QuotationItem } from '../types';

export const calculateItemAmounts = (quantity: number, unitPrice: number, discountPercent: number) => {
  const gross = quantity * unitPrice;
  const discountAmount = gross * (discountPercent / 100);
  const net = gross - discountAmount;
  return { gross, discountAmount, net };
};

export const calculateQuotationTotals = (items: QuotationItem[], gstPercent: number) => {
  const subtotal = items.reduce((acc, item) => {
    const { net } = calculateItemAmounts(item.quantity, item.unit_price, item.discount);
    return acc + net;
  }, 0);
  
  const gst = subtotal * (gstPercent / 100);
  const total = subtotal + gst;
  
  return { subtotal, gst, total };
};
