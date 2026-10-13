export default function Pagination({ page, totalPages, total, onChange }) {
  return (
    <div className="pagination">
      <span>{total} résultat(s)</span>
      <div>
        <button className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Préc.</button>
        <span className="page-info">Page {page} / {totalPages}</span>
        <button className="btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Suiv. ›</button>
      </div>
    </div>
  );
}
