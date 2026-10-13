import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import PatientForm from '../components/PatientForm';
import { formatDate } from '../utils/format';

const LIMIT = 10;

export default function Patients() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = fermé, null = création, objet = édition

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    api
      .get('/patients', { params: { search: debounced, page, limit: LIMIT } })
      .then((res) => setResult(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [debounced, page]);

  useEffect(load, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Supprimer le patient ${p.fullName} ?`)) return;
    try {
      await api.delete(`/patients/${p.id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Patients</h2>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>+ Nouveau patient</button>
      </div>
      {error && <div className="alert">{error}</div>}
      <input
        className="search"
        placeholder="Rechercher par nom ou CIN…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Nom</th><th>CIN</th><th>Téléphone</th><th>Naissance</th><th></th></tr>
          </thead>
          <tbody>
            {result.data.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/patients/${p.id}`}>{p.fullName}</Link></td>
                <td>{p.cin}</td>
                <td>{p.phone}</td>
                <td>{formatDate(p.birthDate)}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => setEditing(p)}>Modifier</button>
                  {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>Supprimer</button>}
                </td>
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr><td colSpan={5} className="muted center">Aucun patient</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination {...result.pagination} onChange={setPage} />

      {editing !== undefined && (
        <Modal title={editing ? 'Modifier le patient' : 'Nouveau patient'} onClose={() => setEditing(undefined)}>
          <PatientForm
            patient={editing}
            onCancel={() => setEditing(undefined)}
            onSaved={() => {
              setEditing(undefined);
              load();
            }}
          />
        </Modal>
      )}
    </>
  );
}
