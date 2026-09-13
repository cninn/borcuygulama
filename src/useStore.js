import { useState, useEffect, useCallback, useRef } from 'react';

// Hem local hem Vercel'de çalışır — relative URL
const API = '/api';
// Modül düzeyinde cache — sayfa yenilenmediği sürece korunur
const cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000; // 60 saniye

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function sortAlpha(list) {
  return [...list].sort((a, b) =>
    `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`, 'tr')
  );
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('vd_token') || '';
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...extraHeaders,
    },
    ...rest,
  });
  if (res.status === 401) {
    localStorage.removeItem('vd_token');
    window.dispatchEvent(new Event('vd-logout'));
    throw new Error('Oturum süresi doldu.');
  }
  if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
  return res.json();
}

export function useStore() {
  const [customers, setCustomers] = useState(() => sortAlpha(cache.data ?? []));
  const [loading, setLoading] = useState(cache.data === null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const fetchCustomers = useCallback(async (force = false) => {
    // Cache geçerliyse ve zorla yenilemiyorsak API'ye gitme
    if (!force && cache.data !== null && Date.now() - cache.ts < CACHE_TTL) {
      setCustomers(sortAlpha(cache.data));
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await apiFetch('/customers');
      cache.data = data;
      cache.ts = Date.now();
      if (mountedRef.current) setCustomers(sortAlpha(data));
    } catch {
      if (mountedRef.current)
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  function _syncCache(updater) {
    // State ve cache'i birlikte güncelle
    setCustomers(prev => {
      const next = sortAlpha(updater(prev));
      cache.data = next;
      cache.ts = Date.now();
      return next;
    });
  }

  async function addCustomer({ name, surname, phone, isPayable = false }) {
    const customer = {
      id: generateId(),
      name,
      surname,
      phone,
      isPayable,
      totalDebt: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    await apiFetch('/customers', { method: 'POST', body: JSON.stringify(customer) });
    _syncCache(prev => [customer, ...prev]);
    return customer.id;
  }

  async function deleteCustomer(id) {
    await apiFetch(`/customers/${id}`, { method: 'DELETE' });
    _syncCache(prev => prev.filter(c => c.id !== id));
  }

  async function _updateCustomer(updated) {
    await apiFetch(`/customers/${updated.id}`, { method: 'PUT', body: JSON.stringify(updated) });
    _syncCache(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  async function addDebt(customerId, amount, note = '') {
    const customer = customers.find(c => c.id === customerId);
    const tx = {
      id: generateId(),
      type: 'debt',
      amount: Number(amount),
      note,
      date: new Date().toISOString(),
    };
    await _updateCustomer({
      ...customer,
      totalDebt: customer.totalDebt + Number(amount),
      transactions: [tx, ...customer.transactions],
    });
  }

  async function makePayment(customerId, amount, note = '') {
    const customer = customers.find(c => c.id === customerId);
    const paid = Math.min(Number(amount), customer.totalDebt);
    const tx = {
      id: generateId(),
      type: 'payment',
      amount: paid,
      note,
      date: new Date().toISOString(),
    };
    await _updateCustomer({
      ...customer,
      totalDebt: Math.max(0, customer.totalDebt - paid),
      transactions: [tx, ...customer.transactions],
    });
  }

  async function updateCustomer(id, { name, surname, phone, isPayable }) {
    const customer = customers.find(c => c.id === id);
    await _updateCustomer({ ...customer, name, surname, phone, isPayable });
  }

  async function clearHistory(customerId) {
    const customer = customers.find(c => c.id === customerId);
    await _updateCustomer({ ...customer, totalDebt: 0, transactions: [] });
  }

  return { customers, loading, error, addCustomer, deleteCustomer, addDebt, makePayment, updateCustomer, clearHistory };
}
