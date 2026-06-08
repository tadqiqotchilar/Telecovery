import { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ChannelList from './components/ChannelList';
import CountrySelector from './components/CountrySelector';
import ChannelDetail from './components/ChannelDetail';
import { dataManager } from './data/dataManager';

// Admin Component Imports
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminEcosystem from './components/AdminEcosystem';
import AdminKatalog from './components/AdminKatalog';
import AdminSettings from './components/AdminSettings';

import './App.css';

// Initialize data manager
dataManager.init();

function App() {
  // Client States
  const countries = dataManager.getCountries();
  const [activeCountry, setActiveCountry] = useState(countries[0]);
  const [activeTab, setActiveTab] = useState('all');
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
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
      } else {
        tg.BackButton.hide();
      }
    }
  }, [selectedItem]);

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
    const countryItems = dataManager.getItems().filter(item => item.country === activeCountry.id);
    
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

  // Admin Views Routing Logic
  if (route.startsWith('#/admin')) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
    }

    return (
      <AdminLayout activeTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'ecosystem' && <AdminEcosystem />}
        {adminTab === 'katalog' && <AdminKatalog />}
        {adminTab === 'sozlamalar' && (
          <AdminSettings onLogout={() => setIsAdminLoggedIn(false)} />
        )}
      </AdminLayout>
    );
  }

  // Client view (Telegram Mini App)
  return (
    <div className="app-viewport">
      <div className="app-container">
        {selectedItem ? (
          /* Detail Page View */
          <main className="app-content-detail animate-fade-in">
            <ChannelDetail
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
              onOpen={handleOpenItem}
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

