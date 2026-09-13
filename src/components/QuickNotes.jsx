import { useState, useEffect } from 'react';

const API = '/api';
const noteCache = { data: null };

function authFetch(url, options = {}) {
  const token = localStorage.getItem('vd_token') || '';
  const { headers: extraHeaders, ...rest } = options;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...extraHeaders,
    },
    ...rest,
  }).then(res => {
    if (res.status === 401) {
      localStorage.removeItem('vd_token');
      window.dispatchEvent(new Event('vd-logout'));
    }
    return res;
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const COLORS = [
  { bg: '#fef9c3', border: '#fde047', text: '#713f12' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#831843' },
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e3a5f' },
  { bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#4c1d95' },
  { bg: '#ffedd5', border: '#fdba74', text: '#7c2d12' },
];

function cardColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function AddNoteModal({ onClose, onAdd, initialNote }) {
  const isEdit = Boolean(initialNote);
  const [form, setForm] = useState({
    name: initialNote?.name ?? '',
    surname: initialNote?.surname ?? '',
    amount: initialNote?.amount ?? '',
    note: initialNote?.note ?? '',
  });
  // 'set' = doğrudan yeni değer, 'add' = üstüne ekle, 'sub' = azalt
  const [mode, setMode] = useState('set');
  const [delta, setDelta] = useState('');
  const [errors, setErrors] = useState({});

  const currentAmount = initialNote?.amount ?? 0;
  const deltaVal = parseFloat(String(delta).replace(',', '.')) || 0;
  const preview = mode === 'add'
    ? currentAmount + deltaVal
    : mode === 'sub'
      ? Math.max(0, currentAmount - deltaVal)
      : null;

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'İsim gerekli';
    if (mode === 'set') {
      if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
        errs.amount = 'Geçerli tutar girin';
    } else {
      if (!delta || isNaN(deltaVal) || deltaVal <= 0)
        errs.delta = 'Geçerli tutar girin';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const finalAmount = mode === 'set'
      ? parseFloat(form.amount)
      : preview;
    onAdd({
      name: form.name.trim(),
      surname: form.surname.trim(),
      amount: finalAmount,
      note: form.note.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '✏️ Notu Düzenle' : '📝 Hızlı Not Ekle'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">İsim *</label>
              <input
                className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                placeholder="İsim"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                autoFocus
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Soyisim</label>
              <input
                className="form-input"
                placeholder="Soyisim"
                value={form.surname}
                onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
              />
            </div>
          </div>

          {/* Düzenleme modunda mod seçici göster */}
          {isEdit && (
            <div className="amount-mode-bar">
              <span className="amount-mode-current">
                Mevcut: <strong>{currentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
              </span>
              <div className="amount-mode-btns">
                <button type="button" className={`mode-btn ${mode === 'set' ? 'mode-btn--active' : ''}`} onClick={() => { setMode('set'); setDelta(''); setErrors({}); }}>Değiştir</button>
                <button type="button" className={`mode-btn mode-btn--add ${mode === 'add' ? 'mode-btn--active' : ''}`} onClick={() => { setMode('add'); setErrors({}); }}>+ Ekle</button>
                <button type="button" className={`mode-btn mode-btn--sub ${mode === 'sub' ? 'mode-btn--active' : ''}`} onClick={() => { setMode('sub'); setErrors({}); }}>− Çıkar</button>
              </div>
            </div>
          )}

          {(mode === 'set' || !isEdit) ? (
            <div className="form-group">
              <label className="form-label">Tutar (₺) *</label>
              <div className="input-with-unit">
                <input
                  className={`form-input ${errors.amount ? 'form-input--error' : ''}`}
                  placeholder="0,00"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(er => ({ ...er, amount: '' })); }}
                />
                <span className="input-unit">₺</span>
              </div>
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">{mode === 'add' ? 'Eklenecek Tutar (₺) *' : 'Çıkarılacak Tutar (₺) *'}</label>
              <div className="input-with-unit">
                <input
                  className={`form-input ${errors.delta ? 'form-input--error' : ''}`}
                  placeholder="0,00"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={delta}
                  onChange={e => { setDelta(e.target.value); setErrors(er => ({ ...er, delta: '' })); }}
                  autoFocus
                />
                <span className="input-unit">₺</span>
              </div>
              {errors.delta && <span className="form-error">{errors.delta}</span>}
              {deltaVal > 0 && (
                <div className={`amount-preview ${mode === 'add' ? 'amount-preview--add' : 'amount-preview--sub'}`}>
                  {mode === 'add' ? `${currentAmount.toLocaleString('tr-TR', {minimumFractionDigits:2})} + ${deltaVal.toLocaleString('tr-TR', {minimumFractionDigits:2})}` : `${currentAmount.toLocaleString('tr-TR', {minimumFractionDigits:2})} − ${deltaVal.toLocaleString('tr-TR', {minimumFractionDigits:2})}`}
                  {' = '}
                  <strong>{preview.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Not (opsiyonel)</label>
            <input
              className="form-input"
              placeholder="Ürün veya açıklama..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--primary">{isEdit ? 'Kaydet' : 'Not Ekle'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuickNotes({ onTotalChange }) {
  const [notes, setNotes] = useState(noteCache.data ?? []);
  const [loading, setLoading] = useState(noteCache.data === null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Notlar değiştiğinde toplam tutarı parent'a bildir
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(notes.reduce((s, n) => s + n.amount, 0));
    }
  }, [notes, onTotalChange]);

  useEffect(() => {
    if (noteCache.data !== null) return;
    authFetch(`${API}/notes`)
      .then(r => r.json())
      .then(data => { noteCache.data = data; setNotes(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(data) {
    const note = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    noteCache.data = updated;
    setNotes(updated);
    setShowAddModal(false);
    try {
      await authFetch(`${API}/notes`, {
        method: 'POST',
        body: JSON.stringify(note),
      });
    } catch {
      noteCache.data = notes;
      setNotes(notes);
    }
  }

  async function handleDelete(id) {
    setDeleteConfirm(null);
    const prev = notes;
    const updated = notes.filter(n => n.id !== id);
    noteCache.data = updated;
    setNotes(updated);
    try {
      await authFetch(`${API}/notes/${id}`, { method: 'DELETE' });
    } catch {
      noteCache.data = prev;
      setNotes(prev);
    }
  }

  async function handleEdit(data) {
    const updated = notes.map(n => n.id === editNote.id ? { ...n, ...data } : n);
    noteCache.data = updated;
    setNotes(updated);
    setEditNote(null);
    try {
      await authFetch(`${API}/notes/${editNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editNote, ...data }),
      });
    } catch {
      noteCache.data = notes;
      setNotes(notes);
    }
  }

  const totalNoteDebt = notes.reduce((s, n) => s + n.amount, 0);

  return (
    <div className="qn-panel">
      {/* Panel Header */}
      <div className="qn-panel-header">
        <div>
          <h2 className="qn-title">📝 Hızlı Not</h2>
          <p className="qn-subtitle">Günlük kısa borç notları</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowAddModal(true)}>
          + Not Ekle
        </button>
      </div>

      {notes.length > 0 && (
        <div className="qn-summary">
          <span className="qn-summary-count">{notes.length} not</span>
          <span className="qn-summary-sep">·</span>
          <span className="qn-summary-total">{totalNoteDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
        </div>
      )}

      {/* Cards */}
      <div className="qn-scrollable">
        {loading ? (
          <div className="qn-loading"><div className="loading-spinner" /></div>
        ) : notes.length === 0 ? (
          <div className="qn-empty">
            <div style={{ fontSize: 36, marginBottom: 8 }}>🗒️</div>
            <p>Henüz not eklenmemiş.</p>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowAddModal(true)} style={{ marginTop: 10 }}>
              İlk Notu Ekle
            </button>
          </div>
        ) : (
          <div className="qn-cards">
            {notes.map(note => {
              const color = cardColor(note.id);
              return (
                <div
                  key={note.id}
                  className="qn-card"
                  style={{ background: color.bg, borderColor: color.border, color: color.text, cursor: 'pointer' }}
                  onClick={() => setEditNote(note)}
                >
                  <button
                    className="qn-card-del"
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(note.id); }}
                    title="Notu sil"
                    style={{ color: color.text }}
                  >
                    ✕
                  </button>
                  <div className="qn-card-name">
                    {note.name}{note.surname ? ` ${note.surname}` : ''}
                  </div>
                  <div className="qn-card-amount">
                    {note.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </div>
                  {note.note && <div className="qn-card-note">{note.note}</div>}
                  <div className="qn-card-date">
                    {new Date(note.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddNoteModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}

      {editNote && (
        <AddNoteModal onClose={() => setEditNote(null)} onAdd={handleEdit} initialNote={editNote} />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Notu Sil</h3>
            <p className="modal-desc">Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm)}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


