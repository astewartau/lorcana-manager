import React, { useState } from 'react';
import { BookOpen, Package, Layers3 } from 'lucide-react';
import CardBrowser from './components/CardBrowser';
import Collection from './components/Collection';
import MyDecks from './components/MyDecks';
import DeckBuilder from './components/DeckBuilder';
import { CollectionProvider } from './contexts/CollectionContext';
import { DeckProvider } from './contexts/DeckContext';

type Tab = 'browse' | 'collection' | 'decks' | 'deck-builder';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  const tabs = [
    { id: 'browse' as Tab, label: 'Browse Cards', icon: BookOpen },
    { id: 'collection' as Tab, label: 'My Collection', icon: Package },
    { id: 'decks' as Tab, label: 'My Decks', icon: Layers3 },
  ].filter(tab => tab.id !== 'deck-builder');

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <CardBrowser />;
      case 'collection':
        return <Collection />;
      case 'decks':
        return <MyDecks onBuildDeck={() => setActiveTab('deck-builder')} />;
      case 'deck-builder':
        return <DeckBuilder onBack={() => setActiveTab('decks')} />;
      default:
        return <CardBrowser />;
    }
  };

  return (
    <CollectionProvider>
      <DeckProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-6">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                Lorcana Collection Manager
              </h1>
              <p className="text-gray-600 text-center">
                Manage your Disney Lorcana TCG collection
              </p>
            </header>

            {activeTab !== 'deck-builder' && (
              <nav className="mb-8">
                <div className="flex justify-center">
                  <div className="bg-white rounded-lg shadow-md p-1 flex space-x-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-lorcana-blue text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

            <main>{renderContent()}</main>
          </div>
        </div>
      </DeckProvider>
    </CollectionProvider>
  );
}

export default App;
