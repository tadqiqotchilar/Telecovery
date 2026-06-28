

import CountryFlag from './CountryFlag';

const CountrySelector = ({ isOpen, onClose, countries, selectedCountry, onSelect }) => {
  return (
    <div className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* iOS Drag Handle */}
        <div className="drag-handle"></div>
        
        <div className="sheet-header">
          <h2>Davlatni tanlang</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
 
        <div className="country-list">
          {countries.map((country) => {
            const isSelected = country.id === selectedCountry.id;
            return (
              <button
                key={country.id}
                className={`country-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(country);
                  onClose();
                }}
              >
                <div className="country-info">
                  <span className="country-flag-large" style={{ display: 'flex', alignItems: 'center' }}>
                    <CountryFlag countryId={country.id} style={{ width: '28px', height: '18px' }} />
                  </span>
                  <div className="country-names">
                    <span className="country-native">{country.nativeName}</span>
                    <span className="country-english">{country.name}</span>
                  </div>
                </div>
                {isSelected && (
                  <svg className="check-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2481f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;
