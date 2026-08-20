import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Button from '@mui/material/Button';

export default function ViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [quotation, setQuotation] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data: q } = await supabase.from('quotations').select('*').eq('id', id).single();
      const { data: its } = await supabase.from('quotation_items').select('*').eq('quotation_id', id);
      setQuotation(q);
      setItems(its || []);
    };
    fetch();
  }, [id]);

  if (!quotation) return <Container>Loading...</Container>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Quotation: {quotation.quotation_number}</Typography>
          <Box>
            <Button onClick={() => router.push('/quotations')}>Back</Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography><strong>Customer:</strong> {quotation.customer_name} | {quotation.company_name}</Typography>
          <Typography><strong>Email:</strong> {quotation.email} | <strong>Phone:</strong> {quotation.phone}</Typography>
          <Typography><strong>Date:</strong> {new Date(quotation.quotation_date).toLocaleDateString()}</Typography>
        </Box>

        <Table sx={{ mt: 2 }}>
          <TableHead><TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Unit Price</TableCell>
            <TableCell>Discount %</TableCell>
            <TableCell>Amount</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {items.map(it => (
              <TableRow key={it.id}>
                <TableCell>{it.product_name}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>{Number(it.unit_price).toLocaleString()}</TableCell>
                <TableCell>{it.discount}</TableCell>
                <TableCell>{Number(it.amount).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right">Subtotal</TableCell>
              <TableCell>{Number(quotation.subtotal || 0).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} align="right">GST</TableCell>
              <TableCell>{Number(quotation.gst || 0).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} align="right"><strong>Total</strong></TableCell>
              <TableCell><strong>{Number(quotation.total || 0).toLocaleString()}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
