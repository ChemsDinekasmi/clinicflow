const LABELS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}

export { LABELS as STATUS_LABELS };
