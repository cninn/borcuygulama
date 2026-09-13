import { useState } from 'react';

export default function AddCustomerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', surname: '', phone: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'İsim zorunludur.';
    if (!form.surname.trim()) errs.surname = 'Soyisim zorunludur.';
    if (!form.phone.trim()) errs.phone = 'Telefon zorunludur.';
    else if (!/^[0-9\s\-()+]{7,15}$/.test(form.phone.trim()))
      errs.phone = 'Geçerli bir telefon numarası girin.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onAdd({ name: form.name.trim(), surname: form.surname.trim(), phone: form.phone.trim() });
  }

  function field(key, label, placeholder, type = 'text') {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <input
          className={`form-input ${errors[key] ? 'form-input--error' : ''}`}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
        />
        {errors[key] && <span className="form-error">{errors[key]}</span>}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">👤 Yeni Müşteri Ekle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {field('name', 'İsim', 'Ahmet')}
          {field('surname', 'Soyisim', 'Yılmaz')}
          {field('phone', 'Telefon', '0532 123 45 67', 'tel')}
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--primary">Ekle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
