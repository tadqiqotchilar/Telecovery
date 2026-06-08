import { useState } from 'react';
import { dataManager } from '../data/dataManager';

function AdminKatalog() {
  const [categories, setCategories] = useState(() => dataManager.getCategories());
  const [items, setItems] = useState(() => dataManager.getItems());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = () => {
    setCategories(dataManager.getCategories());
    setItems(dataManager.getItems());
  };


  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryName.trim()) {
      setError('Kategoriya nomini kiriting.');
      return;
    }

    const created = dataManager.saveCategory(newCategoryName);
    if (created) {
      setSuccess('Kategoriya muvaffaqiyatli yaratildi!');
      setError('');
      setNewCategoryName('');
      loadData();
      
      // Auto clear success notice
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Ushbu kategoriya allaqachon mavjud.');
      setSuccess('');
    }
  };

  const handleDeleteCategory = (categoryName) => {
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
      dataManager.deleteCategory(categoryName);
      loadData();
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
                {categories.length > 0 ? (
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
