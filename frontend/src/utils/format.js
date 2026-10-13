export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export const formatDate = (ymd) => (ymd ? new Date(`${ymd}T00:00:00`).toLocaleDateString('fr-FR') : '');
