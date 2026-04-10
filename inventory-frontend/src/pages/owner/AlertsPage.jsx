import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Sparkles, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAlerts, markAlertRead, markAllAlertsRead, generateAlerts,
} from '../../api/ai.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { timeAgo } from '../../utils/formatDate.js';
import { fadeInUp, stagger } from '../../utils/animations.js';

const SEVERITY_BORDER = {
  high:   'border-l-[#EF4444]',
  medium: 'border-l-[#F97316]',
  low:    'border-l-[#EAB308]',
};

const SEVERITY_DOT = {
  high:   'bg-[#EF4444]',
  medium: 'bg-[#F97316]',
  low:    'bg-[#EAB308]',
};

const TYPE_LABELS = {
  restock:        'Restock',
  slow_mover:     'Slow Mover',
  trending:       'Trending',
  weekly_summary: 'Weekly Summary',
};

const TABS = [
  { key: 'all',            label: 'All' },
  { key: 'unread',         label: 'Unread' },
  { key: 'restock',        label: 'Restock' },
  { key: 'trending',       label: 'Trending' },
  { key: 'slow_mover',     label: 'Slow Movers' },
  { key: 'weekly_summary', label: 'Weekly Summary' },
];

function AlertCard({ alert, onMarkRead }) {
  if (alert.type === 'weekly_summary') {
    return (
      <div className="rounded-xl bg-gradient-to-br from-[#0052FF] via-[#4D7CFF] to-[#0052FF] p-[2px]">
        <div className={`rounded-[10px] p-5 ${alert.isRead ? 'bg-white' : 'bg-[#0052FF]/[0.02]'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#0052FF]/10 text-[#0052FF]">
                  Weekly Summary
                </span>
                <span className="text-xs text-[#94A3B8]">{timeAgo(alert.createdAt)}</span>
              </div>
              <p className="text-sm text-[#0F172A] leading-relaxed">{alert.message}</p>
            </div>
            {!alert.isRead && (
              <button
                onClick={() => onMarkRead(alert._id)}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#22C55E] transition flex-shrink-0"
                title="Mark as read"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-[#E2E8F0] border-l-4 ${SEVERITY_BORDER[alert.severity]} p-4 ${
        !alert.isRead ? 'bg-[#0052FF]/[0.02]' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[alert.severity]}`} />
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">
              {TYPE_LABELS[alert.type] || alert.type}
            </span>
            <span className="text-xs font-medium text-[#94A3B8]">·</span>
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
              {alert.severity}
            </span>
            <span className="ml-auto text-xs text-[#94A3B8]">{timeAgo(alert.createdAt)}</span>
          </div>
          {alert.productId?.name && (
            <p className="font-semibold text-[#0F172A] text-sm">{alert.productId.name}</p>
          )}
          <p className="text-sm text-[#64748B] mt-0.5">{alert.message}</p>
        </div>
        {!alert.isRead && (
          <button
            onClick={() => onMarkRead(alert._id)}
            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#22C55E] transition flex-shrink-0"
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { activeShop } = useShop();
  const [allAlerts, setAllAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlerts(activeShop.shopId);
      setAllAlerts(res.data.alerts);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [activeShop.shopId]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filteredAlerts = allAlerts.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !a.isRead;
    return a.type === activeTab;
  });

  async function handleMarkRead(alertId) {
    try {
      const res = await markAlertRead(activeShop.shopId, alertId);
      setUnreadCount(res.data.unreadCount);
      setAllAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, isRead: true } : a))
      );
    } catch {
      toast.error('Failed to mark alert as read');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAlertsRead(activeShop.shopId);
      setUnreadCount(0);
      setAllAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch {
      toast.error('Failed to mark all as read');
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await generateAlerts(activeShop.shopId);
      toast.success(`${res.data.generated} new alert${res.data.generated !== 1 ? 's' : ''} generated`);
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to generate alerts');
    } finally {
      setGenerating(false);
    }
  }

  const emptyMessages = {
    all:            'No alerts yet',
    unread:         'No unread alerts',
    restock:        'No restock alerts',
    trending:       'No trending alerts',
    slow_mover:     'No slow mover alerts',
    weekly_summary: 'No weekly summaries yet',
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Smart Alerts</span>
          </div>
          <h1 className="font-display text-3xl text-[#0F172A]">Alerts</h1>
          <p className="text-[#64748B] mt-1">AI-powered inventory alerts for your shop.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60 whitespace-nowrap"
        >
          <Sparkles size={15} />
          {generating ? 'Analyzing inventory…' : 'Generate Alerts'}
        </button>
      </motion.div>

      {/* Tabs + Mark All Read */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition ${
                activeTab === tab.key
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                  activeTab === 'unread' ? 'bg-white text-[#0052FF]' : 'bg-[#0052FF] text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] text-xs font-medium hover:text-[#0F172A] transition"
          >
            <CheckCheck size={13} />
            Mark All Read
          </button>
        )}
      </motion.div>

      {/* Alert list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#E2E8F0] p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-[#F1F5F9] rounded" />
                  <div className="h-4 w-48 bg-[#F1F5F9] rounded" />
                  <div className="h-3 w-64 bg-[#F1F5F9] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-16 flex flex-col items-center text-center"
        >
          <Bell size={40} className="text-[#E2E8F0] mb-3" />
          <p className="font-medium text-[#0F172A]">{emptyMessages[activeTab]}</p>
          {activeTab === 'all' && (
            <p className="text-[#64748B] text-sm mt-1">
              Click "Generate Alerts" to analyze your inventory.
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {filteredAlerts.map((alert) => (
            <motion.div key={alert._id} variants={fadeInUp}>
              <AlertCard alert={alert} onMarkRead={handleMarkRead} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
