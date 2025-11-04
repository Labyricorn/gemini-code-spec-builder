
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { LoadingSpinner, SendIcon, CheckIcon } from './Icons';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onApprove: () => void;
  isLoading: boolean;
  isApproved: boolean;
  stageName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, onApprove, isLoading, isApproved, stageName }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isApproved) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-white">Refine Document</h3>
        <p className="text-sm text-gray-400">Chat to revise the {stageName} document.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${chat.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{chat.text}</p>
              </div>
            </div>
          ))}
           {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].sender === 'user' && (
            <div className="flex justify-start">
               <div className="bg-gray-700 text-gray-200 rounded-lg px-4 py-2 flex items-center gap-2">
                 <LoadingSpinner className="h-5 w-5" />
                 <span>Generating...</span>
               </div>
            </div>
           )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-700 space-y-4">
        <button
          onClick={onApprove}
          disabled={isApproved || isLoading}
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
            isApproved 
              ? 'bg-green-600 text-white cursor-default' 
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
          }`}
        >
          {isApproved ? <> <CheckIcon className="w-5 h-5"/> Approved </> : `Approve ${stageName} Document`}
        </button>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isApproved ? "Document approved. Proceed to next stage." : "Type your revision request..."}
            disabled={isLoading || isApproved}
            className="flex-grow bg-gray-700 text-gray-200 rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || isApproved || !message.trim()}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 font-semibold hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
           {isLoading ? <LoadingSpinner className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
          </button>
        </form>
      </div>
    </div>
  );
};
