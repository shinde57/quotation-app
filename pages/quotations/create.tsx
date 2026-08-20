import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

type Item = { product_name: string; quantity: number; unit_price: number; discount: number; };

export default function Create() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quotationNumber, setQuotationNumber] = useState(`Q-${Date.now()}`);
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0,10));
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<Item[]>([{ product_name: '', quantity: 1, unit_price: 0, discount: 0 }]);
  const [saving, setSaving] = useState(false);
  const GST = Number(process.env.NEXT_PUBLIC_GST_PERCENT || 18);

  const addRow = () => setItems([...items, { product_name: '', quantity: 1, unit_price: 0, discount: 0 }]);
  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<Item>) => {
    const copy = [...items]; copy[i] = { ...copy[i], ...patch }; setItems(copy);
  };

  const calcAmounts = () => {
    const netAmounts = items.map(it => {
      const gross = it.quantity * it.unit_price;
      const disc = gross * (it.discount / 100);
      const net = gross - disc;
      return net;
    });
    const subtotal = netAmounts.reduce((a,b) => a + b, 0);
    const gst = subtotal * (GST / 100);
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const validate = () => {
    if (!customerName.trim()) return 'Customer name is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Valid email required';
    if (!quotationDate) return 'Quotation date is required';
    if (items.length === 0) return 'At least one product required';
    for (const it of items) {
      if (!it.product_name.trim()) return 'Product name required';
      if (it.quantity <= 0) return 'Quantity must be > 0';
      if (it.unit_price < 0) return 'Unit price cannot be negative';
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    const { subtotal, gst, total } = calcAmounts();

    const { data: qData, error: qErr } = await supabase
      .from('quotations')
      .insert([{ 
        quotation_number: quotationNumber,
        customer_name: customerName,
        company_name: companyName,
        email,
        phone,
        quotation_date: quotationDate,
        valid_until: validUntil || null,
        subtotal,
        gst,
        total
      }])
      .select()
      .single();

    if (qErr || !qData) { setSaving(false); return alert(qErr?.message || 'Failed to create'); }

    const itemsToInsert = items.map(it => {
      const gross = it.quantity * it.unit_price;
      const discountAmount = gross * (it.discount / 100);
      const amount = gross - discountAmount;
      return {
        quotation_id: qData.id,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount: it.discount,
        amount
      };
    });

    const { error: itemsErr } = await supabase.from('quotation_items').insert(itemsToInsert);
    setSaving(false);
    if (itemsErr) return alert(itemsErr.message);
    router.push('/quotations');
  };

  const { subtotal, gst, total } = calcAmounts();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Create Quotation</Typography>
        <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
          <TextField label="Customer Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} required />
          <TextField label="Company" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <TextField label="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
          <TextField label="Quotation Number" value={quotationNumber} onChange={e=>setQuotationNumber(e.target.value)} />
          <TextField label="Quotation Date" type="date" value={quotationDate} onChange={e=>setQuotationDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Valid Until" type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} InputLabelProps={{ shrink: true }} />

          <Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1">Products</Typography>
              <IconButton size="small" onClick={addRow}><AddCircleOutlineIcon /></IconButton>
            </Box>
            {items.map((it, i) => (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 1, mt: 1 }}>
                <TextField label="Product" value={it.product_name} onChange={e=>updateRow(i,{product_name:e.target.value})} />
                <TextField label="Qty" type="number" value={it.quantity} onChange={e=>updateRow(i,{quantity: Number(e.target.value)})} />
                <TextField label="Unit Price" type="number" value={it.unit_price} onChange={e=>updateRow(i,{unit_price: Number(e.target.value)})} />
                <TextField label="Discount %" type="number" value={it.discount} onChange={e=>updateRow(i,{discount: Number(e.target.value)})} />
                <IconButton onClick={()=>removeRow(i)}><RemoveCircleOutlineIcon /></IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Box>
              <Typography>Subtotal: {subtotal.toLocaleString()}</Typography>
              <Typography>GST ({GST}%): {gst.toLocaleString()}</Typography>
              <Typography variant="h6">Grand Total: {total.toLocaleString()}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Quotation'}</Button>
            <Button variant="outlined" onClick={() => router.push('/quotations')}>Cancel</Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
