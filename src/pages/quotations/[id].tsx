import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import MainLayout from '../../layouts/MainLayout';
import AuthGuard from '../../layouts/AuthGuard';
import { Quotation, QuotationItem } from '../../types';
import { ArrowLeft, Printer, Building2, Mail, Phone, Calendar, Receipt, Pencil, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function ViewQuotation() {
  const router = useRouter();
  const { id } = router.query;
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchQuotation = async () => {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch Quotation
      const { data: qData, error: qError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (qError) {
        setError('Quotation not found or you do not have permission to view it.');
        setLoading(false);
        return;
      }

      // Fetch Items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id);

      if (!itemsError && itemsData) {
        setItems(itemsData as QuotationItem[]);
      }
      
      setQuotation(qData as Quotation);
      setLoading(false);
    };

    fetchQuotation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handlePdf = () => {
    document.title = `Quotation-${quotation?.quotation_number || 'document'}`;
    window.print();
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="View Quotation">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (error || !quotation) {
    return (
      <AuthGuard>
        <MainLayout title="View Quotation">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error || 'Quotation could not be loaded.'}</p>
            <Link href="/quotations" className="mt-4 inline-block text-red-800 font-medium hover:underline">
              &larr; Back to Dashboard
            </Link>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title={`Quotation ${quotation.quotation_number}`}>
        <div className="max-w-4xl mx-auto pb-12">
          {/* Actions Bar (Hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 print:hidden">
            <Link href="/quotations" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2.5 rounded-xl shadow-sm border border-[#e5e7e4]">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#087f7b] hover:bg-[#066b68] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              Print Quotation
            </button>
              <Link href={`/quotations/create?edit=${quotation.id}`} className="flex items-center gap-2 bg-[#e76f51] hover:bg-[#d65d40] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <button onClick={handlePdf} className="flex items-center gap-2 bg-[#17212b] hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm" title="Choose Save as PDF in the print dialog">
                <FileDown className="h-4 w-4" /> PDF
              </button>
            </div>
          </div>

          {/* Invoice Document */}
          <div className="bg-white rounded-xl shadow-lg print:shadow-none border border-gray-200 overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#17212b] text-white p-8 sm:p-12 flex justify-between items-start relative overflow-hidden">
              <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full border-[28px] border-[#087f7b]/30"></div>
              <div>
                <p className="eyebrow text-[#8ed5ca] mb-3">Prepared proposal</p>
                <h1 className="text-4xl font-bold tracking-tight mb-2">QUOTATION</h1>
                <p className="text-gray-400 font-medium text-lg">{quotation.quotation_number || 'N/A'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Receipt className="h-6 w-6 text-blue-400" />
                  <span className="text-2xl font-bold text-white">QuoteFlow</span>
                </div>
                <p className="text-gray-400 text-sm">Professional Software Services</p>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
                {/* To */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Quote To</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {quotation.customer_name}
                    </p>
                    {quotation.company_name && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {quotation.company_name}
                      </p>
                    )}
                    <p className="text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {quotation.email}
                    </p>
                    {quotation.phone && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {quotation.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Quotation Details</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date Issued</p>
                      <p className="text-gray-900 font-medium flex items-center gap-1.5 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(quotation.quotation_date).toLocaleDateString()}
                      </p>
                    </div>
                    {quotation.valid_until && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valid Until</p>
                        <p className="text-gray-900 font-medium flex items-center gap-1.5 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(quotation.valid_until).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-12">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="py-3 px-2 text-sm font-bold text-gray-900 uppercase tracking-wider">Product / Service</th>
                      <th className="py-3 px-2 text-sm font-bold text-gray-900 uppercase tracking-wider text-center">Qty</th>
                      <th className="py-3 px-2 text-sm font-bold text-gray-900 uppercase tracking-wider text-right">Price</th>
                      <th className="py-3 px-2 text-sm font-bold text-gray-900 uppercase tracking-wider text-right">Disc.</th>
                      <th className="py-3 px-2 text-sm font-bold text-gray-900 uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-2 text-sm text-gray-900 font-medium">{item.product_name}</td>
                        <td className="py-4 px-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                        <td className="py-4 px-2 text-sm text-gray-600 text-right">${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-sm text-gray-600 text-right">{item.discount}%</td>
                        <td className="py-4 px-2 text-sm text-gray-900 font-medium text-right">${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600 px-2">
                      <span>Subtotal</span>
                      <span className="font-medium">${Number(quotation.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 px-2">
                      <span>GST ({quotation.gst_percent ?? 18}%)</span>
                      <span className="font-medium">${Number(quotation.gst).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3 px-2 mt-3">
                      <span className="text-lg font-bold text-gray-900">Total Due</span>
                      <span className="text-xl font-bold text-blue-600">${Number(quotation.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for your business. If you have any questions regarding this quotation, please contact us.</p>
            </div>
            
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}
