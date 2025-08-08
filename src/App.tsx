import React, { useState, useEffect } from 'react';
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
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const tabs = [
    { id: 'browse' as Tab, label: 'Cards', icon: BookOpen },
    { id: 'collection' as Tab, label: 'Collection', icon: Package },
    { id: 'decks' as Tab, label: 'Decks', icon: Layers3 },
  ].filter(tab => !['deck-builder', 'deck-summary'].includes(tab.id));

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10; // Minimum scroll distance to trigger hide/show
      
      // Don't hide/show if we're near the top
      if (currentScrollY < 100) {
        setNavVisible(true);
      } else if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide navbar
          setNavVisible(false);
        } else {
          // Scrolling up - show navbar
          setNavVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

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
          {/* Mobile Header - Full Width */}
          <div className="sm:hidden bg-lorcana-navy shadow-xl border-b-2 border-lorcana-gold">
            <header className="px-4 py-3 text-center">
              <h1 className="text-xl font-bold text-lorcana-gold tracking-wide">
                Lorcana Manager
              </h1>
            </header>
          </div>

          <div className="container mx-auto px-2 sm:px-4 py-0 sm:py-6">
            {/* Desktop Header section */}
            <div className="hidden sm:block bg-lorcana-navy rounded-t-sm shadow-xl border-2 border-lorcana-gold border-b-0">
              <header className="p-6 pb-4">
                <h1 className="text-4xl font-bold text-lorcana-gold mb-2 text-center tracking-wider">
                  Lorcana Collection Manager
                </h1>
                <p className="text-lorcana-cream text-center">
                  Manage your Disney Lorcana TCG collection
                </p>
              </header>

              {/* Desktop Navigation - always visible */}
              {!['deck-builder', 'deck-summary'].includes(activeTab) && (
                <nav className="px-6 pb-3">
                  <div className="flex justify-center">
                    <div className="bg-lorcana-purple/50 backdrop-blur border border-lorcana-gold/50 rounded-sm p-1">
                      <div className="flex space-x-1">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-sm transition-all duration-200 ${
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
                  </div>
                </nav>
              )}
            </div>

            {/* Mobile Navigation - sticky and scroll-responsive */}
            {!['deck-builder', 'deck-summary'].includes(activeTab) && (
              <nav className={`
                sm:hidden fixed bottom-0 left-0 right-0 z-50 
                bg-lorcana-navy/95 backdrop-blur border-t-2 border-lorcana-gold
                transition-transform duration-300 ease-in-out
                ${navVisible ? 'translate-y-0' : 'translate-y-full'}
              `}>
                <div className="px-2 py-2">
                  <div className="flex justify-around space-x-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex flex-col items-center justify-center px-3 py-2 rounded-sm transition-all duration-200 flex-1 ${
                            activeTab === tab.id
                              ? 'bg-lorcana-gold text-lorcana-navy shadow-md'
                              : 'text-lorcana-cream hover:bg-lorcana-purple hover:text-lorcana-gold'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-xs font-medium mt-1 leading-none">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            )}

            <main className="pb-20 sm:pb-0">{renderContent()}</main>
          </div>
        </div>
      </DeckProvider>
    </CollectionProvider>
  );
}

export default App;
