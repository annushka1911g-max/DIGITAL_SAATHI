import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Trash2,
  Bot,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { SpeechSpeaker } from '../components/SpeechSpeaker';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

export const VoiceAssistantPage: React.FC = () => {
  const { language, speakText } = useAccessibility();
  const isHi = language === 'hi';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: isHi
        ? 'नमस्ते! मैं आपका डिजिटल साथी हूँ। आप बोलकर या लिखकर मुझसे कोई भी सवाल पूछ सकते हैं — जैसे सरकारी योजनाओं की जानकारी, बैंक फॉर्म, या कोई भी दैनिक डिजिटल समस्या।'
        : 'Hello! I am your Digital Saathi. You can ask me anything using voice or text — government welfare schemes, bank forms, or any digital task you need help with.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const samplePrompts = isHi
    ? [
        'पीएम किसान सम्मान निधि की अगली किस्त कैसे मिलेगी?',
        'राशन कार्ड में नया सदस्य कैसे जोड़ें?',
        'बिजली बिल ज्यादा आने पर शिकायत कहां करें?',
        'बैंक खाता आधार से लिंक है या नहीं, कैसे पता करें?',
      ]
    : [
        'How can I check PM-Kisan scheme status?',
        'How to add a family member in Ration Card?',
        'How to lodge a complaint about high electricity bill?',
        'How to check if bank account is linked to Aadhaar?',
      ];

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(text, language, conversationId);
      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }
      if (res.suggested_actions && res.suggested_actions.length > 0) {
        setSuggestedActions(res.suggested_actions);
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak reply aloud if desired
      speakText(res.reply);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: isHi
          ? 'माफ़ कीजिए, उत्तर प्राप्त करने में समस्या आई। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
          : 'Sorry, I encountered an issue retrieving the answer. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript);
    handleSendMessage(transcript);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        content: isHi
          ? 'बातचीत पुनः शुरू हो गई है। आप क्या पूछना चाहते हैं?'
          : 'Chat has been reset. What would you like to ask?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setConversationId(undefined);
    setSuggestedActions([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
            <Mic size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isHi ? 'वॉइस साथी — बोलकर बात करें' : 'Voice Saathi — Conversational Assistant'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'हिंदी या English में बोलें या लिखें' : 'Speak or type naturally in Hindi or English'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          title={isHi ? 'चैट साफ़ करें' : 'Clear Chat'}
        >
          <Trash2 size={14} />
          <span>{isHi ? 'नई बातचीत' : 'Reset'}</span>
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs space-y-2 ${
                  isBot
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    : 'bg-[#0F2C59] text-white'
                }`}
              >
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>

                <div
                  className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                    isBot
                      ? 'border-slate-100 dark:border-slate-700 text-slate-400'
                      : 'border-blue-800 text-blue-200'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <SpeechSpeaker
                      text={msg.content}
                      size="sm"
                      className="ml-2 bg-transparent border-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                    />
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <UserIcon size={18} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-white flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2 shadow-xs">
              <Loader2 size={16} className="animate-spin text-[#0F2C59] dark:text-blue-400" />
              <span>{isHi ? 'डिजिटल साथी विचार कर रहा है...' : 'Digital Saathi is thinking...'}</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Follow-ups / Sample Prompts */}
      <div className="py-2 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {(suggestedActions.length > 0 ? suggestedActions : samplePrompts).map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-xs transition-colors"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-md border border-slate-200 dark:border-slate-700 mt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Big Accessible Voice Mic Button */}
          <VoiceInputButton onTranscript={handleVoiceTranscript} size="md" />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isHi
                ? 'बोलने के लिए माइक दबाएं या यहाँ लिखें...'
                : 'Click mic to speak or type your question here...'
            }
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            aria-label={isHi ? 'भेजें' : 'Send'}
            className="bg-[#0F2C59] hover:bg-[#1E4E8C] disabled:opacity-40 text-white p-3 rounded-xl shadow-md transition-colors focus:ring-2 focus:ring-blue-400"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
