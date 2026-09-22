import React from "react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPage }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page window: always show first, last, current ±2
  const pages: (number | "...")[] = [];
  const add = new Set<number>();
  [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].forEach(n => {
    if (n >= 1 && n <= totalPages) add.add(n);
  });
  const sorted = [...add].sort((a, b) => a - b);
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) pages.push("...");
    pages.push(n);
  });

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 px-1">
      <div className="text-muted" style={{ fontSize: ".8rem" }}>
        Menampilkan <strong>{from}–{to}</strong> dari <strong>{total}</strong> data
      </div>
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(1)} title="Pertama">
              <i className="bi bi-chevron-double-left" />
            </button>
          </li>
          <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(page - 1)}>
              <i className="bi bi-chevron-left" />
            </button>
          </li>
          {pages.map((p, i) =>
            p === "..." ? (
              <li key={`ellipsis-${i}`} className="page-item disabled">
                <span className="page-link">…</span>
              </li>
            ) : (
              <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                <button className="page-link" onClick={() => onPage(p as number)}>{p}</button>
              </li>
            )
          )}
          <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(page + 1)}>
              <i className="bi bi-chevron-right" />
            </button>
          </li>
          <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(totalPages)} title="Terakhir">
              <i className="bi bi-chevron-double-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
