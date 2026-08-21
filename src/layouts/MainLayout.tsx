import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { LogOut, FileText, LayoutDashboard, Plus, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function MainLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || ''));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="app-shell min-h-screen flex">
      <aside className="hidden md:flex w-[240px] shrink-0 bg-white border-r border-[#e2e8f0] min-h-screen flex-col sticky top-0 h-screen">
        <div className="px-5 h-20 flex items-center border-b border-[#e2e8f0]">
          <Link href="/quotations" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center shadow-sm">
              <span className="text-lg font-black">N</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#0f172a]">QuoteFlow</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[#64748b]">Quotation studio</span>
            </div>
          </Link>
        </div>
        <nav className="px-3 py-6 space-y-1 flex-1">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#94a3b8]">Workspace</p>
          <Link href="/quotations" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${router.pathname === '/quotations' ? 'bg-[#eef2ff] text-[#4f46e5]' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'}`}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/quotations/create" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${router.pathname === '/quotations/create' ? 'bg-[#eef2ff] text-[#4f46e5]' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'}`}>
            <Plus className="h-4 w-4" /> New quotation
          </Link>
          <Link href="/quotations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors">
            <FileText className="h-4 w-4" /> All quotations
          </Link>
          <p className="px-3 mt-8 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#94a3b8]">Account</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </button>
        </nav>
        <div className="p-3 border-t border-[#e2e8f0]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f8fafc]">
            <div className="h-9 w-9 rounded-full bg-[#ddd6fe] text-[#5b21b6] flex items-center justify-center font-bold text-sm">
              {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0f172a] truncate">{userEmail || 'Signed in user'}</p>
              <p className="text-[11px] text-[#64748b]">Workspace member</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-[#64748b] hover:text-[#ef4444] transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            <Link href="/quotations" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-black">N</div>
              <span className="font-bold text-[#0f172a]">QuoteFlow</span>
            </Link>
            <button onClick={handleLogout} className="text-[#64748b] hover:text-[#ef4444]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <header className="hidden md:flex h-20 bg-white/80 border-b border-[#e2e8f0] items-center justify-between px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#94a3b8]">Workspace</p><p className="text-sm font-semibold text-[#0f172a] mt-1">{title}</p></div>
          <Link href="/quotations/create" className="primary-action"><Plus className="h-4 w-4" /> New quotation</Link>
        </header>
        <div className="flex-1">
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
