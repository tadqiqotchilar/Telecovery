import React from 'react';

const SkeletonUI = () => {
  return (
    <div className="skeleton-container">
      {/* Skeleton Header */}
      <header className="app-header skeleton-header-wrapper">
        <div className="skeleton skeleton-logo"></div>
        <div className="skeleton skeleton-country-btn"></div>
      </header>

      {/* Skeleton Tabs */}
      <div className="tabs-container skeleton-tabs-container">
        <div className="tabs-scroll">
          <div className="skeleton skeleton-tab"></div>
          <div className="skeleton skeleton-tab"></div>
          <div className="skeleton skeleton-tab"></div>
          <div className="skeleton skeleton-tab"></div>
        </div>
      </div>

      {/* Skeleton Search */}
      <div className="search-bar-container skeleton-search-container">
        <div className="skeleton skeleton-search-bar"></div>
      </div>

      {/* Skeleton Main Content */}
      <main className="app-content skeleton-content">
        {[1, 2].map((groupIndex) => (
          <div key={groupIndex} className="category-group">
            {/* Skeleton Category Header */}
            <div className="category-header skeleton-category-header">
              <div className="skeleton skeleton-category-title"></div>
              <div className="skeleton skeleton-chevron"></div>
            </div>

            {/* Skeleton Items */}
            <div className="category-items">
              {[1, 2, 3].map((itemIndex) => (
                <div key={itemIndex} className="list-item skeleton-list-item">
                  <div className="item-avatar-container">
                    <div className="skeleton skeleton-avatar"></div>
                  </div>

                  <div className="item-details">
                    <div className="skeleton skeleton-item-title"></div>
                    <div className="skeleton skeleton-item-subtext"></div>
                  </div>

                  <div className="item-action">
                    <div className="skeleton skeleton-item-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      
      {/* Skeleton Footer Link */}
      <div className="client-footer-admin-link skeleton-footer-wrapper" style={{ borderTop: '1px solid var(--divider)', padding: '16px', background: 'var(--bg-primary)' }}>
        <div className="skeleton skeleton-footer-link" style={{ margin: '0 auto' }}></div>
      </div>
    </div>
  );
};

export default SkeletonUI;
