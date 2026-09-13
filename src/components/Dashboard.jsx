import { useState } from 'react';
import { useStore } from '../useStore';
import AddCustomerModal from './AddCustomerModal';
import QuickNotes from './QuickNotes';

export default function Dashboard({ onSelectCustomer, onLogout }) {
  const { customers, addCustomer, deleteCustomer, loading, error } = useStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notesTotal, setNotesTotal] = useState(0);
  const [tab, setTab] = useState('home');

  const debtors = customers.filter(c => !c.isPayable && c.totalDebt > 0);
  const payables = customers.filter(c => c.isPayable);
  const totalPayable = payables.reduce((sum, c) => sum + c.totalDebt, 0);

  const listSource = tab === 'home' ? debtors : tab === 'customers' ? customers : payables;
  const filtered = listSource.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.surname.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const totalDebt = customers.filter(c => !c.isPayable).reduce((sum, c) => sum + c.totalDebt, 0) + notesTotal;

  function handleDelete(e, id) {
    e.stopPropagation();
    setDeleteConfirm(id);
  }

  function confirmDelete() {
    deleteCustomer(deleteConfirm);
    setDeleteConfirm(null);
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <div>
              <h1 className="logo-title">Veresiye Defteri</h1>
              <p className="logo-sub">Market Borç Takip</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="stat-card">
            <span className="stat-label">Toplam Müşteri</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-card stat-card--danger">
            <span className="stat-label">Toplam Alacak</span>
            <span className="stat-value">{totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
          </div>
          {totalPayable > 0 && (
            <div className="stat-card stat-card--warning">
              <span className="stat-label">Ödenecek</span>
              <span className="stat-value">{totalPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          )}
          <button className="btn-logout" onClick={onLogout} title="Çıkış Yap">🚪 Çıkış</button>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${tab === 'home' ? 'nav-tab--active' : ''}`}
          onClick={() => { setTab('home'); setSearch(''); }}
        >
          🏠 Ana Ekran
          {debtors.length > 0 && (
            <span className="nav-tab-badge">{debtors.length}</span>
          )}
        </button>
        <button
          className={`nav-tab ${tab === 'customers' ? 'nav-tab--active' : ''}`}
          onClick={() => { setTab('customers'); setSearch(''); }}
        >
          👥 Müşteriler
          <span className="nav-tab-badge nav-tab-badge--neutral">{customers.length}</span>
        </button>
        <button
          className={`nav-tab ${tab === 'payables' ? 'nav-tab--active' : ''}`}
          onClick={() => { setTab('payables'); setSearch(''); }}
        >
          📤 Ödenecekler
          {payables.length > 0 && (
            <span className="nav-tab-badge nav-tab-badge--warning">{payables.length}</span>
          )}
        </button>
      </nav>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className={tab === 'home' ? 'dashboard-grid' : ''}>
        <div className={tab === 'home' ? 'dashboard-left' : ''}>
          <div className="toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="text"
                placeholder={
                  tab === 'home' ? 'Borçlu müşteri ara...' :
                  tab === 'payables' ? 'Ödenecek kişi ara...' :
                  'İsim, soyisim veya telefon ara...'
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
            <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
              <span>+</span> Müşteri Ekle
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Veriler yükleniyor...</p>
            </div>
          ) : (
            <div className="customer-list">
              {tab === 'payables' && payables.length > 0 && !search && (
                <div className="payables-summary">
                  <span>Toplam ödenecek:</span>
                  <strong>{totalPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {search ? '🔍' : tab === 'home' ? '✅' : tab === 'payables' ? '🎉' : '👥'}
                  </div>
                  <p>
                    {search
                      ? 'Aramanızla eşleşen kayıt bulunamadı.'
                      : tab === 'home'
                        ? 'Borçlu müşteri bulunmuyor. Tüm hesaplar temiz!'
                        : tab === 'payables'
                          ? 'Ödenecek borç bulunmuyor!'
                          : 'Henüz müşteri eklenmemiş.'}
                  </p>
                  {!search && tab === 'home' && (
                    <button className="btn btn--ghost btn--sm" onClick={() => setTab('customers')}>
                      Tüm Müşterileri Gör
                    </button>
                  )}
                  {!search && tab === 'customers' && (
                    <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
                      İlk Müşteriyi Ekle
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(customer => {
                  const isPayables = tab === 'payables';
                  return (
                    <div
                      key={customer.id}
                      className={`customer-card ${isPayables ? 'customer-card--payable' : customer.totalDebt === 0 ? 'customer-card--clear' : ''}`}
                      onClick={() => onSelectCustomer(customer.id)}
                    >
                      <div className="customer-avatar">
                        {customer.name[0]}{customer.surname[0]}
                      </div>
                      <div className="customer-info">
                        <div className="customer-name">{customer.name} {customer.surname}</div>
                        <div className="customer-phone">📞 {customer.phone}</div>
                        <div className="customer-meta">
                          {customer.transactions.length} işlem
                          {customer.transactions.length > 0 && (
                            <span> · Son: {new Date(customer.transactions[0].date).toLocaleDateString('tr-TR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="customer-debt-section">
                        <div className={`customer-debt ${isPayables ? 'debt--payable' : customer.totalDebt === 0 ? 'debt--clear' : 'debt--owed'}`}>
                          {isPayables
                            ? customer.totalDebt === 0
                              ? '✓ Borcumuz Yok'
                              : `${customer.totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ ödeyeceğiz`
                            : customer.totalDebt === 0
                              ? '✓ Borcu Yok'
                              : `${customer.totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
                        </div>
                        <button
                          className="btn-delete"
                          onClick={e => handleDelete(e, customer.id)}
                          title="Müşteriyi sil"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {tab === 'home' && (
          <div className="dashboard-right">
            <QuickNotes onTotalChange={setNotesTotal} />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={(data) => { addCustomer(data); setShowAddModal(false); }}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Müşteriyi Sil</h3>
            <p className="modal-desc">Bu müşteriyi ve tüm işlem geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
