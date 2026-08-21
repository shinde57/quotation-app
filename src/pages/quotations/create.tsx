import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import MainLayout from '../../layouts/MainLayout';
import AuthGuard from '../../layouts/AuthGuard';
import { QuotationItem } from '../../types';
import { calculateQuotationTotals, calculateItemAmounts } from '../../utils/calculations';
import { validateQuotationForm } from '../../utils/validation';
import { Plus, Trash2, Save, ArrowLeft, Building2, Calendar, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CreateQuotation() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quotationNumber, setQuotationNumber] = useState(`Q-${Date.now().toString().slice(-6)}`);
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [gstPercent, setGstPercent] = useState(18);
  const [quotationStatus, setQuotationStatus] = useState<'approved' | 'pending' | 'draft' | 'rejected'>('pending');
  const [editing, setEditing] = useState(false);
  
  const [items, setItems] = useState<QuotationItem[]>([
    { product_name: '', quantity: 1, unit_price: 0, discount: 0, amount: 0 }
  ]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const editId = typeof router.query.edit === 'string' ? router.query.edit : null;

  useEffect(() => {
    if (!editId) return;
    const loadQuotation = async () => {
      const { data, error } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', editId).single();
      if (error || !data) {
        setError('Unable to load this quotation for editing.');
        return;
      }
      setEditing(true);
      setCustomerName(data.customer_name || '');
      setCompanyName(data.company_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setQuotationNumber(data.quotation_number || '');
      setQuotationDate(data.quotation_date || '');
      setValidUntil(data.valid_until || '');
      setGstPercent(Number(data.gst_percent ?? 18));
      setQuotationStatus(data.status ?? 'pending');
      if (data.quotation_items?.length) setItems(data.quotation_items);
    };
    loadQuotation();
  }, [editId]);

  // Update item amounts whenever items change
  useEffect(() => {
    const updatedItems = items.map(item => {
      const { net } = calculateItemAmounts(item.quantity, item.unit_price, item.discount);
      return { ...item, amount: net };
    });
    
    // Only update if amounts actually changed to prevent infinite loops
    const hasChanges = items.some((item, i) => item.amount !== updatedItems[i].amount);
    if (hasChanges) {
      setItems(updatedItems);
    }
  }, [items]);

  const addRow = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: 0, discount: 0, amount: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    setError(null);
    const validationError = validateQuotationForm(customerName, email, quotationDate, items);
    
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a quotation');

      const { subtotal, gst, total } = calculateQuotationTotals(items, gstPercent);

      // 1. Insert Quotation
      const quotationPayload = {
          quotation_number: quotationNumber,
          customer_name: customerName,
          company_name: companyName,
          email,
          phone,
          quotation_date: quotationDate,
          valid_until: validUntil || null,
          subtotal,
          gst_percent: gstPercent,
          gst,
          total,
          status: quotationStatus,
          user_id: user.id
      };
      const quotationRequest = editId
        ? supabase.from('quotations').update(quotationPayload).eq('id', editId).select().single()
        : supabase.from('quotations').insert([quotationPayload]).select().single();
      const { data: qData, error: qError } = await quotationRequest;

      if (qError) throw qError;
      if (!qData) throw new Error('Failed to insert quotation');

      // 2. Insert Quotation Items
      const itemsToInsert = items.map(item => ({
        quotation_id: qData.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        amount: item.amount
      }));

      if (editId) await supabase.from('quotation_items').delete().eq('quotation_id', editId);
      const { error: itemsError } = await supabase.from('quotation_items').insert(itemsToInsert);

      if (itemsError) {
        // If items fail, we should ideally rollback. We can attempt to delete the created quotation.
        if (!editId) await supabase.from('quotations').delete().eq('id', qData.id);
        throw itemsError;
      }

      router.push(editId ? `/quotations/${editId}` : '/quotations');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, gst, total } = calculateQuotationTotals(items, gstPercent);

  return (
    <AuthGuard>
      <MainLayout title={editing ? 'Edit Quotation' : 'Create Quotation'}>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/quotations" className="p-2.5 bg-white rounded-xl shadow-sm border border-[#e5e7e4] hover:bg-[#e1f2ee] transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <p className="eyebrow mb-1">{editing ? 'Refine proposal' : 'New proposal'}</p>
              <h1 className="page-title">{editing ? 'Edit quotation' : 'Create quotation'}</h1>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="surface p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17212b] border-[#17212b]">
            <div>
              <p className="eyebrow text-[#8ed5ca]">Tax settings</p>
              <p className="mt-1 text-sm text-slate-300">Choose the rate that applies to this quotation.</p>
            </div>
            <select value={gstPercent} onChange={e => setGstPercent(Number(e.target.value))} className="w-full sm:w-56 px-3 py-2.5 bg-white border-0 rounded-xl text-sm font-bold text-[#17212b] focus:ring-2 focus:ring-[#8ed5ca]">
              <option value="0">No GST (0%)</option>
              <option value="5">GST (5%)</option>
              <option value="12">GST (12%)</option>
              <option value="18">GST (18%)</option>
              <option value="28">GST (28%)</option>
            </select>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#fbfaf7] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-500" />
                <div><p className="eyebrow">01 / Customer</p><h2 className="text-lg font-bold text-gray-900">Customer information</h2></div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Shivani Shinde" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Acme Inc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="shivani@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Quotation Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#fbfaf7] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div><p className="eyebrow">02 / Document</p><h2 className="text-lg font-bold text-gray-900">Quotation details</h2></div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                  <input type="text" value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Date *</label>
                  <input type="date" required value={quotationDate} onChange={e => setQuotationDate(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>

            {/* Products/Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#fbfaf7] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  <div><p className="eyebrow">03 / Line items</p><h2 className="text-lg font-bold text-gray-900">Products & services</h2></div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="hidden md:grid grid-cols-12 gap-4 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Product / Service Name</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Discount (%)</div>
                  <div className="col-span-2 text-right pr-12">Net Amount</div>
                </div>

                <div className="space-y-4 md:space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none border md:border-0 border-gray-200">
                      <div className="col-span-1 md:col-span-4">
                        <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Product</label>
                        <input type="text" placeholder="e.g. Accounting Software" value={item.product_name} onChange={e => updateItem(index, 'product_name', e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Quantity</label>
                        <input type="number" min="1" value={item.quantity || ''} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Unit Price</label>
                        <input type="number" min="0" step="0.01" value={item.unit_price || ''} onChange={e => updateItem(index, 'unit_price', Number(e.target.value))} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
                        <input type="number" min="0" max="100" value={item.discount || ''} onChange={e => updateItem(index, 'discount', Number(e.target.value))} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
                        <div className="text-sm font-medium text-gray-900 md:mt-2">
                          <span className="md:hidden text-gray-500 font-normal mr-2">Amount:</span>
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <button type="button" onClick={() => removeRow(index)} disabled={items.length === 1}
                          className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-md hover:bg-red-50 transition-colors md:mt-1">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button type="button" onClick={addRow}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    <Plus className="h-4 w-4" /> Add Another Product
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col md:flex-row justify-end items-end gap-6 mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full md:w-80">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({gstPercent}%)</span>
                    <span className="font-medium text-gray-900">${gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-xl font-bold text-blue-600">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Link href="/quotations" className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : editing ? 'Update Quotation' : 'Save Quotation'}
              </button>
            </div>

          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}
