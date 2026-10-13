import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">ClinicFlow</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/appointments">Rendez-vous</NavLink>
        </nav>
        <div className="user">
          <span>
            {user.fullName} <span className={`role role-${user.role}`}>{user.role}</span>
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
