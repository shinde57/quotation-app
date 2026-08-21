import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { FileText, LogIn, Mail, Quote, ClipboardList, Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/quotations');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailConfirmationRequired(false);
    setResendMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      const isEmailConfirmationError = error.message.toLowerCase().includes('email not confirmed');
      setEmailConfirmationRequired(isEmailConfirmationError);
      setError(isEmailConfirmationError
        ? 'Please confirm your email address before signing in.'
        : error.message);
      setLoading(false);
      return;
    }
    
    router.push('/quotations');
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    setResendMessage(null);

    const { error } = await supabase.auth.resend({ type: 'signup', email });

    if (error) {
      setResendMessage(error.message);
    } else {
      setResendMessage('A new confirmation email has been sent. Check your inbox.');
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <section className="login-brand-entrance relative hidden lg:flex lg:w-[45%] overflow-hidden bg-[#0f172a] text-white px-12 xl:px-20 py-14 flex-col justify-between">
        <div className="brand-grid absolute inset-0 opacity-70"></div>
        <div className="brand-blob brand-blob-one"></div>
        <div className="brand-blob brand-blob-two"></div>
        <div className="relative z-[1]">
          <div className="flex items-center gap-3">
            <div className="login-logo-entrance h-10 w-10 rounded-xl bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <span className="text-xl font-black">N</span>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">QuoteFlow</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Quotation studio</p>
            </div>
          </div>
        </div>

        <div className="relative z-[1] -mt-16">
          <div className="relative h-64 max-w-lg">
            <div className="absolute left-6 top-2 h-28 w-28 rounded-full border border-indigo-400/25 brand-pulse"></div>
            <div className="absolute left-20 top-16 w-64 border-t border-dashed border-indigo-300/30 rotate-[18deg]"></div>
            <div className="absolute left-36 top-36 w-52 border-t border-dashed border-violet-300/30 -rotate-[25deg]"></div>
            <div className="absolute left-4 top-12 h-3 w-3 rounded-full bg-indigo-300 shadow-lg shadow-indigo-300/70"></div>
            <div className="absolute right-20 top-28 h-2 w-2 rounded-full bg-violet-300 shadow-lg shadow-violet-300/70"></div>
            <div className="brand-float absolute left-16 top-14 w-44 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-2xl shadow-black/20 rotate-[-6deg]">
              <Quote className="h-7 w-7 text-indigo-300 mb-5" />
              <div className="space-y-2"><div className="h-2 w-24 rounded-full bg-white/40"></div><div className="h-2 w-32 rounded-full bg-white/20"></div><div className="h-2 w-20 rounded-full bg-white/20"></div></div>
            </div>
            <div className="brand-float-delay absolute right-4 top-0 w-40 rounded-2xl border border-white/15 bg-[#3730a3]/70 p-5 backdrop-blur-md shadow-2xl shadow-black/20 rotate-[8deg]">
              <ClipboardList className="h-7 w-7 text-violet-200 mb-5" />
              <div className="flex items-center gap-2"><div className="h-5 w-5 rounded bg-emerald-400/80"></div><div className="h-2 w-16 rounded-full bg-white/35"></div></div>
              <div className="mt-3 h-2 w-24 rounded-full bg-white/20"></div>
            </div>
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Make every quote count</p>
          <h1 className="max-w-xl text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight">Turn a blank page into a confident proposal.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">Create, organize, and share professional quotations from one calm, focused workspace.</p>
        </div>
        <div className="relative z-[1] flex items-center gap-2 text-xs text-slate-500"><Sparkles className="h-4 w-4 text-indigo-400" /> Built for clear conversations and better business.</div>
      </section>

      <section className="auth-stage login-form-entrance flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center font-black">N</div>
            <span className="text-xl font-bold text-[#0f172a]">QuoteFlow</span>
          </div>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f46e5]">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">Sign in to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-[#64748b]">Pick up where you left off and keep your next proposal moving.</p>
          </div>
          <div className="auth-card bg-white py-9 px-5 sm:px-9 rounded-3xl">
            <div className="auth-card-glow"></div>
            <div className="relative z-[1]">
            <div className="flex items-center justify-between mb-7">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">Secure sign in</span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10b981]"><span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span> Protected</span>
            </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
                {emailConfirmationRequired && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending || !email}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-800 hover:text-red-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Mail className="h-4 w-4" />
                    {resending ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                )}
                {resendMessage && (
                  <p className="mt-2 text-sm text-red-700">{resendMessage}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#0f172a]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="field-input mt-2 placeholder-[#94a3b8]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#0f172a]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="field-input mt-2 placeholder-[#94a3b8]"
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
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-[#64748b]">New to QuoteFlow?{' '}<Link href="/register" className="font-bold text-[#4f46e5] hover:text-[#3730a3] transition-colors">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}
