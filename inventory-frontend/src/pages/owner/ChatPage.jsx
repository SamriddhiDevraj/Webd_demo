import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendMessage, getChatHistory, clearChatHistory } from '../../api/ai.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { timeAgo } from '../../utils/formatDate.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const EXAMPLE_QUERIES = [
  'What was my best selling product last month?',
  'How much revenue did I make this week?',
  'Which products haven\'t sold in 30 days?',
  'What\'s my total inventory value?',
  'How many sales did I make today?',
];

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function UserBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white">
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-white/60 mt-1 text-right">{timeAgo(message.createdAt)}</p>
      </div>
    </div>
  );
}

function AssistantBubble({ message }) {
  return (
    <div className="flex justify-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-[#E2E8F0] shadow-sm">
        <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-[#94A3B8] mt-1">{timeAgo(message.createdAt)}</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { activeShop } = useShop();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    getChatHistory(activeShop.shopId)
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [activeShop.shopId]);

  useEffect(() => {
    if (!historyLoading) scrollToBottom();
  }, [messages, isLoading, historyLoading, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMsg, createdAt: new Date() }]);
    setIsLoading(true);

    try {
      const res = await sendMessage(activeShop.shopId, userMsg);
      setMessages(res.data.updatedHistory);
    } catch (err) {
      toast.error('Failed to get response. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, activeShop.shopId]);

  async function handleClearConfirm() {
    setClearing(true);
    try {
      await clearChatHistory(activeShop.shopId);
      setMessages([]);
      setShowClearModal(false);
      toast.success('Chat history cleared');
    } catch {
      toast.error('Failed to clear chat history');
    } finally {
      setClearing(false);
    }
  }

  const isEmpty = !historyLoading && messages.length === 0;

  return (
    <div className="flex flex-col h-full -m-6 lg:-m-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">AI Assistant</span>
          </div>
          <h1 className="font-display text-xl text-[#0F172A]">Business Chat</h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-red-500 transition"
            title="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#FAFAFA]">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-4 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
          </div>
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">AI Assistant</span>
            </div>

            <div className="text-center">
              <h2 className="font-display text-2xl text-[#0F172A]">Ask me anything</h2>
              <p className="text-[#64748B] mt-2 text-sm">
                I can answer questions about your inventory and sales data
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center max-w-lg">
              {EXAMPLE_QUERIES.map((query) => (
                <button
                  key={query}
                  onClick={() => { setInput(query); inputRef.current?.focus(); }}
                  className="px-4 py-2 rounded-full border border-[#E2E8F0] bg-white text-sm text-[#64748B] hover:border-[#0052FF]/30 hover:text-[#0F172A] transition-all duration-200"
                >
                  {query}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble key={i} message={msg} />
              : <AssistantBubble key={i} message={msg} />
          )
        )}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#E2E8F0] bg-white p-4 flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your inventory, sales, or products…"
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#0F172A] placeholder-[#94A3B8]/70 outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-12 px-5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

      {showClearModal && (
        <ConfirmModal
          title="Clear Chat History"
          message="Clear all chat history? This cannot be undone."
          confirmLabel="Clear History"
          onConfirm={handleClearConfirm}
          onCancel={() => setShowClearModal(false)}
          loading={clearing}
        />
      )}
    </div>
  );
}
