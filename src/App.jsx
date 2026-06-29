import { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ChannelList from './components/ChannelList';
import CountrySelector from './components/CountrySelector';
import ChannelDetail from './components/ChannelDetail';
import CategoryView from './components/CategoryView';
import SkeletonUI from './components/SkeletonUI';
import { dataManager } from './data/dataManager';

// Admin Component Imports
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminEcosystem from './components/AdminEcosystem';
import AdminKatalog from './components/AdminKatalog';
import AdminCountries from './components/AdminCountries';
import AdminSettings from './components/AdminSettings';

import './App.css';

// Initialize data manager
dataManager.init();

function App() {
  // Client States
  const [countries, setCountries] = useState([]);
  const [activeCountry, setActiveCountry] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Dynamic items list loaded asynchronously
  const [clientItems, setClientItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Routing & Admin States
  const [route, setRoute] = useState(window.location.hash);
  const [adminTab, setAdminTab] = useState('ecosystem');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(dataManager.isAdminLoggedIn());

  // Watch for hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      setIsAdminLoggedIn(dataManager.isAdminLoggedIn());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Watch for dynamic countries and items changes in a single combined loader
  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [countriesList, itemsList] = await Promise.all([
          dataManager.getCountries(),
          dataManager.getItems()
        ]);
        
        if (active) {
          setCountries(countriesList);
          setClientItems(itemsList);
          
          if (countriesList.length > 0) {
            setActiveCountry(prev => {
              if (prev && countriesList.some(c => c.id === prev.id)) {
                return countriesList.find(c => c.id === prev.id);
              }
              return countriesList[0];
            });
          }

          // Asynchronously update real-time subscriber/member counts in the background
          (async () => {
            const targets = itemsList.filter(item => 
              (item.type === 'channel' || item.type === 'group') && item.username
            );
            for (const item of targets) {
              if (!active) break;
              try {
                const realCount = await dataManager.fetchTelegramStats(item.username);
                if (realCount && realCount !== item.subtext) {
                  await dataManager.updateItemSubtext(item.id, realCount);
                  if (active) {
                    setClientItems(prev => prev.map(i => i.id === item.id ? { ...i, subtext: realCount } : i));
                    setSelectedItem(prev => prev && prev.id === item.id ? { ...prev, subtext: realCount } : prev);
                  }
                }
              } catch (err) {
                console.warn(`Failed background update for ${item.username}:`, err);
              }
              // Wait 400ms to avoid overwhelming proxy servers
              await new Promise(r => setTimeout(r, 400));
            }
          })();
        }
      } catch (err) {
        console.error("Failed to load initial data in App:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadInitialData();
    return () => { active = false; };
  }, [route]);

  useEffect(() => {
    // Initialize Telegram WebApp SDK if running inside Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Style to match our light, premium design
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#ffffff');
    }
  }, []);

  // Telegram Native BackButton integration
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.BackButton) {
      if (selectedItem) {
        tg.BackButton.show();
        const handleBack = () => {
          setSelectedItem(null);
        };
        tg.BackButton.onClick(handleBack);
        
        // Cleanup event listener when item is deselected or unmounted
        return () => {
          tg.BackButton.offClick(handleBack);
        };
      } else if (selectedCategory) {
        tg.BackButton.show();
        const handleBack = () => {
          setSelectedCategory(null);
        };
        tg.BackButton.onClick(handleBack);
        
        // Cleanup event listener
        return () => {
          tg.BackButton.offClick(handleBack);
        };
      } else {
        tg.BackButton.hide();
      }
    }
  }, [selectedItem, selectedCategory]);

  // Handle open action (t.me links)
  const handleOpenItem = (item) => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      // Open link natively within Telegram
      window.Telegram.WebApp.openTelegramLink(item.link);
    } else {
      // Fallback for regular web browsers
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter items by type and search query
  const getFilteredItems = () => {
    if (!activeCountry) return [];
    const countryItems = clientItems.filter(item => item.country === activeCountry.id);
    
    return countryItems.filter((item) => {
      // 1. Filter by Tab Type
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      
      // 2. Filter by Search Query
      const matchesSearch = 
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesTab && matchesSearch;
    });
  };

  const filteredItems = getFilteredItems();

  // Get related items of the same type and category
  const getRelatedItems = (item) => {
    if (!item) return [];
    const allItems = clientItems;
    const countryItems = allItems.filter(i => i.country === item.country);
    let related = countryItems.filter(i => i.type === item.type);
    
    // Filter by same category to make it "similar"
    const sameCategory = related.filter(i => i.category === item.category);
    if (sameCategory.length > 0) {
      related = sameCategory;
    }
    
    return related;
  };

  // Admin Views Routing Logic
  if (route.startsWith('#/admin')) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
    }

    return (
      <AdminLayout activeTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'ecosystem' && <AdminEcosystem />}
        {adminTab === 'katalog' && <AdminKatalog />}
        {adminTab === 'mamlakatlar' && <AdminCountries />}
        {adminTab === 'sozlamalar' && (
          <AdminSettings onLogout={() => setIsAdminLoggedIn(false)} />
        )}
      </AdminLayout>
    );
  }

  // Client view loading state (uses Skeleton UI as a unified process)
  if (isLoading || countries.length === 0 || !activeCountry) {
    return (
      <div className="app-viewport">
        <div className="app-container animate-fade-in">
          <SkeletonUI />
        </div>
      </div>
    );
  }

  return (
    <div className="app-viewport">
      <div className="app-container">
        {dataManager.isFallbackActive() && (
          <div className="client-fallback-banner">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px', flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Vaqtinchalik Offline (LocalStorage) rejimida ishlamoqda.</span>
          </div>
        )}
        {selectedItem ? (
          /* Detail Page View */
          <main className="app-content-detail animate-fade-in">
            <ChannelDetail
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
              onOpen={handleOpenItem}
              relatedItems={getRelatedItems(selectedItem)}
              onItemClick={(item) => setSelectedItem(item)}
              onOpenClick={handleOpenItem}
              onCategoryClick={(categoryName) => {
                setSelectedCategory(categoryName);
                setSelectedItem(null);
              }}
            />
          </main>
        ) : selectedCategory ? (
          /* Category Page View */
          <main className="app-content-category animate-fade-in">
            <CategoryView
              categoryName={selectedCategory}
              items={clientItems.filter(item => item.category === selectedCategory && activeCountry && item.country === activeCountry.id)}
              onBack={() => setSelectedCategory(null)}
              onItemClick={(item) => setSelectedItem(item)}
              onOpenClick={handleOpenItem}
            />
          </main>
        ) : (
          /* Homepage List View */
          <>
            {/* Header Section */}
            <Header
              selectedCountry={activeCountry}
              onSelectorClick={() => setIsCountrySelectorOpen(true)}
            />

            {/* Tab Filters */}
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Search Bar */}
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8e8e93"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Kanal, guruh yoki botlarni qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8e8e93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <main className="app-content">
              <ChannelList
                items={filteredItems}
                onItemClick={(item) => setSelectedItem(item)}
                onOpenClick={handleOpenItem}
                onCategoryClick={(cat) => setSelectedCategory(cat)}
              />
            </main>

            {/* Quick Link to Admin Panel for convenience */}
            <div className="client-footer-admin-link">
              <a href="#/admin">Admin paneliga o'tish →</a>
            </div>
          </>
        )}

        {/* Country Selector Bottom Sheet */}
        <CountrySelector
          isOpen={isCountrySelectorOpen}
          onClose={() => setIsCountrySelectorOpen(false)}
          countries={countries}
          selectedCountry={activeCountry}
          onSelect={setActiveCountry}
        />
      </div>
    </div>
  );
}

export default App;

