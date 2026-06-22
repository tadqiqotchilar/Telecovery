import { useEffect } from 'react';

const CategoryView = ({ categoryName, items, onBack, onItemClick, onOpenClick }) => {
  // Check if Telegram WebApp BackButton is available
  const isTelegram = !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);

  // Scroll to top when active category changes
  useEffect(() => {
    const container = document.querySelector('.app-content-category');
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName]);

  return (
    <div className="category-view-container">
      {/* Fallback back button for standard browsers (hidden in Telegram) */}
      {!isTelegram && (
        <button className="detail-nav-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Orqaga</span>
        </button>
      )}

      {/* Category Header Title */}
      <h1 className="category-view-title">{categoryName}</h1>

      {/* Category List Items */}
      <div className="category-items" style={{ marginTop: '24px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="list-item"
            onClick={() => onItemClick(item)}
          >
            <div className="item-avatar-container">
              <div
                className="item-avatar"
                style={{ background: item.avatar ? 'transparent' : item.avatarColor }}
              >
                {item.avatar ? (
                  <img src={item.avatar} alt={item.title} className="item-avatar-img" />
                ) : (
                  item.initials
                )}
              </div>
            </div>

            <div className="item-details">
              <span className="item-title">{item.title}</span>
              <span className="item-subtext">{item.subtext}</span>
            </div>

            <div className="item-action">
              <button
                className="open-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenClick(item);
                }}
              >
                Ochish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryView;
