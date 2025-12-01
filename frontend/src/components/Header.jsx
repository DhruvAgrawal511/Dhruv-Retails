import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'User';

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('userEmail');
    navigate('/login');
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo">📊 Dhruv Retails</h1>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {userEmail}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
