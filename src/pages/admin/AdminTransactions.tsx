import React, { useEffect, useState, useCallback } from "react";
import { getTransactions } from "../../api/admin";
import { Order } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

type OrderWithUser = Order & { user: { name: string; email: string } };
interface Meta { page: number; limit: number; total: number; totalPages: number; }
const LIMIT = 10;

export default function AdminTransactions() {
  const [orders, setOrders]   = useState<OrderWithUser[]>([]);
  const [meta, setMeta]       = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("ALL");
  const [search, setSearch]   = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (tab !== "ALL") params.status = tab;
    if (search) params.search = search;
    getTransactions(params)
      .then(r => { setOrders(r.data.data.data); setMeta(r.data.data.meta); })
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };
  const handleTab = (t: string) => { setTab(t); setSearch(""); setSearchInput(""); };

  const STATUS_TABS = ["ALL","PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1"><i className="bi bi-credit-card me-2 text-success" />Semua Transaksi</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} total transaksi</span>
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
                <input className="form-control border-start-0" placeholder="Cari nama / email..."
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
                  <tr><th>#</th><th>Customer</th><th>Total</th><th>Status Order</th><th>Pembayaran</th><th>Item</th><th>Tanggal</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-receipt d-block mb-2 fs-3" />Tidak ada transaksi ditemukan
                    </td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id}>
                      <td className="fw-bold" style={{ fontSize: ".875rem" }}>#{o.id}</td>
                      <td>
                        <div style={{ fontSize: ".875rem", fontWeight: 500 }}>{o.user?.name}</div>
                        <div className="text-muted" style={{ fontSize: ".775rem" }}>{o.user?.email}</div>
                      </td>
                      <td className="fw-bold" style={{ fontSize: ".875rem" }}>Rp {Number(o.total).toLocaleString("id-ID")}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>{o.payment ? <StatusBadge status={o.payment.status} /> : <span className="text-muted">-</span>}</td>
                      <td><span className="badge bg-light text-dark fw-normal">{o.items?.length || 0} item</span></td>
                      <td className="text-muted" style={{ fontSize: ".8rem" }}>
                        {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
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
