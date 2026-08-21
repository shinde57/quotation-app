import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { ClipboardList, FileText, Quote, Sparkles, UserPlus } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/quotations');
      }
    };
    checkSession();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    
    setSuccess('Account created. Check your email to confirm your address before signing in.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <section className="login-brand-entrance relative hidden lg:flex lg:w-[45%] overflow-hidden bg-[#0f172a] text-white px-12 xl:px-20 py-14 flex-col justify-between">
        <div className="brand-grid absolute inset-0 opacity-70"></div>
        <div className="brand-blob brand-blob-one"></div>
        <div className="brand-blob brand-blob-two"></div>
        <div className="relative z-[1] flex items-center gap-3">
          <div className="login-logo-entrance h-10 w-10 rounded-xl bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-950/50"><span className="text-xl font-black">N</span></div>
          <div><p className="text-xl font-bold tracking-tight">QuoteFlow</p><p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Quotation studio</p></div>
        </div>
        <div className="relative z-[1] -mt-16">
          <div className="relative h-64 max-w-lg">
            <div className="absolute left-6 top-2 h-28 w-28 rounded-full border border-indigo-400/25 brand-pulse"></div>
            <div className="absolute left-20 top-16 w-64 border-t border-dashed border-indigo-300/30 rotate-[18deg]"></div>
            <div className="absolute left-36 top-36 w-52 border-t border-dashed border-violet-300/30 -rotate-[25deg]"></div>
            <div className="brand-float absolute left-16 top-14 w-44 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-2xl rotate-[-6deg]"><Quote className="h-7 w-7 text-indigo-300 mb-5" /><div className="space-y-2"><div className="h-2 w-24 rounded-full bg-white/40"></div><div className="h-2 w-32 rounded-full bg-white/20"></div></div></div>
            <div className="brand-float-delay absolute right-4 top-0 w-40 rounded-2xl border border-white/15 bg-[#3730a3]/70 p-5 backdrop-blur-md shadow-2xl rotate-[8deg]"><ClipboardList className="h-7 w-7 text-violet-200 mb-5" /><div className="h-2 w-24 rounded-full bg-white/25"></div><div className="mt-3 h-2 w-16 rounded-full bg-white/15"></div></div>
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Start with clarity</p>
          <h1 className="max-w-xl text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight">Build proposals your customers remember.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">A focused workspace for creating polished quotations and growing better business relationships.</p>
        </div>
        <div className="relative z-[1] flex items-center gap-2 text-xs text-slate-500"><Sparkles className="h-4 w-4 text-indigo-400" /> Your next great proposal starts here.</div>
      </section>

      <section className="auth-stage login-form-entrance flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center font-black">N</div><span className="text-xl font-bold text-[#0f172a]">QuoteFlow</span></div>
          <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f46e5]">Create your workspace</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">Create your account</h2><p className="mt-3 text-sm leading-6 text-[#64748b]">Set up your account and start sending sharper quotations.</p></div>
        <div className="auth-card bg-white py-9 px-5 sm:px-9 rounded-3xl">
          <div className="auth-card-glow"></div>
          <div className="relative z-[1]">
          <div className="flex items-center justify-between mb-7">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">Create workspace</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10b981]"><span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span> Secure setup</span>
          </div>
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <p className="text-sm text-emerald-700">{success}</p>
                <Link href="/" className="mt-2 inline-block text-sm font-bold text-emerald-800 hover:text-emerald-900">
                  Return to sign in
                </Link>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#0f172a]">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input placeholder-[#94a3b8]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#0f172a]">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input placeholder-[#94a3b8]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="primary-action w-full justify-center py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f46e5] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[#64748b]">Already have an account?{' '}<Link href="/" className="font-bold text-[#4f46e5] hover:text-[#3730a3] transition-colors">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
