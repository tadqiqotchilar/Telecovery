import { useState, useEffect } from 'react';
import { dataManager } from '../data/dataManager';

function AdminKatalog() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const loadCatalogData = async () => {
      setIsLoading(true);
      try {
        const cats = await dataManager.getCategories();
        const its = await dataManager.getItems();
        if (active) {
          setCategories(cats);
          setItems(its);
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    loadCatalogData();
    return () => { active = false; };
  }, [refreshTrigger]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryName.trim()) {
      setError('Kategoriya nomini kiriting.');
      return;
    }

    setIsLoading(true);
    const created = await dataManager.saveCategory(newCategoryName);
    if (created) {
      setSuccess('Kategoriya muvaffaqiyatli yaratildi!');
      setError('');
      setNewCategoryName('');
      setRefreshTrigger(prev => prev + 1);
      
      // Auto clear success notice
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Ushbu kategoriya allaqachon mavjud.');
      setSuccess('');
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (categoryName === 'Uncategorized') {
      alert('"Uncategorized" kategoriyasini o\'chirib bo\'lmaydi.');
      return;
    }

    const count = items.filter(i => i.category === categoryName).length;
    let message = `"${categoryName}" kategoriyasini o'chirishni xohlaysizmi?`;
    if (count > 0) {
      message += `\nDiqqat: Ushbu kategoriyadagi ${count} ta element "Uncategorized" kategoriyasiga o'tkaziladi.`;
    }

    const confirmed = window.confirm(message);
    if (confirmed) {
      setIsLoading(true);
      await dataManager.deleteCategory(categoryName);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="katalog-view">
      <div className="katalog-grid">
        {/* Create Category Panel */}
        <div className="katalog-form-card">
          <h2>Yangi Kategoriya Yaratish</h2>
          <p className="card-desc">Ekotizim elementlari uchun yangi bo'lim (katalog) qo'shing.</p>
          
          <form onSubmit={handleCreateCategory} className="katalog-form">
            <div className="form-group">
              <label>Kategoriya Nomi *</label>
              <input
                type="text"
                placeholder="Masalan: Texnologiya, Kino, Siyosat..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>

            {error && <div className="katalog-form-error">{error}</div>}
            {success && <div className="katalog-form-success">{success}</div>}

            <button type="submit" className="katalog-submit-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Kategoriya Yaratish
            </button>
          </form>
        </div>

        {/* Categories List Table */}
        <div className="katalog-list-card">
          <h2>Mavjud Kategoriyalar Ro'yxati</h2>
          <p className="card-desc">Tizimdagi barcha faol kataloglar va ularning statistikasi.</p>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>KATEGORIYA NOMI</th>
                  <th>ELEMENTLAR SONI</th>
                  <th className="actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="table-empty">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((category, idx) => {
                    const itemCount = items.filter(item => item.category === category).length;
                    return (
                      <tr key={idx}>
                        <td>
                          <span className="katalog-name">{category}</span>
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
                              title="Kategoriyani O'chirish"
                              disabled={category === 'Uncategorized'}
                              onClick={() => handleDeleteCategory(category)}
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
                    <td colSpan="3" className="table-empty">
                      Kategoriyalar topilmadi. Yangi yaratib ko'ring.
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

export default AdminKatalog;
