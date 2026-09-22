import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyStore, createStore, getMyProducts, getSellerOrders, getReport } from "../../api/seller";
import { Store } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";

interface ReportData { totalRevenue: number; totalOrders: number; items: Array<{ order: { createdAt: string }; price: number | string; quantity: number }> }

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [store, setStore]           = useState<Store | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [report, setReport]         = useState<ReportData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [noStore, setNoStore]       = useState(false);
  const [form, setForm]             = useState({ name: "", description: "" });
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    getMyStore()
      .then(r => {
        setStore(r.data.data);
        return Promise.all([getMyProducts({ limit: 1 }), getSellerOrders({ limit: 1 }), getReport()]);
      })
      .then(([pr, or, rep]) => {
        setProductCount(pr.data.data.meta?.total ?? pr.data.data.data?.length ?? 0);
        setOrderCount(or.data.data.meta?.total ?? or.data.data.data?.length ?? 0);
        setReport(rep.data.data);
      })
      .catch(() => setNoStore(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError("");
    try {
      const r = await createStore(form);
      setStore(r.data.data);
      setNoStore(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Gagal buat toko");
    } finally { setCreating(false); }
  };

  if (loading) return <Spinner />;

  // No store yet
  if (noStore) return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: 560 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: "3.5rem" }}>🏪</div>
          <h4 className="fw-bold mt-2">Buka Toko Kamu</h4>
          <p className="text-muted">Buat toko untuk mulai berjualan di TokoKita</p>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nama Toko <span className="text-danger">*</span></label>
                <input className="form-control" placeholder="Nama toko kamu" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Deskripsi Toko</label>
                <textarea className="form-control" rows={3} placeholder="Ceritakan tentang tokomu..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary w-100 fw-semibold py-2" disabled={creating}>
                {creating ? <><span className="spinner-border spinner-border-sm me-2" />Membuat...</> : <><i className="bi bi-shop me-2" />Buat Toko</>}
              </button>
            </form>
          </div>
        </div>
        <div className="alert alert-info mt-3 d-flex gap-2" style={{ fontSize: ".85rem" }}>
          <i className="bi bi-info-circle-fill flex-shrink-0 mt-1" />
          <span>Toko baru perlu disetujui admin sebelum kamu bisa menambahkan produk.</span>
        </div>
      </div>
    </div>
  );

  // Revenue by day (last 7 days) for mini chart
  const last7: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    last7[d.toISOString().slice(0, 10)] = 0;
  }
  report?.items.forEach(item => {
    const day = new Date(item.order.createdAt).toISOString().slice(0, 10);
    if (last7[day] !== undefined) last7[day] += Number(item.price) * item.quantity;
  });
  const chartMax = Math.max(...Object.values(last7), 1);
  const chartDays = Object.entries(last7);

  const pendingOrders = orderCount;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">

        {/* Page header */}
        <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1">Dashboard Seller</h4>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shop text-success" />
              <span className="fw-semibold">{store?.name}</span>
              {store && <StatusBadge status={store.status} />}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/seller/products" className="btn btn-primary btn-sm fw-semibold">
              <i className="bi bi-plus-lg me-1" />Tambah Produk
            </Link>
            <Link to="/seller/orders" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-receipt me-1" />Lihat Order
            </Link>
          </div>
        </div>

        {store?.status === "PENDING" && (
          <div className="alert alert-warning d-flex gap-2 mb-4">
            <i className="bi bi-hourglass-split flex-shrink-0 mt-1" />
            <div><strong>Toko dalam review.</strong> Admin sedang memverifikasi tokomu. Kamu belum bisa menambahkan produk.</div>
          </div>
        )}
        {store?.status === "REJECTED" && (
          <div className="alert alert-danger d-flex gap-2 mb-4">
            <i className="bi bi-x-circle-fill flex-shrink-0 mt-1" />
            <div><strong>Toko ditolak.</strong> Hubungi admin untuk informasi lebih lanjut.</div>
          </div>
        )}

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Produk", value: productCount, icon: "bi-box-seam", color: "#0d6efd", bg: "#e8f0fe", border: "#0d6efd", link: "/seller/products" },
            { label: "Total Order", value: orderCount,   icon: "bi-receipt",   color: "#198754", bg: "#e8f9e9", border: "#198754", link: "/seller/orders" },
            { label: "Pendapatan",  value: `Rp ${(report?.totalRevenue || 0).toLocaleString("id-ID")}`, icon: "bi-cash-coin", color: "#fd7e14", bg: "#fff3e0", border: "#fd7e14", link: "/seller/report" },
            { label: "Order Selesai", value: report?.totalOrders || 0, icon: "bi-check-circle", color: "#6f42c1", bg: "#f3e8ff", border: "#6f42c1", link: "/seller/report" },
          ].map(s => (
            <div key={s.label} className="col-6 col-md-3">
              <Link to={s.link} className="text-decoration-none">
                <div className="card border-0 shadow-sm stat-card h-100" style={{ borderLeftColor: s.border }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                        <i className={`bi ${s.icon}`} />
                      </div>
                      <i className="bi bi-arrow-up-right text-muted" style={{ fontSize: ".75rem" }} />
                    </div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Revenue chart (bar) */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0"><i className="bi bi-bar-chart me-2 text-success" />Pendapatan 7 Hari Terakhir</h6>
                <Link to="/seller/report" className="btn btn-sm btn-outline-secondary">Laporan Lengkap</Link>
              </div>
              <div className="card-body">
                {Object.values(last7).every(v => v === 0) ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-bar-chart display-5 d-block mb-2" />
                    Belum ada data penjualan
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-end gap-2 mb-3" style={{ height: 160 }}>
                      {chartDays.map(([day, val]) => (
                        <div key={day} className="d-flex flex-column align-items-center flex-grow-1 gap-1">
                          <div className="text-muted" style={{ fontSize: ".65rem" }}>
                            {val > 0 ? `Rp ${(val / 1000).toFixed(0)}k` : ""}
                          </div>
                          <div className="rounded-top w-100" title={`Rp ${val.toLocaleString("id-ID")}`}
                            style={{
                              height: `${Math.max((val / chartMax) * 120, val > 0 ? 6 : 0)}px`,
                              background: val > 0 ? "linear-gradient(180deg,#03AC0E,#029a0c)" : "#f0f0f0",
                              transition: "height .3s", minWidth: 24,
                            }} />
                        </div>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      {chartDays.map(([day]) => (
                        <div key={day} className="flex-grow-1 text-center text-muted" style={{ fontSize: ".65rem" }}>
                          {new Date(day).toLocaleDateString("id-ID", { weekday: "short" })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-lightning me-2 text-warning" />Aksi Cepat</h6>
              </div>
              <div className="list-group list-group-flush">
                {[
                  { to: "/seller/products", icon: "bi-plus-circle-fill", label: "Tambah Produk Baru", color: "text-primary" },
                  { to: "/seller/orders",   icon: "bi-receipt-cutoff",   label: `Kelola Order (${pendingOrders})`, color: "text-success" },
                  { to: "/seller/report",   icon: "bi-graph-up-arrow",   label: "Laporan Penjualan", color: "text-warning" },
                ].map(a => (
                  <Link key={a.to} to={a.to}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-3">
                    <i className={`bi ${a.icon} ${a.color} fs-5`} />
                    <span className="fw-semibold" style={{ fontSize: ".875rem" }}>{a.label}</span>
                    <i className="bi bi-chevron-right ms-auto text-muted" style={{ fontSize: ".75rem" }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Store info */}
            <div className="card border-0 shadow-sm">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-shop me-2 text-success" />Info Toko</h6>
              </div>
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="avatar-circle avatar-circle-lg" style={{ background: "#e8f9e9", color: "#03AC0E" }}>
                    {store?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold">{store?.name}</div>
                    {store && <div className="mt-1"><StatusBadge status={store.status} /></div>}
                  </div>
                </div>
                {store?.description && (
                  <p className="text-muted mb-0" style={{ fontSize: ".825rem" }}>{store.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
