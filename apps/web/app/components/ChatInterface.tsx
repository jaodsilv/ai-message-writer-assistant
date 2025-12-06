import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../agents/ModelInterface';
import { Sidebar } from './Sidebar';
import { MetadataPanel } from './MetadataPanel';
import { ResponseControls } from './ResponseControls';
import { Archive, Trash2, Undo, FileText, Eye, EyeOff } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  conversations: string[];
  currentConversationId: string;
  context: string[];
  jobDescription: string;
  availablePeople: string[];
  onSendMessage: (content: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onLoadConversation: (file: File) => void;
  onUpdateMetadata: (context: string[], jobDescription: string) => void;
  onGenerateResponse: (writerType: 'ai' | 'person', writerName: string, model?: string) => void;
  isLoading: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onParseMessage: (text: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  canUndo: boolean;
  availableModels?: { value: string; displayName: string }[];
}

export function ChatInterface({
  messages,
  conversations,
  currentConversationId,
  context,
  jobDescription,
  availablePeople,
  onSendMessage,
  onSelectConversation,
  onNewConversation,
  onLoadConversation,
  onUpdateMetadata,
  onGenerateResponse,
  isLoading,
  onArchive,
  onRestore,
  onDelete,
  onUndo,
  onParseMessage,
  showArchived,
  onToggleArchived,
  canUndo,
  availableModels
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [selectedWriterType, setSelectedWriterType] = useState<'ai' | 'person'>('ai');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [selectedPerson, setSelectedPerson] = useState('me');
  const [showParseModal, setShowParseModal] = useState(false);
  const [parseText, setParseText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleGenerate = () => {
    const writerName = selectedWriterType === 'ai' ? 'Assistant' : selectedPerson;
    onGenerateResponse(selectedWriterType, writerName, selectedModel);
  };

  const handleParseSubmit = () => {
    if (parseText.trim()) {
      onParseMessage(parseText);
      setParseText('');
      setShowParseModal(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onNewConversation={onNewConversation}
        onLoadConversation={onLoadConversation}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate max-w-md">
            {currentConversationId}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParseModal(true)}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Parse Message"
            >
              <FileText size={20} />
            </button>
            <button
              onClick={onToggleArchived}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title={showArchived ? "Hide Archived" : "Show Archived"}
            >
              {showArchived ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {canUndo && (
              <button
                onClick={onUndo}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Undo"
              >
                <Undo size={20} />
              </button>
            )}
            {showArchived ? (
              <button
                onClick={onRestore}
                className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                title="Restore"
              >
                <Undo size={20} className="rotate-180" /> {/* Reuse Undo icon rotated or use another icon */}
              </button>
            ) : (
              <button
                onClick={onArchive}
                className="p-2 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                title="Archive"
              >
                <Archive size={20} />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <ResponseControls
          selectedWriterType={selectedWriterType}
          selectedModel={selectedModel}
          selectedPerson={selectedPerson}
          availablePeople={availablePeople}
          onWriterTypeChange={setSelectedWriterType}
          onModelChange={setSelectedModel}
          onPersonChange={setSelectedPerson}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
          availableModels={availableModels}
        />

        {selectedWriterType === 'person' && selectedPerson === 'me' && (
          <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
              <label htmlFor="message-input" className="sr-only">Type your message</label>
              <input
                id="message-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-colors text-lg"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Send
              </button>
            </form>
          </footer>
        )}

        {/* Parse Modal */}
        {showParseModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Parse Message</h2>
              <textarea
                value={parseText}
                onChange={(e) => setParseText(e.target.value)}
                placeholder="Paste LinkedIn or Email message here..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-transparent dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowParseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Parse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MetadataPanel
        context={context}
        jobDescription={jobDescription}
        onUpdate={onUpdateMetadata}
      />
    </div>
  );
}
