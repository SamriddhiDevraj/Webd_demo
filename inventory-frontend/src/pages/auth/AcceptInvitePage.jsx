import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateToken, acceptInvite } from '../../api/invite.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fadeInUp } from '../../utils/animations.js';

const TABS = ['register', 'login'];

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, login: authLogin } = useAuth();

  const [status, setStatus] = useState('loading'); // loading | error | valid | joining
  const [inviteInfo, setInviteInfo] = useState(null); // { shopName }
  const [errorReason, setErrorReason] = useState('');
  const [tab, setTab] = useState('register');
  const [submitting, setSubmitting] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    async function check() {
      try {
        const res = await validateToken(token);
        if (res.data.valid) {
          setInviteInfo({ shopName: res.data.shopName });
          setStatus('valid');
        } else {
          setErrorReason(res.data.reason ?? 'invalid');
          setStatus('error');
        }
      } catch {
        setErrorReason('not_found');
        setStatus('error');
      }
    }
    check();
  }, [token]);

  async function handleExistingUserJoin() {
    setSubmitting(true);
    try {
      const res = await acceptInvite(token, { mode: 'existing', userId: user._id });
      const { token: jwt, user: u, memberships } = res.data;
      authLogin(jwt, u, memberships);
      toast.success(`Joined ${inviteInfo.shopName}!`);
      navigate('/select-shop');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to join shop');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await acceptInvite(token, {
        mode: 'register',
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      const { token: jwt, user: u, memberships } = res.data;
      authLogin(jwt, u, memberships);
      toast.success(`Welcome to ${inviteInfo.shopName}!`);
      navigate('/select-shop');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await acceptInvite(token, {
        mode: 'login',
        email: loginEmail,
        password: loginPassword,
      });
      const { token: jwt, user: u, memberships } = res.data;
      authLogin(jwt, u, memberships);
      toast.success(`Joined ${inviteInfo.shopName}!`);
      navigate('/select-shop');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  const errorMessages = {
    used: { title: 'Link Already Used', body: 'This invite link has already been accepted. Each link can only be used once.' },
    expired: { title: 'Link Expired', body: 'This invite link has expired. Ask your shop owner to generate a new one.' },
    not_found: { title: 'Link Not Found', body: 'This invite link is invalid or no longer exists.' },
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <Loader2 size={32} className="animate-spin text-[#0052FF]" />
          <p className="text-sm">Validating invite link…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (status === 'error') {
    const msg = errorMessages[errorReason] ?? errorMessages.not_found;
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 max-w-md w-full text-center"
        >
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#0F172A] mb-2">{msg.title}</h1>
          <p className="text-[#64748B] text-sm">{msg.body}</p>
        </motion.div>
      </div>
    );
  }

  // ── Already logged in ────────────────────────────────────────────────────
  if (status === 'valid' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 max-w-md w-full text-center"
        >
          <CheckCircle size={48} className="text-[#0052FF] mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#0F172A] mb-2">
            Join {inviteInfo.shopName}
          </h1>
          <p className="text-[#64748B] text-sm mb-6">
            You're signed in as <strong>{user.name}</strong>. Click below to accept this invite.
          </p>
          <button
            onClick={handleExistingUserJoin}
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60"
          >
            {submitting ? 'Joining…' : `Join ${inviteInfo.shopName}`}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Valid invite — register / login tabs ─────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm w-full max-w-md"
      >
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Invite</span>
          </div>
          <h1 className="font-display text-2xl text-[#0F172A] mb-1">
            Join {inviteInfo.shopName}
          </h1>
          <p className="text-[#64748B] text-sm mb-6">
            You've been invited. Create an account or sign in to accept.
          </p>

          {/* Tabs */}
          <div className="flex border-b border-[#E2E8F0]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition ${
                  tab === t
                    ? 'border-[#0052FF] text-[#0052FF]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {t === 'register' ? <UserPlus size={14} /> : <LogIn size={14} />}
                {t === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 pt-6">
          {tab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="jane@example.com"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60 mt-2"
              >
                {submitting ? 'Creating account…' : 'Create Account & Join'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60 mt-2"
              >
                {submitting ? 'Signing in…' : 'Sign In & Join'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
