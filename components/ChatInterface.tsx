import React, { useState, useEffect, useRef } from 'react';

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
  chatHistory: { user: string; bot: string }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isDisabled, chatHistory }) => {
  const [message, setMessage] = useState('');
  const historyEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatHistory.length > 0) {
      scrollToBottom();
    }
  }, [chatHistory]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col">
        {chatHistory.length > 0 && (
            <div className="overflow-y-auto mb-4 space-y-4 h-48 pr-2">
                {chatHistory.flatMap((turn, index) => [
                     <div key={`user-${index}`} className="flex justify-end">
                        <p className="bg-blue-600 text-white rounded-2xl rounded-br-lg py-2 px-4 max-w-xs sm:max-w-sm md:max-w-md break-words shadow">
                            {turn.user}
                        </p>
                    </div>,
                    <div key={`bot-${index}`} className="flex justify-start">
                         <p className="bg-slate-200 text-slate-800 rounded-2xl rounded-bl-lg py-2 px-4 max-w-xs sm:max-w-sm md:max-w-md break-words">
                            {turn.bot}
                        </p>
                    </div>
                ])}
                <div ref={historyEndRef} />
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., 'Dhruv had the nachos'"
                disabled={isDisabled}
                className="flex-grow w-full px-4 py-2 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
                type="submit"
                disabled={isDisabled || !message.trim()}
                className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center shadow"
            >
                <SendIcon className="h-5 w-5" />
            </button>
        </form>
    </div>
  );
};

export default ChatInterface;