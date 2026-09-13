import { useState } from 'react';

export default function PaymentModal({ customerName, totalDebt, onClose, onPay }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function setFull() {
    setAmount(totalDebt.toFixed(2));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(val) || val <= 0) {
      setError('Geçerli bir tutar girin.');
      return;
    }
    if (val > totalDebt) {
      setError(`Ödeme tutarı toplam borçtan (${totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺) fazla olamaz.`);
      return;
    }
    onPay(val, note.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💸 Ödeme Al</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">Müşteri: <strong>{customerName}</strong></p>
        <div className="debt-info-box">
          <span>Mevcut Borç:</span>
          <strong>{totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ödeme Tutarı (₺)</label>
            <div className="input-with-unit">
              <input
                className={`form-input ${error ? 'form-input--error' : ''}`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); }}
                autoFocus
              />
              <span className="input-unit">₺</span>
            </div>
            {error && <span className="form-error">{error}</span>}
            <button type="button" className="btn-full-pay" onClick={setFull}>
              Tamamını Öde ({totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺)
            </button>
          </div>
          <div className="form-group">
            <label className="form-label">Not (isteğe bağlı)</label>
            <input
              className="form-input"
              type="text"
              placeholder="Örn: Nakit ödeme"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--success">Ödemeyi Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
