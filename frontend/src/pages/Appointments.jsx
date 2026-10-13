import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge, { STATUS_LABELS } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';

const STATUSES = Object.keys(STATUS_LABELS);
const EMPTY_FORM = { patientId: '', appointmentDate: '', status: 'pending', reason: '', notes: '' };

export default function Appointments() {
  const [filters, setFilters] = useState({ date: '', status: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    const params = { page, limit: 20 };
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    api
      .get('/appointments', { params })
      .then((res) => setResult(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [filters, page]);

  useEffect(load, [load]);

  const setFilter = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
    setPage(1);
  };

  const changeStatus = async (a, status) => {
    setError('');
    try {
      await api.patch(`/appointments/${a.id}/status`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Rendez-vous</h2>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Nouveau rendez-vous</button>
      </div>
      {error && <div className="alert">{error}</div>}

      <div className="filters">
        <label>Date<input type="date" value={filters.date} onChange={setFilter('date')} /></label>
        <label>
          Statut
          <select value={filters.status} onChange={setFilter('status')}>
            <option value="">Tous</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <button className="btn" onClick={() => { setFilters({ date: '', status: '' }); setPage(1); }}>Réinitialiser</button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Patient</th><th>Motif</th><th>Statut</th><th>Changer le statut</th></tr>
          </thead>
          <tbody>
            {result.data.map((a) => (
              <tr key={a.id}>
                <td>{formatDateTime(a.appointmentDate)}</td>
                <td><Link to={`/patients/${a.patientId}`}>{a.patientName}</Link> <span className="muted">({a.patientCin})</span></td>
                <td>{a.reason}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  <select value={a.status} onChange={(e) => changeStatus(a, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {result.data.length === 0 && <tr><td colSpan={5} className="muted center">Aucun rendez-vous</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...result.pagination} onChange={setPage} />

      {creating && (
        <Modal title="Nouveau rendez-vous" onClose={() => setCreating(false)}>
          <AppointmentForm
            onCancel={() => setCreating(false)}
            onSaved={() => {
              setCreating(false);
              load();
            }}
          />
        </Modal>
      )}
    </>
  );
}

function AppointmentForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/patients', { params: { search: patientSearch, limit: 50 } })
        .then((res) => setPatients(res.data.data))
        .catch(() => setPatients([]));
    }, 250);
    return () => clearTimeout(t);
  }, [patientSearch]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/appointments', {
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        notes: form.notes || null,
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      {error && <div className="alert">{error}</div>}
      <label>
        Patient
        <input placeholder="Filtrer par nom ou CIN…" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
        <select value={form.patientId} onChange={set('patientId')} required>
          <option value="">— Sélectionner —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.cin})</option>)}
        </select>
      </label>
      <label>Date et heure<input type="datetime-local" value={form.appointmentDate} onChange={set('appointmentDate')} required /></label>
      <label>
        Statut
        <select value={form.status} onChange={set('status')}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </label>
      <label>Motif<input value={form.reason} onChange={set('reason')} required /></label>
      <label>Notes (optionnel)<textarea rows={3} value={form.notes} onChange={set('notes')} /></label>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Créer'}</button>
      </div>
    </form>
  );
}
