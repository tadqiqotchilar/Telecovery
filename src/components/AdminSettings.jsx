import { useState } from 'react';
import { dataManager } from '../data/dataManager';

function AdminSettings({ onLogout }) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Password submission
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    // Check current password
    if (!dataManager.checkPassword(currentPassword)) {
      setPassError('Hozirgi parol noto\'g\'ri kiritildi.');
      return;
    }

    // Check new password length
    if (newPassword.length < 4) {
      setPassError('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak.');
      return;
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      setPassError('Yangi parollar mos kelmadi.');
      return;
    }

    // Update
    const updated = dataManager.updatePassword(newPassword);
    if (updated) {
      setPassSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError('Xatolik yuz berdi. Parol o\'zgartirilmadi.');
    }
  };

  // Reset all data
  const handleResetData = () => {
    const doubleConfirmed = window.confirm(
      "DIQQAT: Tizimdagi barcha ma'lumotlarni o'chirib yuborishni xohlaysizmi?\n" +
      "Bu amalni ortga qaytarib bo'lmaydi va barcha qo'shilgan/o'zgartirilgan kanallar o'chib ketadi!"
    );
    
    if (doubleConfirmed) {
      dataManager.resetAllData();
      alert("Barcha ma'lumotlar o'chirildi va dastlabki holatga qaytarildi.");
      window.location.reload();
    }
  };

  const handleExit = () => {
    dataManager.logout();
    onLogout();
    window.location.hash = '';
  };

  return (
    <div className="settings-view animate-fade-in">
      <div className="settings-grid">
        {/* Change Password Card */}
        <div className="settings-card">
          <div className="card-header-with-icon">
            <div className="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>Parolni O'zgartirish</h2>
          </div>
          <p className="card-desc">Boshqaruv panelining xavfsizligini ta'minlash uchun parolni yangilang.</p>

          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label>Hozirgi Parol *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Amaldagi parolni kiriting..."
              />
            </div>

            <div className="form-group">
              <label>Yangi Parol *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 4 ta belgi..."
              />
            </div>

            <div className="form-group">
              <label>Yangi Parolni Tasdiqlang *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yangi parolni qayta kiriting..."
              />
            </div>

            {passError && <div className="settings-error-msg">{passError}</div>}
            {passSuccess && <div className="settings-success-msg">{passSuccess}</div>}

            <button type="submit" className="settings-submit-btn">
              Parolni Yangilash
            </button>
          </form>
        </div>

        {/* Danger Zone Card */}
        <div className="settings-card danger-card">
          <div className="card-header-with-icon">
            <div className="card-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h2>Xavfli Hudud (Danger Zone)</h2>
          </div>
          <p className="card-desc">Ushbu bo'limdagi amallar tizim ma'lumotlariga butunlay ta'sir qiladi. Ehtiyot bo'ling.</p>

          <div className="danger-actions">
            {/* Delete All Data */}
            <div className="danger-action-item">
              <div className="action-details">
                <h3>Barcha ma'lumotlarni o'chirish</h3>
                <p>Ekotizim kanallari, guruhlar, botlar va kategoriyalarni o'chirib, tizimni dastlabki holatga qaytaradi.</p>
              </div>
              <button 
                type="button" 
                className="danger-btn delete-all"
                onClick={handleResetData}
              >
                Ma'lumotlarni Tozalash
              </button>
            </div>

            {/* Logout */}
            <div className="danger-action-item">
              <div className="action-details">
                <h3>Tizimdan chiqish</h3>
                <p>Boshqaruv seansini yopish va admin panelidan chiqish.</p>
              </div>
              <button 
                type="button" 
                className="danger-btn exit-admin"
                onClick={handleExit}
              >
                Chiqish (Logout)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
