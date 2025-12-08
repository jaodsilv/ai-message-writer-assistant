import React, { useRef } from 'react';

interface SidebarProps {
    conversations: string[];
    currentConversationId: string;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onLoadConversation: (file: File) => void;
}

export function Sidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onLoadConversation,
}: SidebarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onLoadConversation(file);
        }
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <aside className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
                <button
                    onClick={onNewConversation}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
                >
                    + New Conversation
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md transition-colors font-medium text-sm"
                >
                    ↑ Load YAML
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".yaml,.yml,.json"
                    className="hidden"
                />
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((id) => (
                    <button
                        key={id}
                        onClick={() => onSelectConversation(id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors truncate text-sm ${currentConversationId === id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                        title={id}
                    >
                        {id}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
