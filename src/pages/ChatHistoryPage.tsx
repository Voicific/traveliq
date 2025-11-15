import React, { useMemo } from 'react';
import { useVeeChat } from '../context/VeeChatContext';

const ChatHistoryPage: React.FC = () => {
  const { messages } = useVeeChat();

  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: typeof messages } = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [messages]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold font-heading text-white">Vee Chat History</h1>
          <p className="mt-2 text-lg text-gray-300">Review past conversations with the TravelIQ AI assistant.</p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/30 rounded-lg border border-cyan-400/10">
            <p className="text-xl text-gray-300">No chat history found.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedMessages.map(([date, msgs]) => (
              <div key={date}>
                <div className="relative text-center">
                  <hr className="border-cyan-400/10" />
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0d2d3d] px-3 text-sm font-semibold text-gray-300">{date}</span>
                </div>
                <div className="mt-8 space-y-4">
                  {msgs.map((msg) => (
                    <div key={msg.timestamp} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">V</div>
                      )}
                      <div className={`p-4 rounded-lg max-w-2xl border ${msg.sender === 'user' ? 'bg-brand-cyan text-white border-transparent' : 'bg-brand-dark border-brand-light/10'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                         {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-cyan-400/20">
                                <p className="text-xs font-semibold text-gray-300 mb-1">Sources:</p>
                                <ul className="text-xs space-y-1">
                                    {msg.sources.map((source, i) => (
                                        <li key={i}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-white hover:underline truncate block" title={source.title}>
                                                {i + 1}. {source.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs mt-2 opacity-70 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                       {msg.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-bold text-brand-dark flex-shrink-0">U</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage;