import React, { useEffect, useState, useCallback } from "react";
import { getUsers, updateUser, deleteUser } from "../../api/admin";
import { User } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

interface Meta { page: number; limit: number; total: number; totalPages: number; }

const LIMIT = 10;

export default function AdminUsers() {
  const [users, setUsers]     = useState<User[]>([]);
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
    if (tab !== "ALL") params.role = tab;
    if (search) params.search = search;
    getUsers(params)
      .then(r => { setUsers(r.data.data.data); setMeta(r.data.data.meta); })
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };
  const handleTab = (t: string) => { setTab(t); setSearch(""); setSearchInput(""); };

  const handleSuspend = async (u: User) => {
    try {
      await updateUser(u.id, { suspended: !u.suspended });
      showToast(`User ${u.suspended ? "diaktifkan" : "disuspend"}`);
      load(meta.page);
    } catch { showToast("Gagal update", false); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Hapus user "${u.name}"?`)) return;
    try { await deleteUser(u.id); showToast("User dihapus"); load(meta.page); }
    catch { showToast("Gagal hapus", false); }
  };

  const TABS = ["ALL","CUSTOMER","SELLER","ADMIN"];

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
            <h4 className="fw-bold mb-1"><i className="bi bi-people me-2 text-success" />Kelola User</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} user terdaftar</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex gap-1 flex-wrap">
              {TABS.map(t => (
                <button key={t} className={`btn btn-sm fw-semibold ${tab === t ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handleTab(t)} style={{ fontSize: ".8rem" }}>
                  {t === "ALL" ? "Semua" : t}
                </button>
              ))}
            </div>
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <div className="input-group input-group-sm" style={{ width: 260 }}>
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                <input className="form-control border-start-0" placeholder="Cari nama / email..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              </div>
              <button className="btn btn-sm btn-primary" type="submit">Cari</button>
              {search && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => { setSearch(""); setSearchInput(""); }}>✕</button>}
            </form>
          </div>
        </div>

        {/* Table */}
        {loading ? <Spinner /> : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr><th>#</th><th>User</th><th>Role</th><th>Status</th><th style={{ width: 180 }}>Aksi</th></tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">
                      <i className="bi bi-people d-block mb-2 fs-3" />Tidak ada user ditemukan
                    </td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td className="text-muted" style={{ fontSize: ".8rem" }}>{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle flex-shrink-0"
                            style={{ background: u.role === "ADMIN" ? "#e8f9e9" : u.role === "SELLER" ? "#f3e8ff" : "#e8f0fe",
                              color: u.role === "ADMIN" ? "#198754" : u.role === "SELLER" ? "#6f42c1" : "#0d6efd" }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{u.name}</div>
                            <div className="text-muted" style={{ fontSize: ".775rem" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge fw-semibold"
                          style={{ background: u.role === "ADMIN" ? "#198754" : u.role === "SELLER" ? "#6f42c1" : "#0d6efd", color: "#fff" }}>
                          {u.role}
                        </span>
                      </td>
                      <td><StatusBadge status={u.suspended ? "SUSPENDED" : "ACTIVE"} /></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className={`btn btn-sm ${u.suspended ? "btn-outline-success" : "btn-outline-warning"}`}
                            onClick={() => handleSuspend(u)}>
                            <i className={`bi ${u.suspended ? "bi-person-check" : "bi-person-slash"} me-1`} />
                            {u.suspended ? "Aktifkan" : "Suspend"}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u)}>
                            <i className="bi bi-trash" />
                          </button>
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
