import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Package, label: 'Produtos', path: '/produtos' },
    { icon: ShoppingCart, label: 'Vendas', path: '/vendas' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        zIndex: 50
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="https://corttex.com.br/wp-content/uploads/2021/04/Logo-Corttex-1.png" alt="Corttex" style={{ height: '28px', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <h2 style={{ display: 'none', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-accent-blue)' }}>CORTTEX</h2>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), transparent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid var(--color-accent-blue)' : '3px solid transparent',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} color={isActive ? 'var(--color-accent-blue)' : 'var(--color-text-muted)'} />
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '260px', width: 'calc(100% - 260px)', minHeight: '100vh', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
