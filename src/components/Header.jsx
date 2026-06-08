
const Header = ({ selectedCountry, onSelectorClick }) => {
  return (
    <header className="app-header">
      <h1 className="logo">Telecovery.</h1>
      <button className="country-selector-btn" onClick={onSelectorClick}>
        <span className="flag">{selectedCountry.flag}</span>
        <span className="country-name">{selectedCountry.nativeName}</span>
        <svg
          className="chevron-down"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </header>
  );
};

export default Header;
