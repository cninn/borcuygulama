import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CustomerDetail from './components/CustomerDetail';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('vd_token'));
  const [page, setPage] = useState({ view: 'dashboard', customerId: null });

  useEffect(() => {
    const handleLogout = () => { setToken(null); };
    window.addEventListener('vd-logout', handleLogout);
    return () => window.removeEventListener('vd-logout', handleLogout);
  }, []);

  function handleLogin(t) {
    localStorage.setItem('vd_token', t);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('vd_token');
    setToken(null);
  }

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      {page.view === 'dashboard' ? (
        <Dashboard
          onSelectCustomer={id => setPage({ view: 'detail', customerId: id })}
          onLogout={handleLogout}
        />
      ) : (
        <CustomerDetail
          customerId={page.customerId}
          onBack={() => setPage({ view: 'dashboard', customerId: null })}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
