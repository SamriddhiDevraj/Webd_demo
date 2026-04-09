import { motion } from 'framer-motion';
import { fadeInUp, stagger } from '../../utils/animations.js';

export default function AlertsPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5">
        <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Alerts</span>
      </motion.div>
      <motion.h1 variants={fadeInUp} className="font-display text-3xl text-[#0F172A]">Alerts</motion.h1>
      <motion.p variants={fadeInUp} className="text-[#64748B]">
        AI-powered alerts coming in Phase 5.
      </motion.p>
    </motion.div>
  );
}
