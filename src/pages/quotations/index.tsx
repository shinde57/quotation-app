import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { Plus, Trash2, Eye, FileText, Search, Pencil, ArrowUpRight, Receipt, MoreHorizontal, ArrowRight, ChevronDown, Check, X, AlertTriangle, Clock3, Download, TrendingUp, CircleDollarSign } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import AuthGuard from '../../layouts/AuthGuard';
import { Quotation } from '../../types';

type Status = 'approved' | 'pending' | 'draft' | 'rejected';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const statusLabels: Record<Status, string> = { approved: 'Approved', pending: 'Pending', draft: 'Draft', rejected: 'Rejected' };
const statusStyles: Record<Status, string> = { approved: 'bg-emerald-50 text-emerald-700 border-emerald-100', pending: 'bg-amber-50 text-amber-700 border-amber-100', draft: 'bg-slate-100 text-slate-600 border-slate-200', rejected: 'bg-red-50 text-red-700 border-red-100' };

function Dropdown({ value, options, onChange }: { value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value)?.label || options[0].label;
  return <div className="relative"><button type="button" onClick={() => setOpen(current => !current)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-[#0f172a] transition-colors hover:border-[#a5b4fc] sm:min-w-[138px]"><span className="truncate">{selected}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#64748b] transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="filter-menu absolute right-0 top-full z-30 mt-2 w-full min-w-[158px] rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-xl shadow-slate-200/70">{options.map(option => <button key={option.value} type="button" onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${option.value === value ? 'bg-[#eef2ff] font-bold text-[#4f46e5]' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'}`}>{option.label}{option.value === value && <Check className="h-4 w-4" />}</button>)}</div>}</div>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500 status-pulse' : status === 'rejected' ? 'bg-red-500' : 'bg-slate-400'}`}></span>{statusLabels[status]}</span>;
}

function SkeletonCard() {
  return <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5"><div className="skeleton-line h-3 w-24 rounded"></div><div className="skeleton-line mt-4 h-5 w-40 rounded"></div><div className="skeleton-line mt-2 h-3 w-28 rounded"></div><div className="mt-8 flex justify-between"><div className="skeleton-line h-8 w-28 rounded"></div><div className="skeleton-line h-9 w-20 rounded-lg"></div></div></div>;
}

export default function Dashboard() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => { fetchQuotations(); }, []);
  const fetchQuotations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error: fetchError } = await supabase.from('quotations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (fetchError) setError(fetchError.message);
    if (data) setQuotations(data as Quotation[]);
    setLoading(false);
  };

  const normalizedQuotations = useMemo(() => quotations.map(quotation => ({ ...quotation, status: (quotation.status || 'pending') as Status })), [quotations]);
  const totalValue = normalizedQuotations.reduce((sum, quotation) => sum + Number(quotation.total || 0), 0);
  const approvedCount = normalizedQuotations.filter(quotation => quotation.status === 'approved').length;
  const pendingCount = normalizedQuotations.filter(quotation => quotation.status === 'pending').length;
  const newest = normalizedQuotations[0];

  useEffect(() => {
    const duration = 650;
    const started = performance.now();
    const animate = (time: number) => { const progress = Math.min((time - started) / duration, 1); setAnimatedCount(Math.round(normalizedQuotations.length * progress)); setAnimatedValue(Math.round(totalValue * progress)); if (progress < 1) requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
  }, [normalizedQuotations.length, totalValue]);

  const filteredQuotations = useMemo(() => normalizedQuotations.filter(quotation => {
    const query = search.toLowerCase();
    const matchesSearch = [quotation.quotation_number, quotation.customer_name, quotation.company_name].filter(Boolean).some(value => value!.toLowerCase().includes(query));
    const date = new Date(quotation.quotation_date);
    const now = new Date();
    const matchesDate = dateFilter === 'all' || (dateFilter === 'month' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) || (dateFilter === 'year' && date.getFullYear() === now.getFullYear());
    const amount = Number(quotation.total || 0);
    const matchesValue = valueFilter === 'all' || (valueFilter === 'small' && amount < 10000) || (valueFilter === 'medium' && amount >= 10000 && amount < 50000) || (valueFilter === 'large' && amount >= 50000);
    return matchesSearch && (statusFilter === 'all' || quotation.status === statusFilter) && matchesDate && matchesValue;
  }).sort((a, b) => {
    if (sort === 'highest') return Number(b.total || 0) - Number(a.total || 0);
    if (sort === 'lowest') return Number(a.total || 0) - Number(b.total || 0);
    const first = new Date(a.quotation_date).getTime(); const second = new Date(b.quotation_date).getTime();
    return sort === 'oldest' ? first - second : second - first;
  }), [normalizedQuotations, search, statusFilter, dateFilter, valueFilter, sort]);

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    const id = deleteTarget.id;
    setDeleteTarget(null); setDeletingId(id);
    const { error: deleteError } = await supabase.from('quotations').delete().eq('id', id);
    if (deleteError) setToast({ type: 'error', message: deleteError.message });
    else { setDeletedId(id); setToast({ type: 'success', message: 'Quotation deleted successfully' }); window.setTimeout(() => { setQuotations(current => current.filter(quotation => quotation.id !== id)); setDeletedId(null); }, 650); }
    setDeletingId(null); window.setTimeout(() => setToast(null), 3200);
  };

  const updateStatus = async (quotation: Quotation, status: Status) => {
    if (!quotation.id) return;
    const { error: statusError } = await supabase.from('quotations').update({ status }).eq('id', quotation.id);
    if (statusError) {
      setToast({ type: 'error', message: statusError.message });
    } else {
      setQuotations(current => current.map(item => item.id === quotation.id ? { ...item, status } : item));
      setToast({ type: 'success', message: `Quotation marked ${statusLabels[status].toLowerCase()}` });
    }
    setOpenMenu(null);
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleDownload = (id: string) => { setDownloadingId(id); window.setTimeout(() => { setDownloadingId(null); router.push(`/quotations/${id}`); }, 450); };

  return <AuthGuard><MainLayout title="Dashboard"><div className="pb-12">
    <header className="workspace-header flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow mb-2">Quotation workspace</p><h1 className="page-title">Quotations</h1><p className="mt-2 text-sm text-[#64748b]">Create, manage and track your software quotations.</p></div><Link href="/quotations/create" className="primary-action self-start md:self-auto"><Plus className="h-4 w-4" /> Create Quotation</Link></header>
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="kpi-card quotation-card"><div className="flex items-start justify-between"><p className="kpi-label">Total Quotations</p><div className="kpi-icon indigo"><Receipt className="h-4 w-4" /></div></div><p className="kpi-value">{animatedCount}</p><p className="kpi-trend positive"><TrendingUp className="h-3.5 w-3.5" /> All quotations</p></div><div className="kpi-card quotation-card"><div className="flex items-start justify-between"><p className="kpi-label">Approved</p><div className="kpi-icon green"><Check className="h-4 w-4" /></div></div><p className="kpi-value">{approvedCount}</p><p className="kpi-trend positive"><ArrowUpRight className="h-3.5 w-3.5" /> Ready to win</p></div><div className="kpi-card quotation-card"><div className="flex items-start justify-between"><p className="kpi-label">Pending</p><div className="kpi-icon amber"><Clock3 className="h-4 w-4" /></div></div><p className="kpi-value">{pendingCount}</p><p className="kpi-trend warning"><Clock3 className="h-3.5 w-3.5" /> Needs attention</p></div><div className="kpi-card quotation-card"><div className="flex items-start justify-between"><p className="kpi-label">Total Value</p><div className="kpi-icon violet"><CircleDollarSign className="h-4 w-4" /></div></div><p className="kpi-value">${animatedValue.toLocaleString()}</p><p className="kpi-trend positive"><TrendingUp className="h-3.5 w-3.5" /> Portfolio value</p></div></section>
    {newest && <section className="featured-quotation mt-8"><div><p className="eyebrow text-[#a5b4fc]">Featured quotation</p><h2 className="mt-2 text-xl font-bold text-white">{newest.quotation_number || 'Latest quotation'}</h2><p className="mt-2 text-sm text-slate-400">The newest addition to your quotation pipeline.</p></div><div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4"><div><p className="featured-label">Customer</p><p className="featured-value truncate">{newest.customer_name}</p></div><div><p className="featured-label">Status</p><div className="mt-2"><StatusBadge status={newest.status} /></div></div><div><p className="featured-label">Created</p><p className="featured-value">{new Date(newest.quotation_date).toLocaleDateString()}</p></div><div><p className="featured-label">Amount</p><p className="featured-amount">${Number(newest.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div></div><div className="mt-6 flex flex-wrap gap-2"><Link href={`/quotations/${newest.id}`} className="featured-button">View quotation <ArrowRight className="h-4 w-4" /></Link><Link href={`/quotations/create?edit=${newest.id}`} className="featured-secondary">Edit</Link></div></section>}
    <section className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#e2e8f0] bg-[#fbfcfe] p-4 sm:p-5 xl:flex-row xl:items-center"><div className="quotation-search relative flex min-w-0 flex-1 items-center rounded-xl border border-[#e2e8f0] bg-white"><Search className="quotation-search-icon ml-3 h-4 w-4 shrink-0 text-[#94a3b8]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search quotations..." className="w-full border-0 bg-transparent px-2 py-2.5 text-sm focus:outline-none focus:ring-0" /></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex"><Dropdown value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All status' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]} /><Dropdown value={dateFilter} onChange={setDateFilter} options={[{ value: 'all', label: 'All dates' }, { value: 'month', label: 'This month' }, { value: 'year', label: 'This year' }]} /><Dropdown value={valueFilter} onChange={setValueFilter} options={[{ value: 'all', label: 'All values' }, { value: 'small', label: 'Under $10k' }, { value: 'medium', label: '$10k - $50k' }, { value: 'large', label: 'Over $50k' }]} /><Dropdown value={sort} onChange={value => setSort(value as SortOption)} options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'highest', label: 'Highest value' }, { value: 'lowest', label: 'Lowest value' }]} /></div><Link href="/quotations/create" className="primary-action justify-center xl:ml-auto"><Plus className="h-4 w-4" /> Create quotation</Link></div>
      {error && <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(item => <SkeletonCard key={item} />)}</div> : filteredQuotations.length === 0 ? <div className="empty-state p-12 text-center"><div className="empty-document mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5]"><FileText className="h-8 w-8" /></div><h3 className="mt-5 text-lg font-bold text-[#0f172a]">No quotations yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748b]">Create your first professional quotation and keep your sales pipeline moving.</p><Link href="/quotations/create" className="primary-action mt-6"><Plus className="h-4 w-4" /> Create Quotation</Link></div> : <div className="grid grid-cols-1 gap-4 bg-[#f8fafc] p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{filteredQuotations.map((quotation, index) => <article key={quotation.id} className={`quotation-card relative rounded-2xl border border-[#e2e8f0] bg-white p-5 ${deletedId === quotation.id ? 'card-deleting' : ''}`} style={{ animationDelay: `${index * 60}ms` }}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f46e5]">{quotation.quotation_number || 'Quotation'}</p><div className="mt-2"><StatusBadge status={quotation.status} /></div></div><div className="relative"><button type="button" onClick={() => setOpenMenu(openMenu === quotation.id ? null : quotation.id || null)} className="quotation-more-action rounded-lg p-1 text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#4f46e5]" aria-label="Quotation actions"><MoreHorizontal className="h-5 w-5" /></button>{openMenu === quotation.id && <div className="filter-menu absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-xl"><Link href={`/quotations/${quotation.id}`} className="menu-action"><Eye className="h-3.5 w-3.5" /> View</Link><Link href={`/quotations/create?edit=${quotation.id}`} className="menu-action"><Pencil className="h-3.5 w-3.5" /> Edit</Link><div className="my-1 border-t border-slate-100"></div><p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Set status</p>{(Object.keys(statusLabels) as Status[]).map(status => <button key={status} type="button" onClick={() => updateStatus(quotation, status)} className="menu-action"><span className={`h-2 w-2 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : status === 'rejected' ? 'bg-red-500' : 'bg-slate-400'}`}></span>{statusLabels[status]}{quotation.status === status && <Check className="ml-auto h-3.5 w-3.5 text-indigo-600" />}</button>)}<div className="my-1 border-t border-slate-100"></div><button type="button" onClick={() => { setOpenMenu(null); setDeleteTarget(quotation); }} className="menu-action danger"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div>}</div></div><div className="mt-5"><h3 className="truncate text-lg font-bold text-[#0f172a]">{quotation.customer_name}</h3><p className="mt-1 truncate text-sm text-[#64748b]">{quotation.company_name || 'Software services quotation'}</p><p className="mt-3 line-clamp-1 text-xs text-[#94a3b8]">Software development, implementation and professional services</p></div><div className="mt-6 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-[#94a3b8]">Created {new Date(quotation.quotation_date).toLocaleDateString()}</p><p className="mt-1 text-2xl font-bold text-[#0f172a]">${Number(quotation.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div><Link href={`/quotations/${quotation.id}`} className="quotation-view-action inline-flex items-center gap-1.5 rounded-lg bg-[#eef2ff] px-3 py-2 text-xs font-bold text-[#4f46e5] hover:bg-[#e0e7ff]">View <ArrowRight className="quotation-arrow h-3.5 w-3.5" /></Link></div><div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ddd6fe] text-[11px] font-bold text-[#5b21b6]">{quotation.customer_name.charAt(0).toUpperCase()}</div><span className="text-xs font-semibold text-[#64748b]">QuoteFlow team</span></div><div className="flex items-center gap-2">{quotation.valid_until && <span className="text-[11px] text-[#94a3b8]">Valid {new Date(quotation.valid_until).toLocaleDateString()}</span>}<button type="button" onClick={() => handleDownload(quotation.id!)} disabled={downloadingId === quotation.id} className="text-[#64748b] transition-colors hover:text-[#4f46e5]" title="Download PDF">{downloadingId === quotation.id ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent"></span> : <Download className="h-3.5 w-3.5" />}</button></div></div>{deletedId === quotation.id && <div className="delete-card-overlay"><div className="delete-success-icon flex h-11 w-11 items-center justify-center rounded-full bg-[#d1fae5] text-[#10b981]"><Check className="h-6 w-6" /></div><p className="mt-2 text-sm font-bold text-[#047857]">Quotation deleted successfully</p></div>}</article>)}</div>}
    </section>
    </div>
    {toast && <div className={`toast-notification ${toast.type === 'error' ? 'error' : ''}`}><div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">{toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}</div><span>{toast.message}</span></div>}
    {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 px-4 backdrop-blur-sm"><div className="delete-modal w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><AlertTriangle className="h-5 w-5" /></div><button type="button" onClick={() => setDeleteTarget(null)} className="text-[#94a3b8] hover:text-[#0f172a]" aria-label="Close"><X className="h-5 w-5" /></button></div><h2 className="mt-5 text-xl font-bold text-[#0f172a]">Delete quotation?</h2><p className="mt-2 text-sm leading-6 text-[#64748b]">You are about to delete <span className="font-bold text-[#0f172a]">{deleteTarget.quotation_number || 'this quotation'}</span>. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b] hover:bg-[#f8fafc]">Cancel</button><button type="button" onClick={confirmDelete} className="rounded-xl bg-[#ef4444] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#dc2626]">Delete quotation</button></div></div></div>}
  </MainLayout></AuthGuard>;
}