import { useState } from 'react';
import { useStore } from '../useStore';
import DebtModal from './DebtModal';
import PaymentModal from './PaymentModal';
import EditCustomerModal from './EditCustomerModal';

export default function CustomerDetail({ customerId, onBack, onLogout }) {
  const { customers, addDebt, makePayment, updateCustomer, clearHistory, loading } = useStore();
  const customer = customers.find(c => c.id === customerId);

  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <p>Müşteri bulunamadı.</p>
          <button className="btn btn--primary" onClick={onBack}>Geri Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <button className="breadcrumb-link" onClick={onBack}>🛒 Ana Menü</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{customer.name} {customer.surname}</span>
      </nav>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>← Geri</button>
          <div className="detail-avatar">
            {customer.name[0]}{customer.surname[0]}
          </div>
          <div>
            <h1 className="logo-title">{customer.name} {customer.surname}</h1>
            <p className="logo-sub">📞 {customer.phone}</p>
          </div>
          <button className="btn btn--sm btn--ghost btn--edit-info" onClick={() => setShowEditModal(true)} title="Müşteri bilgilerini düzenle">
            ✏️ Düzenle
          </button>
        </div>
        <div className="header-right">
          <div className={`stat-card ${customer.totalDebt === 0 ? 'stat-card--success' : 'stat-card--danger'}`}>
            <span className="stat-label">{customer.isPayable ? 'Ödeyeceğimiz' : 'Toplam Borç'}</span>
            <span className="stat-value">
              {customer.totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Çıkış Yap">🚪 Çıkış</button>
        </div>
      </header>

      {/* Actions */}
      <div className="toolbar">
        <div className="debt-status">
          {customer.totalDebt === 0 ? (
            <span className="badge badge--success">✓ Borcu bulunmuyor</span>
          ) : (
            <span className="badge badge--danger">Borçlu</span>
          )}
        </div>
        <div className="action-group">
          {customer.transactions.length > 0 && (
            <button className="btn btn--sm btn--ghost btn--clear" onClick={() => setShowClearConfirm(true)}>
              🗑 Geçmişi Temizle
            </button>
          )}
          <button className="btn btn--danger-soft" onClick={() => setShowPaymentModal(true)} disabled={customer.totalDebt === 0}>
            💸 Ödeme Al
          </button>
          <button className="btn btn--primary" onClick={() => setShowDebtModal(true)}>
            + Borç Ekle
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="customer-list">
        <div className="section-title">İşlem Geçmişi</div>
        {customer.transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Henüz işlem bulunmuyor.</p>
          </div>
        ) : (
          customer.transactions.map(tx => (
            <div key={tx.id} className={`tx-card ${tx.type === 'debt' ? 'tx-card--debt' : 'tx-card--payment'}`}>
              <div className="tx-icon">
                {tx.type === 'debt' ? '📤' : '📥'}
              </div>
              <div className="tx-info">
                <div className="tx-type">{tx.type === 'debt' ? 'Veresiye' : 'Ödeme'}</div>
                {tx.note && <div className="tx-note">{tx.note}</div>}
                <div className="tx-date">{new Date(tx.date).toLocaleString('tr-TR')}</div>
              </div>
              <div className={`tx-amount ${tx.type === 'debt' ? 'tx-amount--debt' : 'tx-amount--payment'}`}>
                {tx.type === 'debt' ? '+' : '-'}{tx.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </div>
            </div>
          ))
        )}
      </div>

      {showDebtModal && (
        <DebtModal
          customerName={`${customer.name} ${customer.surname}`}
          onClose={() => setShowDebtModal(false)}
          onAdd={(amount, note) => { addDebt(customer.id, amount, note); setShowDebtModal(false); }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          customerName={`${customer.name} ${customer.surname}`}
          totalDebt={customer.totalDebt}
          onClose={() => setShowPaymentModal(false)}
          onPay={(amount, note) => { makePayment(customer.id, amount, note); setShowPaymentModal(false); }}
        />
      )}

      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => { updateCustomer(customer.id, data); setShowEditModal(false); }}
        />
      )}

      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🗑 Geçmişi Temizle</h2>
              <button className="modal-close" onClick={() => setShowClearConfirm(false)}>✕</button>
            </div>
            <p className="modal-desc">
              <strong>{customer.name} {customer.surname}</strong> adlı müşterinin tüm işlem geçmişi ve toplam borcu sıfırlanacak. Bu işlem geri alınamaz.
            </p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setShowClearConfirm(false)}>İptal</button>
              <button className="btn btn--danger" onClick={() => { clearHistory(customer.id); setShowClearConfirm(false); }}>Evet, Temizle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
