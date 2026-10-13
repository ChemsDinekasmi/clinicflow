import { useState } from 'react';
import api, { errorMessage } from '../api/client';

const EMPTY = { fullName: '', cin: '', phone: '', birthDate: '', address: '' };

export default function PatientForm({ patient, onSaved, onCancel }) {
  const [form, setForm] = useState(patient ? { ...EMPTY, ...patient, address: patient.address || '' } : EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      fullName: form.fullName,
      cin: form.cin,
      phone: form.phone,
      birthDate: form.birthDate,
      address: form.address || null,
    };
    try {
      const { data } = patient
        ? await api.put(`/patients/${patient.id}`, payload)
        : await api.post('/patients', payload);
      onSaved(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      {error && <div className="alert">{error}</div>}
      <label>Nom complet<input value={form.fullName} onChange={set('fullName')} required /></label>
      <label>CIN<input value={form.cin} onChange={set('cin')} required /></label>
      <label>Téléphone<input value={form.phone} onChange={set('phone')} required /></label>
      <label>Date de naissance<input type="date" value={form.birthDate} onChange={set('birthDate')} required /></label>
      <label>Adresse (optionnel)<input value={form.address} onChange={set('address')} /></label>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
