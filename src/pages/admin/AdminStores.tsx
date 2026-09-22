import React, { useEffect, useState, useCallback } from "react";
import { getAdminStores, updateStore } from "../../api/admin";
import { Store } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

interface Meta { page: number; limit: number; total: number; totalPages: number; }
const LIMIT = 10;

export default function AdminStores() {
  const [stores, setStores]   = useState<Store[]>([]);
  const [meta, setMeta]       = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("ALL");
  const [search, setSearch]   = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (tab !== "ALL") params.status = tab;
    if (search) params.search = search;
    getAdminStores(params)
      .then(r => { setStores(r.data.data.data); setMeta(r.data.data.meta); })
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };
  const handleTab = (t: string) => { setTab(t); setSearch(""); setSearchInput(""); };

  const handleStatus = async (id: number, status: string) => {
    try { await updateStore(id, { status }); showToast(`Status toko → ${status}`); load(meta.page); }
    catch { showToast("Gagal update", false); }
  };

  const STATUS_TABS = ["ALL","PENDING","APPROVED","REJECTED","SUSPENDED"];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && (
        <div className={`toast-fixed toast show border-0 text-white ${toast.ok ? "bg-success" : "bg-danger"}`}>
          <div className="d-flex">
            <div className="toast-body fw-semibold"><i className={`bi ${toast.ok ? "bi-check-circle" : "bi-x-circle"} me-2`} />{toast.msg}</div>
            <button className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      <div className="container-xl py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1"><i className="bi bi-shop me-2 text-success" />Kelola Toko</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} toko terdaftar</span>
          </div>
        </div>

        {/* Filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex gap-1 flex-wrap">
              {STATUS_TABS.map(t => (
                <button key={t} className={`btn btn-sm fw-semibold ${tab === t ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handleTab(t)} style={{ fontSize: ".8rem" }}>
                  {t === "ALL" ? "Semua" : <StatusBadge status={t} />}
                </button>
              ))}
            </div>
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <div className="input-group input-group-sm" style={{ width: 260 }}>
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                <input className="form-control border-start-0" placeholder="Cari toko / seller..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              </div>
              <button className="btn btn-sm btn-primary" type="submit">Cari</button>
              {search && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => { setSearch(""); setSearchInput(""); }}>✕</button>}
            </form>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr><th>#</th><th>Toko</th><th>Seller</th><th>Produk</th><th>Status</th><th style={{ width: 200 }}>Aksi</th></tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-shop d-block mb-2 fs-3" />Tidak ada toko ditemukan
                    </td></tr>
                  ) : stores.map(s => (
                    <tr key={s.id}>
                      <td className="text-muted" style={{ fontSize: ".8rem" }}>{s.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle flex-shrink-0" style={{ background: "#e8f9e9", color: "#198754" }}>
                            {s.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{s.name}</div>
                            {s.description && <div className="text-muted" style={{ fontSize: ".775rem", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: ".875rem", fontWeight: 500 }}>{s.seller?.name}</div>
                        <div className="text-muted" style={{ fontSize: ".775rem" }}>{s.seller?.email}</div>
                      </td>
                      <td><span className="badge bg-light text-dark fw-semibold">{s._count?.products || 0}</span></td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {s.status === "PENDING" && (
                            <>
                              <button className="btn btn-sm btn-success fw-semibold" onClick={() => handleStatus(s.id, "APPROVED")}>
                                <i className="bi bi-check-lg me-1" />Approve
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatus(s.id, "REJECTED")}>
                                <i className="bi bi-x-lg me-1" />Reject
                              </button>
                            </>
                          )}
                          {s.status === "APPROVED" && (
                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleStatus(s.id, "SUSPENDED")}>
                              <i className="bi bi-pause-circle me-1" />Suspend
                            </button>
                          )}
                          {(s.status === "REJECTED" || s.status === "SUSPENDED") && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleStatus(s.id, "APPROVED")}>
                              <i className="bi bi-check-circle me-1" />Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white px-3 py-2">
              <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPage={p => load(p)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
