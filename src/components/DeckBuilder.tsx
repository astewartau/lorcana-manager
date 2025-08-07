import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Grid, List, Filter, Save } from 'lucide-react';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards, sets } from '../data/allCards';
import { useDeck } from '../contexts/DeckContext';
import { useCollection } from '../contexts/CollectionContext';
import FilterPanel from './shared/FilterPanel';
import { filterCards, sortCards, countActiveFilters } from '../utils/cardFiltering';
import { getDefaultFilters } from '../utils/filterDefaults';
import DeckPanel from './deck/DeckPanel';
import DeckBuilderCardGrid from './deck/DeckBuilderCardGrid';
import DeckBuilderCardList from './deck/DeckBuilderCardList';
import QuickFilters from './QuickFilters';
import { RARITY_ICONS, COLOR_ICONS } from '../constants/icons';

interface DeckBuilderProps {
  onBack: () => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ onBack }) => {
  const { currentDeck, updateDeck, addCardToDeck, removeCardFromDeck, updateCardQuantity, validateDeck } = useDeck();
  const { getVariantQuantities, getCardQuantity } = useCollection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [deckName, setDeckName] = useState(currentDeck?.name || '');

  const [filters, setFilters] = useState<FilterOptions>(getDefaultFilters());


  // Update deck name in state when current deck changes
  useEffect(() => {
    if (currentDeck) {
      setDeckName(currentDeck.name);
    }
  }, [currentDeck]);

  // Get card quantity in current deck
  const getCardQuantityInDeck = (cardId: number): number => {
    if (!currentDeck) return 0;
    const deckCard = currentDeck.cards.find(c => c.id === cardId);
    return deckCard?.quantity || 0;
  };

  // Filter and sort cards
  const { sortedCards, activeFiltersCount } = useMemo(() => {
    const filtered = filterCards(consolidatedCards, searchTerm, filters, new Set(), getVariantQuantities, getCardQuantity);
    const sorted = sortCards(filtered, sortBy);
    const activeCount = countActiveFilters(filters);
    
    return {
      sortedCards: sorted,
      activeFiltersCount: activeCount
    };
  }, [searchTerm, filters, sortBy, getVariantQuantities, getCardQuantity]);

  const clearAllFilters = () => {
    setFilters(getDefaultFilters());
    setSearchTerm('');
  };

  const handleAddCard = (card: ConsolidatedCard) => {
    addCardToDeck(card.baseCard);
  };

  const handleRemoveCard = (cardId: number) => {
    removeCardFromDeck(cardId);
  };

  const canAddCard = (deckQuantity: number): boolean => {
    if (!currentDeck) return false;
    const totalCards = currentDeck.cards.reduce((sum, c) => sum + c.quantity, 0);
    return deckQuantity < 4 && totalCards < 60;
  };

  // Get total collection quantity for a card (all variants combined)
  const getCollectionQuantity = (consolidatedCard: ConsolidatedCard): number => {
    const variantQuantities = getVariantQuantities(consolidatedCard.fullName);
    const legacyQuantity = getCardQuantity(consolidatedCard.baseCard.id);
    return variantQuantities.regular + variantQuantities.foil + variantQuantities.enchanted + variantQuantities.special + legacyQuantity;
  };

  const handleUpdateName = () => {
    if (currentDeck && deckName.trim() !== currentDeck.name) {
      updateDeck({
        ...currentDeck,
        name: deckName.trim(),
        updatedAt: new Date()
      });
    }
  };

  const handleSave = () => {
    if (currentDeck) {
      handleUpdateName();
      // Could add additional save logic here
    }
  };

  const clearDeck = () => {
    if (currentDeck) {
      updateDeck({
        ...currentDeck,
        cards: [],
        updatedAt: new Date()
      });
    }
  };

  if (!currentDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No deck selected</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Decks
          </button>
        </div>
      </div>
    );
  }

  const validation = validateDeck(currentDeck);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to My Decks</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
                className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                placeholder="Deck Name"
              />
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Cards Panel */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-t-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search cards by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={`${sortBy.field}-${sortBy.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortBy({ field: field as any, direction: direction as 'asc' | 'desc' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="cost-asc">Cost Low-High</option>
                    <option value="cost-desc">Cost High-Low</option>
                    <option value="rarity-asc">Rarity Low-High</option>
                    <option value="rarity-desc">Rarity High-Low</option>
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center space-x-2 ${
                      activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <Filter size={20} />
                    {activeFiltersCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <QuickFilters
              filters={filters}
              setFilters={setFilters}
              colorIconMap={COLOR_ICONS}
              rarityIconMap={RARITY_ICONS}
            />

            {showFilters && (
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                activeFiltersCount={activeFiltersCount}
                onClearAllFilters={clearAllFilters}
                onClose={() => setShowFilters(false)}
                rarityIconMap={RARITY_ICONS}
                colorIconMap={COLOR_ICONS}
                showCollectionFilters={true}
              />
            )}

            {/* Cards Display */}
            {viewMode === 'grid' ? (
              <DeckBuilderCardGrid
                cards={sortedCards}
                getCardQuantityInDeck={getCardQuantityInDeck}
                getCollectionQuantity={getCollectionQuantity}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                canAddCard={canAddCard}
              />
            ) : (
              <DeckBuilderCardList
                cards={sortedCards}
                getCardQuantityInDeck={getCardQuantityInDeck}
                getCollectionQuantity={getCollectionQuantity}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                canAddCard={canAddCard}
                colorIconMap={COLOR_ICONS}
                rarityIconMap={RARITY_ICONS}
                sets={sets}
              />
            )}
          </div>

          {/* Deck Panel */}
          <DeckPanel
            deck={currentDeck}
            onRemoveCard={handleRemoveCard}
            onUpdateQuantity={updateCardQuantity}
            onClearDeck={clearDeck}
            validation={validation}
          />
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;