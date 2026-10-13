import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime } from '../utils/format';

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get('/appointments', { params: { patientId: id, limit: 100 } }),
    ])
      .then(([p, a]) => {
        setPatient(p.data);
        setAppointments(a.data.data);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <div className="alert">{error}</div>;
  if (!patient) return <div className="center">Chargement…</div>;

  return (
    <>
      <Link to="/patients" className="back">← Patients</Link>
      <div className="page-header">
        <h2>{patient.fullName}</h2>
        <button className="btn" onClick={() => setEditing(true)}>Modifier</button>
      </div>
      <div className="card details">
        <div><span>CIN</span>{patient.cin}</div>
        <div><span>Téléphone</span>{patient.phone}</div>
        <div><span>Date de naissance</span>{formatDate(patient.birthDate)}</div>
        <div><span>Adresse</span>{patient.address || '—'}</div>
        <div><span>Créé le</span>{formatDateTime(patient.createdAt)}</div>
      </div>

      <h3>Rendez-vous</h3>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Motif</th><th>Statut</th><th>Notes</th><th>Créé par</th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{formatDateTime(a.appointmentDate)}</td>
                <td>{a.reason}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>{a.notes || '—'}</td>
                <td>{a.createdByName}</td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan={5} className="muted center">Aucun rendez-vous</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Modifier le patient" onClose={() => setEditing(false)}>
          <PatientForm
            patient={patient}
            onCancel={() => setEditing(false)}
            onSaved={(p) => {
              setPatient(p);
              setEditing(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}
