import { useState, useEffect, useRef } from 'react';
import { dataManager } from '../data/dataManager';
import CountryFlag from './CountryFlag';

const WORLD_COUNTRIES = [
  { id: 'uz', name: 'O\'zbekiston', flag: '🇺🇿', nativeName: 'O\'zbekiston' },
  { id: 'us', name: 'Amerika Qo\'shma Shtatlari', flag: '🇺🇸', nativeName: 'AQSh' },
  { id: 'ru', name: 'Rossiya', flag: '🇷🇺', nativeName: 'Rossiya' },
  { id: 'kz', name: 'Qozog\'iston', flag: '🇰🇿', nativeName: 'Qozog\'iston' },
  { id: 'kg', name: 'Qirg\'iziston', flag: '🇰🇬', nativeName: 'Qirg\'iziston' },
  { id: 'tj', name: 'Tojikiston', flag: '🇹🇯', nativeName: 'Tojikiston' },
  { id: 'tm', name: 'Turkmaniston', flag: '🇹🇲', nativeName: 'Turkmaniston' },
  { id: 'tr', name: 'Turkiya', flag: '🇹🇷', nativeName: 'Turkiya' },
  { id: 'az', name: 'Ozarbayjon', flag: '🇦🇿', nativeName: 'Ozarbayjon' },
  { id: 'ir', name: 'Eron', flag: '🇮🇷', nativeName: 'Eron' },
  { id: 'ua', name: 'Ukraina', flag: '🇺🇦', nativeName: 'Ukraina' },
  { id: 'by', name: 'Belarus', flag: '🇧🇾', nativeName: 'Belarus' },
  { id: 'ae', name: 'Birlashgan Arab Amirliklari', flag: '🇦🇪', nativeName: 'BAA' },
  { id: 'sa', name: 'Saudiya Arabistoni', flag: '🇸🇦', nativeName: 'Saudiya' },
  { id: 'eg', name: 'Misr', flag: '🇪🇬', nativeName: 'Misr' },
  { id: 'il', name: 'Isroil', flag: '🇮🇱', nativeName: 'Isroil' },
  { id: 'ge', name: 'Gruziya', flag: '🇬🇪', nativeName: 'Gruziya' },
  { id: 'am', name: 'Armaniston', flag: '🇦🇲', nativeName: 'Armaniston' },
  { id: 'gb', name: 'Buyuk Britaniya', flag: '🇬🇧', nativeName: 'UK' },
  { id: 'de', name: 'Germaniya', flag: '🇩🇪', nativeName: 'Germaniya' },
  { id: 'fr', name: 'Fransiya', flag: '🇫🇷', nativeName: 'Fransiya' },
  { id: 'it', name: 'Italiya', flag: '🇮🇹', nativeName: 'Italiya' },
  { id: 'es', name: 'Ispaniya', flag: '🇪🇸', nativeName: 'Ispaniya' },
  { id: 'pl', name: 'Polsha', flag: '🇵🇱', nativeName: 'Polsha' },
  { id: 'nl', name: 'Niderlandiya', flag: '🇳🇱', nativeName: 'Niderlandiya' },
  { id: 'ch', name: 'Shveytsariya', flag: '🇨🇭', nativeName: 'Shveytsariya' },
  { id: 'se', name: 'Shvetsiya', flag: '🇸🇪', nativeName: 'Shvetsiya' },
  { id: 'no', name: 'Norvegiya', flag: '🇳🇴', nativeName: 'Norvegiya' },
  { id: 'fi', name: 'Finlyandiya', flag: '🇫🇮', nativeName: 'Finlyandiya' },
  { id: 'dk', name: 'Daniya', flag: '🇩🇰', nativeName: 'Daniya' },
  { id: 'ie', name: 'Irlandiya', flag: '🇮🇪', nativeName: 'Irlandiya' },
  { id: 'be', name: 'Belgiya', flag: '🇧🇪', nativeName: 'Belgiya' },
  { id: 'at', name: 'Avstriya', flag: '🇦🇹', nativeName: 'Avstriya' },
  { id: 'pt', name: 'Portugaliya', flag: '🇵🇹', nativeName: 'Portugaliya' },
  { id: 'gr', name: 'Gretsiya', flag: '🇬🇷', nativeName: 'Gretsiya' },
  { id: 'cz', name: 'Chexiya', flag: '🇨🇿', nativeName: 'Chexiya' },
  { id: 'sk', name: 'Slovakiya', flag: '🇸🇰', nativeName: 'Slovakiya' },
  { id: 'hu', name: 'Vengriya', flag: '🇭🇺', nativeName: 'Vengriya' },
  { id: 'ro', name: 'Ruminiya', flag: '🇷🇴', nativeName: 'Ruminiya' },
  { id: 'bg', name: 'Bolgariya', flag: '🇧🇬', nativeName: 'Bolgariya' },
  { id: 'hr', name: 'Xorvatiya', flag: '🇭🇷', nativeName: 'Xorvatiya' },
  { id: 'rs', name: 'Serbiya', flag: '🇷🇸', nativeName: 'Serbiya' },
  { id: 'ca', name: 'Kanada', flag: '🇨🇦', nativeName: 'Kanada' },
  { id: 'br', name: 'Braziliya', flag: '🇧🇷', nativeName: 'Braziliya' },
  { id: 'ar', name: 'Argentina', flag: '🇦🇷', nativeName: 'Argentina' },
  { id: 'mx', name: 'Meksika', flag: '🇲🇽', nativeName: 'Meksika' },
  { id: 'co', name: 'Kolumbiya', flag: '🇨🇴', nativeName: 'Kolumbiya' },
  { id: 'cl', name: 'Chili', flag: '🇨🇱', nativeName: 'Chili' },
  { id: 'pe', name: 'Peru', flag: '🇵🇪', nativeName: 'Peru' },
  { id: 've', name: 'Venesuela', flag: '🇻🇪', nativeName: 'Venesuela' },
  { id: 'ec', name: 'Ekvador', flag: '🇪🇨', nativeName: 'Ekvador' },
  { id: 'in', name: 'Hindiston', flag: '🇮🇳', nativeName: 'Hindiston' },
  { id: 'cn', name: 'Xitoy', flag: '🇨🇳', nativeName: 'Xitoy' },
  { id: 'jp', name: 'Yaponiya', flag: '🇯🇵', nativeName: 'Yaponiya' },
  { id: 'kr', name: 'Janubiy Koreya', flag: '🇰🇷', nativeName: 'Janubiy Koreya' },
  { id: 'id', name: 'Indoneziya', flag: '🇮🇩', nativeName: 'Indoneziya' },
  { id: 'pk', name: 'Pokiston', flag: '🇵🇰', nativeName: 'Pokiston' },
  { id: 'bd', name: 'Bangladesh', flag: '🇧🇩', nativeName: 'Bangladesh' },
  { id: 'ph', name: 'Filippin', flag: '🇵🇭', nativeName: 'Filippin' },
  { id: 'vn', name: 'Vyetnam', flag: '🇻🇳', nativeName: 'Vyetnam' },
  { id: 'th', name: 'Tailand', flag: '🇹🇭', nativeName: 'Tailand' },
  { id: 'my', name: 'Malayziya', flag: '🇲🇾', nativeName: 'Malayziya' },
  { id: 'sg', name: 'Singapur', flag: '🇸🇬', nativeName: 'Singapur' },
  { id: 'au', name: 'Avstraliya', flag: '🇦🇺', nativeName: 'Avstraliya' },
  { id: 'nz', name: 'Yangi Zelandiya', flag: '🇳🇿', nativeName: 'Yangi Zelandiya' },
  { id: 'ng', name: 'Nigeriya', flag: '🇳🇬', nativeName: 'Nigeriya' },
  { id: 'za', name: 'Janubiy Afrika Respublikasi', flag: '🇿🇦', nativeName: 'JAR' },
  { id: 'ke', name: 'Keniya', flag: '🇰🇪', nativeName: 'Keniya' },
  { id: 'ma', name: 'Marokash', flag: '🇲🇦', nativeName: 'Marokash' },
  { id: 'dz', name: 'Jazoir', flag: '🇩🇿', nativeName: 'Jazoir' },
  { id: 'et', name: 'Efiopiya', flag: '🇪🇹', nativeName: 'Efiopiya' },
  { id: 'gh', name: 'Gana', flag: '🇬🇭', nativeName: 'Gana' },
  { id: 'tz', name: 'Tanzaniya', flag: '🇹🇿', nativeName: 'Tanzaniya' },
  { id: 'ug', name: 'Uganda', flag: '🇺🇬', nativeName: 'Uganda' },
  { id: 'tn', name: 'Tunis', flag: '🇹🇳', nativeName: 'Tunis' },
  { id: 'qa', name: 'Qatar', flag: '🇶🇦', nativeName: 'Qatar' },
  { id: 'kw', name: 'Quvayt', flag: '🇰🇼', nativeName: 'Quvayt' },
  { id: 'bh', name: 'Bahrayn', flag: '🇧🇭', nativeName: 'Bahrayn' },
  { id: 'om', name: 'Ummon', flag: '🇴🇲', nativeName: 'Ummon' },
  { id: 'iq', name: 'Iroq', flag: '🇮🇶', nativeName: 'Iroq' },
  { id: 'jo', name: 'Iordaniya', flag: '🇯🇴', nativeName: 'Iordaniya' },
  { id: 'lb', name: 'Livan', flag: '🇱🇧', nativeName: 'Livan' },
  { id: 'sy', name: 'Suriya', flag: '🇸🇾', nativeName: 'Suriya' },
  { id: 'ye', name: 'Yaman', flag: '🇾🇪', nativeName: 'Yaman' },
  { id: 'af', name: 'Afg\'oniston', flag: '🇦🇫', nativeName: 'Afg\'oniston' },
  { id: 'mn', name: 'Mo\'g\'uliston', flag: '🇲🇳', nativeName: 'Mo\'g\'uliston' }
];

function AdminCountries() {
  const [countries, setCountries] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dropdownRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadCountryData = async () => {
      setIsLoading(true);
      try {
        const cnts = await dataManager.getCountries();
        const its = await dataManager.getItems();
        if (active) {
          setCountries(cnts);
          setItems(its);
        }
      } catch (err) {
        console.error("Failed to load countries admin data:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    loadCountryData();
    return () => { active = false; };
  }, [refreshTrigger]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter out countries that are already added
  const availableCountries = WORLD_COUNTRIES.filter(
    wc => !countries.some(c => c.id === wc.id)
  );

  // Set default selection when available list changes
  useEffect(() => {
    if (availableCountries.length > 0) {
      setSelectedCountryId(availableCountries[0].id);
    } else {
      setSelectedCountryId('');
    }
  }, [countries]);

  const handleCreateCountry = async (e) => {
    e.preventDefault();
    if (!selectedCountryId) {
      setError('Mamlakatni tanlang.');
      return;
    }

    const matchedCountry = WORLD_COUNTRIES.find(c => c.id === selectedCountryId);
    if (!matchedCountry) {
      setError('Noto\'g\'ri mamlakat tanlandi.');
      return;
    }

    setIsLoading(true);
    const saved = await dataManager.saveCountry(matchedCountry);

    if (saved) {
      setSuccess('Mamlakat muvaffaqiyatli qo\'shildi!');
      setError('');
      setRefreshTrigger(prev => prev + 1);
      
      // Auto clear success notice
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Mamlakatni saqlashda xatolik yuz berdi.');
      setIsLoading(false);
    }
  };

  const handleDeleteCountry = async (countryId, countryName) => {
    const count = items.filter(i => i.country === countryId).length;
    let message = `"${countryName}" mamlakatini o'chirishni xohlaysizmi?`;
    if (count > 0) {
      message += `\n\nDIQQAT: Ushbu mamlakatga tegishli barcha ${count} ta ekotizim elementlari (kanal, guruh, bot) ham BUTUNLAY O'CHIRIB TASHALADI!`;
    }

    const confirmed = window.confirm(message);
    if (confirmed) {
      setIsLoading(true);
      await dataManager.deleteCountry(countryId);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Filter countries in dropdown based on search query
  const searchedCountries = availableCountries.filter(c =>
    c.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    (c.nativeName && c.nativeName.toLowerCase().includes(dropdownSearch.toLowerCase()))
  );

  const selectedCountry = WORLD_COUNTRIES.find(c => c.id === selectedCountryId);

  return (
    <div className="katalog-view">
      <div className="katalog-grid">
        {/* Create Country Panel */}
        <div className="katalog-form-card">
          <h2>Mamlakat Qo'shish</h2>
          <p className="card-desc">Ro'yxatdan davlatni tanlab ekotizimga yangi mamlakat qo'shing.</p>
          
          <form onSubmit={handleCreateCountry} className="katalog-form">
            <div className="form-group">
              <label>Mamlakatni Tanlang *</label>
              
              {availableCountries.length > 0 ? (
                <div className="custom-select-container" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setDropdownSearch('');
                    }}
                    disabled={isLoading}
                  >
                    <span className="custom-select-trigger-content">
                      {selectedCountry ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <CountryFlag countryId={selectedCountry.id} style={{ width: '20px', height: '14px' }} />
                          </span>
                          <span>{selectedCountry.name} ({selectedCountry.id.toUpperCase()})</span>
                        </>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Mamlakatni tanlang</span>
                      )}
                    </span>
                    <svg
                      className={`custom-select-chevron ${isDropdownOpen ? 'open' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="custom-select-dropdown">
                      <div className="custom-select-search-wrapper">
                        <svg
                          className="custom-select-search-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                          type="text"
                          className="custom-select-search-input"
                          placeholder="Mamlakat nomini qidiring..."
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div className="custom-select-options-list">
                        {searchedCountries.length > 0 ? (
                          searchedCountries.map((c) => {
                            const isSelected = c.id === selectedCountryId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedCountryId(c.id);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <span className="custom-select-option-content">
                                  <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <CountryFlag countryId={c.id} style={{ width: '20px', height: '14px' }} />
                                  </span>
                                  <span>{c.name}</span>
                                </span>
                                <span style={{ fontSize: '11px', color: isSelected ? 'inherit' : '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                  {c.id}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="custom-select-no-results">
                            Mamlakat topilmadi
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '13px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  Barcha davlatlar allaqachon qo'shilgan.
                </div>
              )}
            </div>

            {error && <div className="katalog-form-error">{error}</div>}
            {success && <div className="katalog-form-success">{success}</div>}

            <button 
              type="submit" 
              className="katalog-submit-btn" 
              disabled={isLoading || availableCountries.length === 0}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Mamlakat Qo'shish
            </button>
          </form>
        </div>

        {/* Countries List Table */}
        <div className="katalog-list-card">
          <h2>Mavjud Mamlakatlar Ro'yxati</h2>
          <p className="card-desc">Tizimdagi faol mamlakatlar va ulardagi ekotizim elementlari statistikasi.</p>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>BAYROG'I & NOMI</th>
                  <th>KODI (ID)</th>
                  <th>ELEMENTLAR SONI</th>
                  <th className="actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && countries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : countries.length > 0 ? (
                  countries.map((country) => {
                    const itemCount = items.filter(item => item.country === country.id).length;
                    return (
                      <tr key={country.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <CountryFlag countryId={country.id} style={{ width: '24px', height: '16px' }} />
                            </span>
                            <span className="katalog-name" style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{country.nativeName || country.name}</span>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>{country.name}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                            {country.id}
                          </span>
                        </td>
                        <td>
                          <span className="katalog-count-badge">
                            {itemCount} ta element
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="table-action-btn delete" 
                              title="Mamlakatni O'chirish"
                              onClick={() => handleDeleteCountry(country.id, country.name)}
                              disabled={isLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      Mamlakatlar topilmadi. Yangi qo'shib ko'ring.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCountries;
