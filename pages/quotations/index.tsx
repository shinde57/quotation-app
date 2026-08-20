import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

type Quotation = {
  id: string;
  quotation_number: string | null;
  customer_name: string;
  subtotal: number | null;
  gst: number | null;
  total: number | null;
  quotation_date: string;
};

export default function ListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return alert(error.message);
      setRows(data as Quotation[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quotation?')) return;
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) return alert(error.message);
    setRows(r => r.filter(x => x.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h5">Quotations</Typography>
        <Box>
          <Link href="/quotations/create" passHref legacyBehavior><Button variant="contained" sx={{ mr: 2 }}>New Quotation</Button></Link>
          <Button variant="outlined" color="inherit" onClick={signOut}>Logout</Button>
        </Box>
      </Box>

      {loading ? <Typography>Loading...</Typography> : (
        <Table>
          <TableHead><TableRow>
            <TableCell>Quotation #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.quotation_number}</TableCell>
                <TableCell>{r.customer_name}</TableCell>
                <TableCell>{Number(r.total || 0).toLocaleString()}</TableCell>
                <TableCell>{new Date(r.quotation_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={`/quotations/${r.id}`} passHref legacyBehavior><Button size="small">View</Button></Link>
                  <Button size="small" color="error" onClick={() => handleDelete(r.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}
