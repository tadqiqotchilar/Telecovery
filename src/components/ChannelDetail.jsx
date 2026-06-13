import { useEffect, useState } from 'react';

const ChannelDetail = ({ item, onBack, onOpen, relatedItems, onItemClick, onOpenClick }) => {
  const [showToast, setShowToast] = useState(false);

  // Check if Telegram WebApp BackButton is available
  const isTelegram = !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);

  // Scroll to top when active item changes
  useEffect(() => {
    const container = document.querySelector('.app-content-detail');
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [item.id]);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(item.link)}&text=${encodeURIComponent("Telecovery orqali ommabop tarmoq topdim: " + item.title)}`;
    
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      // Browser fallback: copy to clipboard and show toast
      navigator.clipboard.writeText(item.link)
        .then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        })
        .catch(() => {
          window.open(shareUrl, '_blank');
        });
    }
  };

  const getSectionTitle = () => {
    switch (item.type) {
      case 'group':
        return 'Guruh tavsifi';
      case 'bot':
        return 'Bot tavsifi';
      case 'channel':
      default:
        return 'Kanal tavsifi';
    }
  };

  const getRelatedSectionTitle = () => {
    switch (item.type) {
      case 'group':
        return 'Shunga yaqin guruhlar';
      case 'bot':
        return 'Shunga yaqin botlar';
      case 'channel':
      default:
        return 'Shunga yaqin kanallar';
    }
  };

  return (
    <div className="detail-view-container">
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

      {/* Main Detail Header Area */}
      <div className="detail-header-block">
        <div className="detail-avatar-container">
          <div
            className="detail-avatar"
            style={{ background: item.avatarColor }}
          >
            {item.initials}
          </div>
        </div>

        <div className="detail-info-block">
          <h2 className="detail-title">{item.title}</h2>
          <span className="detail-subtext">{item.subtext}</span>
          
          <div className="detail-actions">
            <button className="detail-open-btn" onClick={() => onOpen(item)}>
              Ochish
            </button>
            
            <button className="detail-share-btn" onClick={handleShare} title="Ulashish">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="#2481f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 8l6 6-6 6"></path>
                <path d="M21 14H3c0-3.33 2.67-6 6-6h3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <hr className="detail-divider" />

      {/* Description Content */}
      <div className="detail-description-section">
        <h3 className="detail-section-title">{getSectionTitle()}</h3>
        <p className="detail-description-text">{item.description}</p>
      </div>

      {/* Similar / Related Items Section */}
      {relatedItems && relatedItems.length > 0 && (
        <div className="related-items-section">
          <hr className="detail-divider" style={{ marginTop: '30px' }} />
          
          <div className="category-header">
            <h2 className="category-title">{getRelatedSectionTitle()}</h2>
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

          <div className="category-items">
            {relatedItems.map((relatedItem) => (
              <div
                key={relatedItem.id}
                className="list-item"
                onClick={() => onItemClick(relatedItem)}
              >
                <div className="item-avatar-container">
                  <div
                    className="item-avatar"
                    style={{ background: relatedItem.avatarColor }}
                  >
                    {relatedItem.initials}
                  </div>
                </div>

                <div className="item-details">
                  <span className="item-title">{relatedItem.title}</span>
                  <span className="item-subtext">{relatedItem.subtext}</span>
                </div>

                <div className="item-action">
                  <button
                    className="open-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenClick(relatedItem);
                    }}
                  >
                    Ochish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clipboard Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          Havola nusxalandi!
        </div>
      )}
    </div>
  );
};

export default ChannelDetail;
