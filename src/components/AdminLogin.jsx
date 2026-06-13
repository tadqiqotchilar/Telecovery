import { useState } from 'react';
import { dataManager } from '../data/dataManager';

function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isCorrect = await dataManager.checkPassword(password);
    if (isCorrect) {
      dataManager.login();
      setError('');
      onLoginSuccess();
      window.location.hash = '#/admin';
    } else {
      setError('Noto\'g\'ri parol! Qayta urinib ko\'ring.');
    }
  };

  const handleBackToApp = () => {
    window.location.hash = '';
  };

  return (
    <div className="admin-login-viewport">
      <div className="admin-login-container animate-fade-in">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            Telecovery<span>.</span>
          </div>
          <p className="admin-login-subtitle">Boshqaruv paneliga kirish</p>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="input-group">
              <label htmlFor="admin-pass">Admin Paroli</label>
              <input
                id="admin-pass"
                type="password"
                placeholder="Parolni kiriting (default: admin)..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="admin-login-error">{error}</div>}
            
            <button type="submit" className="admin-login-btn">
              Kirish
            </button>
          </form>

          <button onClick={handleBackToApp} className="admin-login-back-btn">
            ← Asosiy sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
