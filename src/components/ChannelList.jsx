import React from 'react';

const ChannelList = ({ items, onOpen }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>Hech narsa topilmadi</p>
      </div>
    );
  }

  // Group items by category
  const categories = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="channel-list-container">
      {Object.entries(categories).map(([categoryName, categoryItems]) => (
        <div key={categoryName} className="category-group">
          {/* Category Title Header */}
          <div className="category-header">
            <h2 className="category-title">{categoryName}</h2>
            <svg
              className="chevron-right"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* List of items in this category */}
          <div className="category-items">
            {categoryItems.map((item) => (
              <div key={item.id} className="list-item">
                <div className="item-avatar-container">
                  <div
                    className="item-avatar"
                    style={{ background: item.avatarColor }}
                  >
                    {item.initials}
                  </div>
                </div>

                <div className="item-details">
                  <span className="item-title">{item.title}</span>
                  <span className="item-subtext">{item.subtext}</span>
                </div>

                <div className="item-action">
                  <button className="open-action-btn" onClick={() => onOpen(item)}>
                    Ochish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChannelList;
