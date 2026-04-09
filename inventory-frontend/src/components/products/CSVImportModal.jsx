import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { importProducts } from '../../api/product.api.js';
import { useShop } from '../../context/ShopContext.jsx';

const TEMPLATE_HEADERS = 'name,sku,price,costPrice,quantity,reorderThreshold,category';
const TEMPLATE_EXAMPLE = 'Wireless Headphones,WH-1000,99.99,45.00,50,10,Electronics';

function downloadTemplate() {
  const content = `${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE}\n`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CSVImportModal({ onClose, onSuccess }) {
  const { activeShop } = useShop();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  function handleFile(f) {
    if (f && f.name.endsWith('.csv')) setFile(f);
    else toast.error('Please upload a .csv file');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }

  async function handleImport() {
    if (!file) return;
    const fd = new FormData();
    fd.append('csv', file);
    setLoading(true);
    try {
      const res = await importProducts(activeShop.shopId, fd);
      setResult(res.data);
      if (res.data.imported > 0) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-display text-xl text-[#0F172A]">Import Products</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#64748B]" />
              <span className="text-sm text-[#64748B]">CSV format: name, sku, price, costPrice, quantity, reorderThreshold, category</span>
            </div>
            <button
              onClick={downloadTemplate}
              className="text-xs text-[#0052FF] font-semibold ml-3 whitespace-nowrap hover:underline"
            >
              Download template
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer transition ${
              dragging ? 'border-[#0052FF] bg-[#0052FF]/5' : 'border-[#E2E8F0] hover:border-[#0052FF]/40'
            }`}
          >
            <Upload size={28} className="text-[#94A3B8] mb-2" />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-[#0F172A]">{file.name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#64748B]">Drag & drop your CSV here, or click to browse</p>
                <p className="text-xs text-[#94A3B8] mt-1">.csv files only</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#22C55E]">
                <CheckCircle size={16} />
                <span>{result.imported} product{result.imported !== 1 ? 's' : ''} imported</span>
              </div>
              {result.skipped?.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-[#F97316]">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{result.skipped.length} skipped (duplicate SKU)</span>
                    <ul className="text-xs mt-1 text-[#94A3B8] list-disc ml-4">
                      {result.skipped.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                      {result.skipped.length > 3 && <li>…and {result.skipped.length - 3} more</li>}
                    </ul>
                  </div>
                </div>
              )}
              {result.errors?.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-[#EF4444]">
                  <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}</span>
                    <ul className="text-xs mt-1 text-[#94A3B8] list-disc ml-4">
                      {result.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                      {result.errors.length > 3 && <li>…and {result.errors.length - 3} more</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[#E2E8F0] text-[#64748B] font-medium hover:bg-[#F1F5F9] transition"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold hover:-translate-y-0.5 transition disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Importing…' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
