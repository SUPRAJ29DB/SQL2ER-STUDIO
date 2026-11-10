import React, { useState } from 'react';
import { Sparkles, MessageSquare, Lightbulb, Link2, X, Send } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { RelationshipExplainer } from './RelationshipExplainer';
import { SuggestionPanel } from './SuggestionPanel';
import { diagramApi } from '../../services/diagramApi';
import { Loader } from '../common/Loader';

export const AIAssistant = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    selectedRelationship,
    schemaDefinition,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('suggestions'); // explainer, suggestions, chat
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I am your SQL2ER AI Assistant. I can explain relationships, diagnose missing foreign keys, or help optimize your relational schema.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isAIAssistantOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const res = await diagramApi.sendAIChat(userText, schemaDefinition);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Sorry, I encountered an error: ${err.message}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="w-80 h-full bg-[#0b1120] border-l border-slate-800 flex flex-col z-30 select-none shadow-2xl animate-fadeIn">
      {/* Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI Intelligence</span>
        </div>
        <button
          onClick={() => setIsAIAssistantOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'suggestions'
              ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Audit
        </button>
        <button
          onClick={() => setActiveTab('explainer')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'explainer'
              ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Relate
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 text-center transition-colors border-b-2 ${
            activeTab === 'chat'
              ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'suggestions' && <SuggestionPanel />}
        {activeTab === 'explainer' && (
          <RelationshipExplainer relationship={selectedRelationship} />
        )}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 mr-6'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isSending && <Loader message="Generating response..." size="sm" />}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask about your schema or SQL..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
};

