import React, { useState } from 'react';
import { Plus, Edit3, Copy, Trash2, Search, Download, Upload, FileText } from 'lucide-react';
import { useDeck } from '../contexts/DeckContext';

interface MyDecksProps {
  onBuildDeck: (deckId?: string) => void;
}

const MyDecks: React.FC<MyDecksProps> = ({ onBuildDeck }) => {
  const { decks, createDeck, deleteDeck, duplicateDeck, getDeckSummary, exportDeck, importDeck } = useDeck();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deck.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    const deckId = createDeck(newDeckName.trim(), newDeckDescription.trim() || undefined);
    setNewDeckName('');
    setNewDeckDescription('');
    setShowNewDeckForm(false);
    onBuildDeck(deckId);
  };

  const handleExportDeck = (deckId: string) => {
    const deckData = exportDeck(deckId);
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const blob = new Blob([deckData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDeck = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importDeck(content)) {
          // Handle successful import
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getInkColorBg = (color: string) => {
    switch (color) {
      case 'Amber': return 'bg-yellow-400';
      case 'Amethyst': return 'bg-purple-400';
      case 'Emerald': return 'bg-green-400';
      case 'Ruby': return 'bg-red-400';
      case 'Sapphire': return 'bg-blue-400';
      case 'Steel': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Decks</h2>
            <p className="text-gray-600">Build, manage, and organize your Lorcana decks</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={handleImportDeck}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Import</span>
            </button>
            <button
              onClick={() => setShowNewDeckForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Build New Deck</span>
            </button>
          </div>
        </div>

        {showNewDeckForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Deck name (required)"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDeck()}
              />
              <textarea
                placeholder="Deck description (optional)"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  Create & Build
                </button>
                <button
                  onClick={() => {
                    setShowNewDeckForm(false);
                    setNewDeckName('');
                    setNewDeckDescription('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {decks.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search decks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {decks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No decks yet</h3>
          <p className="text-gray-600 mb-6">Start building your first Lorcana deck!</p>
          <button
            onClick={() => setShowNewDeckForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Build Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => {
            const summary = getDeckSummary(deck.id);
            if (!summary) return null;
            
            const inkColors = Object.entries(summary.inkDistribution)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a);

            return (
              <div key={deck.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{deck.name}</h3>
                      {deck.description && (
                        <p className="text-sm text-gray-600 mb-2">{deck.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {summary.isValid ? (
                        <div className="w-3 h-3 bg-green-400 rounded-full" title="Valid deck" />
                      ) : (
                        <div className="w-3 h-3 bg-red-400 rounded-full" title="Invalid deck" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Cards: {summary.cardCount}/60
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(summary.updatedAt)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          summary.cardCount === 60 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((summary.cardCount / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {inkColors.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Ink Colors:</span>
                      <div className="flex items-center space-x-2">
                        {inkColors.slice(0, 3).map(([color, count]) => (
                          <div key={color} className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-full ${getInkColorBg(color)}`} />
                            <span className="text-xs text-gray-600">{count}</span>
                          </div>
                        ))}
                        {inkColors.length > 3 && (
                          <span className="text-xs text-gray-500">+{inkColors.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onBuildDeck(deck.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit deck"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => duplicateDeck(deck.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Duplicate deck"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleExportDeck(deck.id)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Export deck"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteDeck(deck.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDecks;