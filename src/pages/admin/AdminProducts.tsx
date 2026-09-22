import React, { useEffect, useState, useCallback } from "react";
import { getAdminProducts } from "../../api/admin";
import { Product } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

interface Meta { page: number; limit: number; total: number; totalPages: number; }
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LIMIT = 12;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta]         = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("ALL");
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (tab !== "ALL") params.status = tab;
    if (search) params.search = search;
    getAdminProducts(params)
      .then(r => { setProducts(r.data.data.data); setMeta(r.data.data.meta); })
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };
  const handleTab = (t: string) => { setTab(t); setSearch(""); setSearchInput(""); };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1"><i className="bi bi-box-seam me-2 text-success" />Semua Produk</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} produk di platform</span>
          </div>
        </div>

        {/* Filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex gap-1">
              {["ALL","ACTIVE","INACTIVE"].map(t => (
                <button key={t} className={`btn btn-sm fw-semibold ${tab === t ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handleTab(t)} style={{ fontSize: ".8rem" }}>
                  {t === "ALL" ? "Semua" : <StatusBadge status={t} />}
                </button>
              ))}
            </div>
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <div className="input-group input-group-sm" style={{ width: 280 }}>
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                <input className="form-control border-start-0" placeholder="Cari produk / toko..."
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
                  <tr><th>#</th><th>Produk</th><th>Toko</th><th>Harga</th><th>Stok</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-box d-block mb-2 fs-3" />Tidak ada produk ditemukan
                    </td></tr>
                  ) : products.map(p => {
                    const img = p.imageUrl ? (p.imageUrl.startsWith("http") ? p.imageUrl : `${API}${p.imageUrl}`) : null;
                    return (
                      <tr key={p.id}>
                        <td className="text-muted" style={{ fontSize: ".8rem" }}>{p.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#f8f9fa", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: "1.2rem" }}>📦</span>}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{p.name}</div>
                              {p.description && <div className="text-muted" style={{ fontSize: ".775rem", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: ".875rem" }}>{p.store?.name}</td>
                        <td className="fw-semibold" style={{ fontSize: ".875rem" }}>Rp {Number(p.price).toLocaleString("id-ID")}</td>
                        <td>
                          <span className={`fw-semibold ${p.stock === 0 ? "text-danger" : p.stock <= 5 ? "text-warning" : "text-success"}`}>{p.stock}</span>
                          {p.stock === 0 && <span className="ms-1 badge bg-danger" style={{ fontSize: 10 }}>Habis</span>}
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                      </tr>
                    );
                  })}
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
