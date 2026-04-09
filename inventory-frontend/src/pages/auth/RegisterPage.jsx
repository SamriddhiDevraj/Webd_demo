import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register as registerApi } from '../../api/auth.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fadeInUp, stagger } from '../../utils/animations.js';

const bullets = [
  'AI-powered demand forecasting',
  'Real-time stock alerts',
  'Multi-shop management',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user, res.data.memberships);
      navigate('/select-shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F172A] flex-col justify-center px-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #0052FF, transparent 70%)' }}
        />
        <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10">
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl text-white leading-tight mb-8"
          >
            Start managing your shop{' '}
            <span className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
              today
            </span>
          </motion.h1>
          <motion.ul variants={stagger} className="space-y-4">
            {bullets.map((b) => (
              <motion.li key={b} variants={fadeInUp} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] flex-shrink-0" />
                <span className="text-slate-300 text-base">{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="font-display text-2xl text-[#0F172A]">InventoryAI</span>
          </motion.div>
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="font-display text-3xl text-[#0F172A] mb-1">Create your account</h2>
            <p className="text-[#64748B]">Register and set up your shop in one step</p>
          </motion.div>
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ahmed Ali"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Shop Display Name
              </label>
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                required
                placeholder="Ahmed's Electronics"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                required
                placeholder="Ahmed Electronics LLC"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Creating account…' : 'Create Account & Shop'}
            </button>
          </motion.form>
          <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0052FF] font-semibold hover:underline">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
