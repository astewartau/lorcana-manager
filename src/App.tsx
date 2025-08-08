import React, { useState } from 'react';
import { BookOpen, Package, Layers3 } from 'lucide-react';
import CardBrowser from './components/CardBrowser';
import Collection from './components/Collection';
import MyDecks from './components/MyDecks';
import DeckBuilder from './components/DeckBuilder';
import DeckSummary from './components/DeckSummary';
import { CollectionProvider } from './contexts/CollectionContext';
import { DeckProvider } from './contexts/DeckContext';

type Tab = 'browse' | 'collection' | 'decks' | 'deck-builder' | 'deck-summary';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  const tabs = [
    { id: 'browse' as Tab, label: 'Browse Cards', icon: BookOpen },
    { id: 'collection' as Tab, label: 'My Collection', icon: Package },
    { id: 'decks' as Tab, label: 'My Decks', icon: Layers3 },
  ].filter(tab => !['deck-builder', 'deck-summary'].includes(tab.id));

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <CardBrowser />;
      case 'collection':
        return <Collection />;
      case 'decks':
        return <MyDecks 
          onBuildDeck={() => setActiveTab('deck-builder')} 
          onViewDeck={() => setActiveTab('deck-summary')} 
        />;
      case 'deck-builder':
        return <DeckBuilder 
          onBack={() => setActiveTab('decks')} 
          onViewDeck={() => setActiveTab('deck-summary')}
        />;
      case 'deck-summary':
        return <DeckSummary 
          onBack={() => setActiveTab('decks')} 
          onEditDeck={() => setActiveTab('deck-builder')} 
        />;
      default:
        return <CardBrowser />;
    }
  };

  return (
    <CollectionProvider>
      <DeckProvider>
        <div className="min-h-screen bg-lorcana-cream">
          <div className="container mx-auto px-4 py-6">
            {/* Unified header section */}
            <div className="bg-lorcana-navy rounded-t-sm shadow-xl border-2 border-lorcana-gold border-b-0">
              <header className="p-6 pb-4">
                <h1 className="text-4xl font-bold text-lorcana-gold mb-2 text-center tracking-wider">
                  Lorcana Collection Manager
                </h1>
                <p className="text-lorcana-cream text-center">
                  Manage your Disney Lorcana TCG collection
                </p>
              </header>

              {!['deck-builder', 'deck-summary'].includes(activeTab) && (
                <nav className="px-6 pb-3">
                  <div className="flex justify-center">
                    <div className="bg-lorcana-purple/50 backdrop-blur border border-lorcana-gold/50 rounded-sm p-1 flex space-x-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-sm transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-lorcana-gold text-lorcana-navy shadow-md'
                              : 'text-lorcana-cream hover:bg-lorcana-purple hover:text-lorcana-gold'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </nav>
              )}
            </div>

            <main>{renderContent()}</main>
          </div>
        </div>
      </DeckProvider>
    </CollectionProvider>
  );
}

export default App;
