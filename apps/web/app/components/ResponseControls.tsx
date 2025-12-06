import React, { useState, useEffect } from 'react';

interface ResponseControlsProps {
  selectedWriterType: 'ai' | 'person';
  selectedModel: string;
  selectedPerson: string;
  availablePeople: string[];
  onWriterTypeChange: (type: 'ai' | 'person') => void;
  onModelChange: (model: string) => void;
  onPersonChange: (person: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  availableModels?: { value: string; displayName: string }[];
}

export function ResponseControls({
  selectedWriterType,
  selectedModel,
  selectedPerson,
  availablePeople,
  onWriterTypeChange,
  onModelChange,
  onPersonChange,
  onGenerate,
  isGenerating,
  availableModels
}: ResponseControlsProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);

  useEffect(() => {
    if (selectedPerson === 'new') {
      setIsAddingNewPerson(true);
    } else {
      setIsAddingNewPerson(false);
    }
  }, [selectedPerson]);

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onPersonChange(value);
  };

  const handleNewPersonBlur = () => {
    if (newPersonName.trim()) {
      onPersonChange(newPersonName);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-4">
        {/* Writer Type Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Writer:</label>
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => onWriterTypeChange('ai')}
              className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${selectedWriterType === 'ai'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              AI
            </button>
            <button
              type="button"
              onClick={() => onWriterTypeChange('person')}
              className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${selectedWriterType === 'person'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              Person
            </button>
          </div>
        </div>

        {/* AI Model Selection */}
        {selectedWriterType === 'ai' && (
          <div className="flex items-center gap-2">
            <label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Model:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            >
              {availableModels && availableModels.length > 0 ? (
                availableModels.map(model => (
                  <option key={model.value} value={model.value}>{model.displayName}</option>
                ))
              ) : (
                <>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Person Selection */}
        {selectedWriterType === 'person' && (
          <div className="flex items-center gap-2">
            <label htmlFor="person-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Who:</label>
            <select
              id="person-select"
              value={isAddingNewPerson ? 'new' : selectedPerson}
              onChange={handlePersonChange}
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="me">Me (User)</option>
              {availablePeople.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="new">+ New Person</option>
            </select>
            {isAddingNewPerson && (
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onBlur={handleNewPersonBlur}
                placeholder="Enter name..."
                className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm w-32"
                autoFocus
              />
            )}
          </div>
        )}
      </div>

      {/* Generate Button (Only for AI) */}
      {selectedWriterType === 'ai' && (
        <div className="flex justify-end">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⟳</span> Generating...
              </>
            ) : (
              'Generate Response'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
