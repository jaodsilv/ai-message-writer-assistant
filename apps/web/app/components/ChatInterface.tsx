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
  onEditMessage: (message: Message, newContent: string, sender?: string, recipients?: string[]) => void;
  onDeleteMessage: (message: Message) => void;
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
  availableModels,
  onEditMessage,
  onDeleteMessage
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [selectedWriterType, setSelectedWriterType] = useState<'ai' | 'person'>('ai');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('me');
  const [showParseModal, setShowParseModal] = useState(false);
  const [parseText, setParseText] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string; sender: string; recipients: string[] } | null>(null);

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

  const startEditing = (index: number, message: Message) => {
    setEditingMessage({
      index,
      content: message.content,
      sender: message.sender || '',
      recipients: message.recipients || []
    });
  };

  const saveEdit = (message: Message) => {
    if (editingMessage && editingMessage.content.trim()) {
      onEditMessage(
        message,
        editingMessage.content,
        editingMessage.sender || undefined,
        editingMessage.recipients.length > 0 ? editingMessage.recipients : undefined
      );
      setEditingMessage(null);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
  };

  const addRecipient = () => {
    if (editingMessage) {
      setEditingMessage({
        ...editingMessage,
        recipients: [...editingMessage.recipients, '']
      });
    }
  };

  const updateRecipient = (index: number, value: string) => {
    if (editingMessage) {
      const newRecipients = [...editingMessage.recipients];
      newRecipients[index] = value;
      setEditingMessage({
        ...editingMessage,
        recipients: newRecipients
      });
    }
  };

  const removeRecipient = (index: number) => {
    if (editingMessage) {
      const newRecipients = [...editingMessage.recipients];
      newRecipients.splice(index, 1);
      setEditingMessage({
        ...editingMessage,
        recipients: newRecipients
      });
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
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg shadow-sm relative ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {editingMessage?.index === index ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Content</label>
                      <textarea
                        value={editingMessage.content}
                        onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                        className="w-full p-2 text-gray-900 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sender</label>
                      <input
                        type="text"
                        value={editingMessage.sender}
                        onChange={(e) => setEditingMessage({ ...editingMessage, sender: e.target.value })}
                        placeholder="e.g., john@example.com or John Doe"
                        className="w-full p-2 text-gray-900 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipients</label>
                        <button
                          onClick={addRecipient}
                          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          type="button"
                        >
                          + Add Recipient
                        </button>
                      </div>
                      {editingMessage.recipients.map((recipient, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={recipient}
                            onChange={(e) => updateRecipient(idx, e.target.value)}
                            placeholder="e.g., jane@example.com or Jane Doe"
                            className="flex-1 p-2 text-gray-900 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            onClick={() => removeRecipient(idx)}
                            className="px-2 py-1 text-sm text-red-600 hover:text-red-700 bg-red-50 rounded hover:bg-red-100"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {editingMessage.recipients.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No recipients added</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(msg)}
                        className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                        title="Save Edit"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap leading-relaxed text-lg">{msg.content}</p>
                    <div className={`absolute top-2 ${msg.role === 'user' ? 'left-2' : 'right-2'} flex gap-1`}>
                      <button
                        onClick={() => startEditing(index, msg)}
                        className={`p-1 rounded ${msg.role === 'user' ? 'text-white hover:bg-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="Edit Message"
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteMessage(msg)}
                        className={`p-1 rounded ${msg.role === 'user' ? 'text-white hover:bg-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
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
