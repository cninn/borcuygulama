import { useState } from 'react';

export default function DebtModal({ customerName, onClose, onAdd }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(val) || val <= 0) {
      setError('Geçerli bir tutar girin.');
      return;
    }
    onAdd(val, note.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📤 Borç Ekle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">Müşteri: <strong>{customerName}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tutar (₺)</label>
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
          </div>
          <div className="form-group">
            <label className="form-label">Not (isteğe bağlı)</label>
            <input
              className="form-input"
              type="text"
              placeholder="Örn: Ekmek, süt, peynir"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--primary">Borç Ekle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
