import { useState } from 'react';

export default function EditCustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({
    name: customer.name,
    surname: customer.surname,
    phone: customer.phone,
    isPayable: customer.isPayable ?? false,
  });
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
    onSave({ name: form.name.trim(), surname: form.surname.trim(), phone: form.phone.trim(), isPayable: form.isPayable });
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
          <h2 className="modal-title">✏️ Müşteri Düzenle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {field('name', 'İsim', 'Ahmet')}
          {field('surname', 'Soyisim', 'Yılmaz')}
          {field('phone', 'Telefon', '0532 123 45 67', 'tel')}
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.isPayable}
                onChange={e => setForm(f => ({ ...f, isPayable: e.target.checked }))}
              />
              <span>Bu kişiye ait borçlar toplam borca dahil edilmesin</span>
            </label>
            {form.isPayable && (
              <p className="form-hint">Bu kişi “Ödenecekler” listesinde görünür; borçları toplam alacağı etkilemez.</p>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--primary">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
