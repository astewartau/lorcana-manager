import React, { useState } from 'react';
import { Plus, Upload, FileText } from 'lucide-react';
import { useDeck } from '../contexts/DeckContext';
import { useAuth } from '../contexts/AuthContext';
import DeckBox3D from './DeckBox3D';
import AuthRequired from './AuthRequired';

interface MyDecksProps {
  onBuildDeck: (deckId?: string) => void;
  onViewDeck: (deckId: string) => void;
}

const MyDecks: React.FC<MyDecksProps> = ({ onBuildDeck, onViewDeck }) => {
  const { user } = useAuth();
  const { decks, createDeck, deleteDeck, duplicateDeck, getDeckSummary, exportDeck, importDeck, setCurrentDeck } = useDeck();
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

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

  // Show auth required if not signed in
  if (!user) {
    return (
      <AuthRequired 
        feature="decks" 
        onSignIn={() => {
          // Open login modal - need to pass this from App.tsx
          const signInButton = document.querySelector('[data-sign-in-button]') as HTMLButtonElement;
          if (signInButton) signInButton.click();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-lorcana p-6 art-deco-corner">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-lorcana-ink mb-2">My Decks</h2>
            <p className="text-lorcana-navy">Build, manage, and organize your Lorcana decks</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={handleImportDeck}
              className="btn-lorcana-outline flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Import</span>
            </button>
            <button
              onClick={() => setShowNewDeckForm(true)}
              className="btn-lorcana-navy flex items-center space-x-2 px-6 py-2"
            >
              <Plus size={20} />
              <span>Build New Deck</span>
            </button>
          </div>
        </div>

        {showNewDeckForm && (
          <div className="mb-6 p-4 bg-lorcana-cream border-2 border-lorcana-gold rounded-sm">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Deck name (required)"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDeck()}
              />
              <textarea
                placeholder="Deck description (optional)"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                className="w-full px-3 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                  className="btn-lorcana px-4 py-2 disabled:bg-gray-400 disabled:text-gray-600"
                >
                  Create & Build
                </button>
                <button
                  onClick={() => {
                    setShowNewDeckForm(false);
                    setNewDeckName('');
                    setNewDeckDescription('');
                  }}
                  className="btn-lorcana-outline px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {decks.length === 0 ? (
        <div className="card-lorcana p-12 text-center art-deco-corner">
          <FileText size={48} className="mx-auto text-lorcana-gold mb-4" />
          <h3 className="text-xl font-semibold text-lorcana-ink mb-2">No decks yet</h3>
          <p className="text-lorcana-navy mb-6">Start building your first Lorcana deck!</p>
          <button
            onClick={() => setShowNewDeckForm(true)}
            className="btn-lorcana-navy px-6 py-3"
          >
            Build Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {decks.map((deck) => {
            const summary = getDeckSummary(deck.id);
            if (!summary) return null;
            
            return (
              <div key={deck.id} className="group">
                <DeckBox3D
                  deck={deck}
                  summary={summary}
                  onView={(deckId) => {
                    const targetDeck = decks.find(d => d.id === deckId);
                    if (targetDeck) {
                      setCurrentDeck(targetDeck);
                    }
                    onViewDeck(deckId);
                  }}
                  onEdit={(deckId) => {
                    const targetDeck = decks.find(d => d.id === deckId);
                    if (targetDeck) {
                      setCurrentDeck(targetDeck);
                    }
                    onBuildDeck(deckId);
                  }}
                  onDuplicate={duplicateDeck}
                  onDelete={deleteDeck}
                  onExport={handleExportDeck}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDecks;