import React, { useState, useMemo } from 'react';
import { Minus, Trash2, Search, FileText } from 'lucide-react';
import { Deck, LorcanaCard } from '../types';
import { allCards, colors } from '../data/allCards';

const DeckBuilder: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: '1',
      name: 'Ruby/Sapphire Control',
      description: 'A control deck focusing on Ruby and Sapphire characters',
      cards: [
        { ...allCards[0], quantity: 2 },
        { ...allCards[1], quantity: 1 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(decks[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const filteredCards = useMemo(() => {
    return allCards.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.version?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  }, [searchTerm]);

  const createNewDeck = () => {
    if (!newDeckName.trim()) return;
    
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      description: '',
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDecks(prev => [...prev, newDeck]);
    setActiveDeck(newDeck);
    setNewDeckName('');
    setShowNewDeckForm(false);
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    if (activeDeck?.id === deckId) {
      const remaining = decks.filter(d => d.id !== deckId);
      setActiveDeck(remaining[0] || null);
    }
  };

  const addCardToDeck = (card: LorcanaCard) => {
    if (!activeDeck) return;

    const existingCard = activeDeck.cards.find(c => c.id === card.id);
    const currentQuantity = existingCard?.quantity || 0;
    
    if (currentQuantity >= 4) return; // Lorcana deck limit

    const updatedDeck: Deck = {
      ...activeDeck,
      cards: existingCard
        ? activeDeck.cards.map(c =>
            c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        : [...activeDeck.cards, { ...card, quantity: 1 }],
      updatedAt: new Date(),
    };

    setActiveDeck(updatedDeck);
    setDecks(prev => prev.map(d => d.id === activeDeck.id ? updatedDeck : d));
  };

  const removeCardFromDeck = (cardId: number) => {
    if (!activeDeck) return;

    const updatedDeck: Deck = {
      ...activeDeck,
      cards: activeDeck.cards
        .map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c)
        .filter(c => c.quantity > 0),
      updatedAt: new Date(),
    };

    setActiveDeck(updatedDeck);
    setDecks(prev => prev.map(d => d.id === activeDeck.id ? updatedDeck : d));
  };

  const getTotalCards = (deck: Deck) => {
    return deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  };

  const getInkDistribution = (deck: Deck) => {
    const distribution: Record<string, number> = {};
    colors.forEach(color => {
      distribution[color] = deck.cards
        .filter(card => card.color === color)
        .reduce((sum, card) => sum + card.quantity, 0);
    });
    return distribution;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600';
      case 'Uncommon': return 'text-green-600';
      case 'Rare': return 'text-blue-600';
      case 'Super Rare': return 'text-purple-600';
      case 'Legendary': return 'text-orange-600';
      case 'Enchanted': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getInkColorBg = (color: string) => {
    switch (color) {
      case 'Amber': return 'bg-yellow-100 text-yellow-800';
      case 'Amethyst': return 'bg-purple-100 text-purple-800';
      case 'Emerald': return 'bg-green-100 text-green-800';
      case 'Ruby': return 'bg-red-100 text-red-800';
      case 'Sapphire': return 'bg-blue-100 text-blue-800';
      case 'Steel': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Deck Builder</h2>
          <div className="flex gap-2">
            <select
              value={activeDeck?.id || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.id === e.target.value);
                setActiveDeck(deck || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a deck</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({getTotalCards(deck)} cards)
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNewDeckForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Deck
            </button>
          </div>
        </div>

        {showNewDeckForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Deck name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && createNewDeck()}
              />
              <button
                onClick={createNewDeck}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewDeckForm(false);
                  setNewDeckName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {activeDeck ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Cards</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredCards.map((card) => {
                  const inDeck = activeDeck.cards.find(c => c.id === card.id);
                  const quantity = inDeck?.quantity || 0;
                  const canAdd = quantity < 4;
                  
                  return (
                    <div key={card.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{card.name}</h4>
                        <span className="text-lg font-bold text-blue-600">{card.cost}</span>
                      </div>
                      {card.version && (
                        <p className="text-gray-600 text-sm mb-2">{card.version}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getInkColorBg(card.color)}`}>
                          {card.color}
                        </span>
                        <span className={`text-xs ${getRarityColor(card.rarity)}`}>
                          {card.rarity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          In deck: {quantity}/4
                        </span>
                        <button
                          onClick={() => addCardToDeck(card)}
                          disabled={!canAdd}
                          className={`px-3 py-1 rounded text-sm ${
                            canAdd
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          } transition-colors`}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{activeDeck.name}</h3>
                <button
                  onClick={() => deleteDeck(activeDeck.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-4">
                {getTotalCards(activeDeck)} / 60 cards
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Ink Distribution</h4>
                <div className="space-y-1">
                  {Object.entries(getInkDistribution(activeDeck)).map(([color, count]) => (
                    count > 0 && (
                      <div key={color} className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs ${getInkColorBg(color)}`}>
                          {color}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Cards in Deck</h4>
                {activeDeck.cards.length === 0 ? (
                  <p className="text-gray-500 text-sm">No cards in deck</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeDeck.cards.map((card) => (
                      <div key={card.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{card.name}</div>
                          <div className="text-xs text-gray-600">{card.cost} cost • {card.color}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{card.quantity}</span>
                          <button
                            onClick={() => removeCardFromDeck(card.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No deck selected</h3>
          <p className="text-gray-600 mb-6">Create a new deck or select an existing one to start building.</p>
          <button
            onClick={() => setShowNewDeckForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Deck
          </button>
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;