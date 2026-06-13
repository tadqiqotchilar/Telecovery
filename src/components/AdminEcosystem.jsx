import { useState, useEffect } from 'react';
import { dataManager } from '../data/dataManager';

function generateAutoSubtext(type, country, category) {
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (type === 'channel') {
    const count = Math.floor(Math.random() * 1450000) + 5000;
    const formatted = formatNumber(count);
    if (country === 'uz') return `${formatted} obunachi`;
    if (country === 'ru') return `${formatted} подписчиков`;
    return `${formatted} subscribers`;
  }
  
  if (type === 'group') {
    const count = Math.floor(Math.random() * 45000) + 500;
    const formatted = formatNumber(count);
    if (country === 'uz') return `${formatted} a'zo`;
    if (country === 'ru') return `${formatted} участников`;
    return `${formatted} members`;
  }
  
  if (type === 'bot') {
    if (category) {
      const lowerCat = category.toLowerCase();
      if (lowerCat.includes('media') || lowerCat.includes('yuklovchi') || lowerCat.includes('download')) {
        if (country === 'uz') return 'Video & audio yuklovchi';
        if (country === 'ru') return 'Загрузчик медиа';
        return 'Media downloader';
      }
      if (lowerCat.includes('yordamchi') || lowerCat.includes('helper') || lowerCat.includes('utility') || lowerCat.includes('sozlamalar')) {
        if (country === 'uz') return 'Yordamchi bot';
        if (country === 'ru') return 'Помощник';
        return 'Utility bot';
      }
    }
    if (country === 'uz') return 'Foydali bot';
    if (country === 'ru') return 'Полезный бот';
    return 'Assistant bot';
  }
  
  return '';
}

function AdminEcosystem() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const countries = dataManager.getCountries();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // null means adding
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    subtext: '',
    type: 'channel',
    category: '',
    country: 'uz',
    link: '',
    description: '',
    avatar: ''
  });

  useEffect(() => {
    let active = true;
    const fetchEcosystemData = async () => {
      setIsLoading(true);
      try {
        const list = await dataManager.getItems();
        const cats = await dataManager.getCategories();
        if (active) {
          setItems(list);
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to load admin ecosystem data:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchEcosystemData();
    return () => { active = false; };
  }, [refreshTrigger]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Rasm hajmi juda katta! 1MB dan kichik rasm yuklang.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  // Handle Edit Click
  const handleEditClick = (item) => {
    setCurrentItem(item);
    setFormData({
      id: item.id,
      title: item.title,
      username: item.username || '',
      subtext: item.subtext || '',
      type: item.type,
      category: item.category || (categories[0] || ''),
      country: item.country || 'uz',
      link: item.link || '',
      description: item.description || '',
      avatar: item.avatar || ''
    });
    setIsModalOpen(true);
  };

  // Handle Add Click
  const handleAddClick = () => {
    setCurrentItem(null);
    setFormData({
      title: '',
      username: '',
      subtext: '',
      type: 'channel',
      category: categories[0] || 'Yangiliklar',
      country: countries[0]?.id || 'uz',
      link: '',
      description: '',
      avatar: ''
    });
    setIsModalOpen(true);
  };

  // Handle Delete Click
  const handleDeleteClick = async (id, title) => {
    const confirmed = window.confirm(`"${title}" ni o'chirishni xohlaysizmi?`);
    if (confirmed) {
      setIsLoading(true);
      await dataManager.deleteItem(id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (!dataToSave.id || !dataToSave.subtext) {
      dataToSave.subtext = generateAutoSubtext(dataToSave.type, dataToSave.country, dataToSave.category);
    }
    setIsLoading(true);
    setIsModalOpen(false);
    await dataManager.saveItem(dataToSave);
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesCountry = selectedCountry === 'all' || item.country === selectedCountry;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  // Pagination logic
  const totalResults = filteredItems.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsSlice = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Stats
  const totalCount = items.length;
  const channelCount = items.filter(i => i.type === 'channel').length;
  const groupCount = items.filter(i => i.type === 'group').length;
  const botCount = items.filter(i => i.type === 'bot').length;

  return (
    <div className="ecosystem-view">
      {/* Stats Widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
          </div>
          <div className="stat-details">
            <h3>{totalCount} ta</h3>
            <p>Jami Ekotizim</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon channels">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </div>
          <div className="stat-details">
            <h3>{channelCount} ta</h3>
            <p>Kanallar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon groups">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="stat-details">
            <h3>{groupCount} ta</h3>
            <p>Guruhlar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bots">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2v2"></path><path d="M8 5h8"></path><circle cx="8" cy="16" r="1"></circle><circle cx="16" cy="16" r="1"></circle></svg>
          </div>
          <div className="stat-details">
            <h3>{botCount} ta</h3>
            <p>Botlar</p>
          </div>
        </div>
      </div>

      {/* Control Actions (Search & Filters) */}
      <div className="controls-card">
        <div className="controls-row">
          <div className="search-box-wrapper">
            <svg className="search-box-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Qidirish (Nomi yoki foydalanuvchi nomi)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filters-wrapper">
            <div className="select-dropdown-wrapper">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Barcha Turlar</option>
                <option value="channel">Kanal (Channel)</option>
                <option value="group">Guruh (Group)</option>
                <option value="bot">Bot (Bot)</option>
              </select>
            </div>

            <div className="select-dropdown-wrapper">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Barcha Davlatlar</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="add-btn" onClick={handleAddClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Yangi Qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Ecosystem Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ENTITY</th>
                <th>TYPE</th>
                <th>CATEGORY</th>
                <th>COUNTRY</th>
                <th className="actions-header">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="table-empty">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : currentItemsSlice.length > 0 ? (
                currentItemsSlice.map((item) => {
                  const countryObj = countries.find(c => c.id === item.country);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-entity">
                          <div 
                            className="entity-avatar" 
                            style={{ background: item.avatar ? 'transparent' : item.avatarColor }}
                          >
                            {item.avatar ? (
                              <img src={item.avatar} alt={item.title} className="item-avatar-img" />
                            ) : (
                              item.initials
                            )}
                          </div>
                          <div className="entity-details">
                            <span className="entity-title">{item.title}</span>
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="entity-view-link"
                            >
                              Havolani ko'rish
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '3px' }}>
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${item.type}`}>
                          {item.type === 'channel' && (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg>
                              Kanal
                            </>
                          )}
                          {item.type === 'group' && (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                              Guruh
                            </>
                          )}
                          {item.type === 'bot' && (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2v2"></path></svg>
                              Bot
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="table-category">{item.category}</span>
                      </td>

                      <td>
                        <span className="table-country">
                          {countryObj ? `${countryObj.flag} ${countryObj.name}` : item.country.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="table-action-btn edit" 
                            title="Tahrirlash"
                            onClick={() => handleEditClick(item)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                            </svg>
                          </button>
                          <button 
                            className="table-action-btn delete" 
                            title="O'chirish"
                            onClick={() => handleDeleteClick(item.id, item.title)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="table-empty">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="table-pagination">
          <span className="pagination-info">
            Jami {totalResults} tadan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalResults)} ko'rsatilmoqda
          </span>
          <div className="pagination-buttons">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Oldingi
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* Form Dialog Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container animate-fade-in">
            <div className="modal-header">
              <h2>{currentItem ? 'Elementni tahrirlash' : 'Yangi element qo\'shish'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Sarlavha / Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masalan: Kun.uz Yangiliklari"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Avatar Rasmi</label>
                  <div className="avatar-upload-container">
                    <div 
                      className="avatar-preview-box"
                      style={{ 
                        background: formData.avatar ? 'transparent' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                        border: formData.avatar ? 'none' : '2px dashed #cbd5e1' 
                      }}
                    >
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar Preview" className="avatar-preview-img" />
                      ) : (
                        <span className="avatar-placeholder-txt">Rasm yo'q</span>
                      )}
                    </div>
                    <div className="avatar-upload-actions">
                      <label className="file-upload-label">
                        Rasm tanlash
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {formData.avatar && (
                        <button 
                          type="button" 
                          className="btn-remove-avatar"
                          onClick={handleRemoveAvatar}
                        >
                          O'chirish
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Turi *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="channel">Kanal (Channel)</option>
                    <option value="group">Guruh (Group)</option>
                    <option value="bot">Bot (Bot)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mamlakat *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>



                <div className="form-group">
                  <label>Kategoriya *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Havola (Link) *</label>
                  <input
                    type="url"
                    required
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="Masalan: https://t.me/kunuzofficial"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Tavsif (Description)</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ekotizim elementi haqida qisqacha ma'lumot..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-primary">
                  {currentItem ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEcosystem;
