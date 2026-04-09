export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-[#E2E8F0]">
        <h3 className="font-display text-xl text-[#0F172A] mb-2">{title}</h3>
        <p className="text-[#64748B] text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-sm font-medium text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
