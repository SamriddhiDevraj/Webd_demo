import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, Trash2, UserPlus, Users, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getStaff, removeStaff as removeStaffApi,
  generateInvite as generateInviteApi,
  getPendingInvites, revokeInvite as revokeInviteApi,
} from '../../api/staff.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { fadeInUp, stagger } from '../../utils/animations.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function ExpiryBadge({ hours }) {
  if (hours < 2) return <span className="text-xs font-medium text-[#EF4444]">Expires in {hours}h ⚠</span>;
  if (hours < 12) return <span className="text-xs font-medium text-[#F97316]">Expires in {hours}h</span>;
  return <span className="text-xs font-medium text-[#22C55E]">Expires in {hours}h</span>;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition ${
        copied
          ? 'border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/5'
          : 'border-[#E2E8F0] text-[#64748B] hover:border-[#0052FF]/30 hover:text-[#0052FF]'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

function InviteLinkModal({ inviteUrl, expiresAt, onClose, onDone }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const hoursRemaining = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 3600000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition"
        >
          <X size={16} />
        </button>

        <h2 className="font-display text-2xl text-[#0F172A] mb-2">Invite Link Generated</h2>
        <p className="text-[#64748B] text-sm mb-5">Share this link with your new staff member.</p>

        <div className="bg-[#F1F5F9] rounded-xl p-4 font-mono text-sm text-[#0F172A] break-all mb-4">
          {inviteUrl}
        </div>

        <div className="flex items-start gap-2 mb-6 text-sm text-[#64748B]">
          <Clock size={15} className="flex-shrink-0 mt-0.5" />
          <p>This link expires in <strong>{hoursRemaining} hours</strong> and can only be used once.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border font-medium text-sm transition ${
              copied
                ? 'border-[#22C55E]/40 text-[#22C55E]'
                : 'border-[#E2E8F0] text-[#64748B] hover:border-[#0052FF]/30 hover:text-[#0052FF]'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={onDone}
            className="flex-1 h-11 rounded-xl text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { activeShop } = useShop();
  const [staff, setStaff] = useState([]);
  const [invites, setInvites] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await getStaff(activeShop.shopId);
      setStaff(res.data.staff);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  }, [activeShop.shopId]);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await getPendingInvites(activeShop.shopId);
      setInvites(res.data.invites);
    } catch { /* silent */ }
  }, [activeShop.shopId]);

  useEffect(() => {
    fetchStaff();
    fetchInvites();
  }, [fetchStaff, fetchInvites]);

  async function handleGenerateInvite() {
    setGenerating(true);
    try {
      const res = await generateInviteApi(activeShop.shopId);
      setGeneratedInvite({ inviteUrl: res.data.inviteUrl, expiresAt: res.data.expiresAt });
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to generate invite');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRemoveStaff() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeStaffApi(activeShop.shopId, removeTarget.userId);
      toast.success('Staff member removed');
      setRemoveTarget(null);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to remove staff');
    } finally {
      setRemoving(false);
    }
  }

  async function handleRevokeInvite() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeInviteApi(activeShop.shopId, revokeTarget._id);
      toast.success('Invite revoked');
      setRevokeTarget(null);
      fetchInvites();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to revoke invite');
    } finally {
      setRevoking(false);
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Staff Management</span>
          </div>
          <h1 className="font-display text-3xl text-[#0F172A]">Your Team</h1>
          <p className="text-[#64748B] mt-1">Manage staff members and invite new ones.</p>
        </div>
        <button
          onClick={handleGenerateInvite}
          disabled={generating}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60 whitespace-nowrap"
        >
          <Link2 size={15} />
          {generating ? 'Generating…' : 'Generate Invite Link'}
        </button>
      </motion.div>

      {/* Current staff */}
      <motion.div variants={fadeInUp}>
        <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
          <Users size={16} className="text-[#64748B]" />
          Current Staff
          <span className="text-xs font-normal text-[#94A3B8] ml-1">({staff.length})</span>
        </h2>

        {staffLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
                  <div className="h-3 w-48 bg-[#F1F5F9] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 flex flex-col items-center text-center">
            <Users size={36} className="text-[#E2E8F0] mb-3" />
            <p className="font-medium text-[#0F172A] mb-1">No staff members yet</p>
            <p className="text-[#64748B] text-sm mb-4">Generate an invite link to add your first team member.</p>
            <button
              onClick={handleGenerateInvite}
              disabled={generating}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white text-sm font-semibold hover:-translate-y-0.5 transition"
            >
              <UserPlus size={14} />
              Generate Invite Link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <motion.div
                key={member.userId}
                variants={fadeInUp}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(member.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A]">{member.name}</p>
                  <p className="text-sm text-[#64748B]">{member.email}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Joined {formatDate(member.joinedAt)}</p>
                </div>
                <button
                  onClick={() => setRemoveTarget(member)}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition flex-shrink-0"
                  title="Remove staff member"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pending invites */}
      <motion.div variants={fadeInUp}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E2E8F0] bg-[#FAFAFA] mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#64748B] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#64748B]">Pending Invites</span>
        </div>

        {invites.length === 0 ? (
          <p className="text-[#94A3B8] text-sm">No pending invites.</p>
        ) : (
          <div className="space-y-3">
            {invites.map((inv) => (
              <div
                key={inv._id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <Link2 size={16} className="text-[#0052FF] flex-shrink-0 hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-[#64748B] truncate">{inv.inviteUrl}</p>
                  <div className="mt-1">
                    <ExpiryBadge hours={inv.hoursRemaining} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={inv.inviteUrl} />
                  <button
                    onClick={() => setRevokeTarget(inv)}
                    className="h-8 px-3 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {generatedInvite && (
        <InviteLinkModal
          inviteUrl={generatedInvite.inviteUrl}
          expiresAt={generatedInvite.expiresAt}
          onClose={() => setGeneratedInvite(null)}
          onDone={() => { setGeneratedInvite(null); fetchInvites(); }}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          title="Remove Staff Member"
          message={`Remove ${removeTarget.name} from ${activeShop.shopName}? They will lose access immediately.`}
          confirmLabel="Remove"
          onConfirm={handleRemoveStaff}
          onCancel={() => setRemoveTarget(null)}
          loading={removing}
        />
      )}

      {revokeTarget && (
        <ConfirmModal
          title="Revoke Invite"
          message="Revoke this invite link? Anyone with this link will no longer be able to use it."
          confirmLabel="Revoke"
          onConfirm={handleRevokeInvite}
          onCancel={() => setRevokeTarget(null)}
          loading={revoking}
        />
      )}
    </motion.div>
  );
}
