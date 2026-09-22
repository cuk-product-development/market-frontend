import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, getAdminStores, getTransactions } from "../../api/admin";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";

interface Stats { totalUsers: number; totalSellers: number; totalStores: number; pendingStores: number; totalOrders: number; totalProducts: number; }
interface StoreRow { id: number; name: string; status: string; seller: { name: string; email: string }; createdAt: string; }
interface OrderRow { id: number; total: number | string; status: string; createdAt: string; user: { name: string }; payment?: { status: string } }

export default function AdminDashboard() {
  const [stats, setStats]             = useState<Stats | null>(null);
  const [pendingStores, setPendingStores] = useState<StoreRow[]>([]);
  const [recentOrders, setRecentOrders]   = useState<OrderRow[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getAdminStores({ limit: 100 }), getTransactions({ limit: 5 })]).then(([sr, str, tr]) => {
      setStats(sr.data.data);
      setPendingStores((str.data.data.data as StoreRow[]).filter(s => s.status === "PENDING").slice(0, 5));
      setRecentOrders((tr.data.data.data as OrderRow[]).slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const STAT_CARDS = [
    { label: "Total Customer", value: stats.totalUsers,    icon: "bi-people-fill",     color: "#0d6efd", bg: "#e8f0fe", border: "#0d6efd",   link: "/admin/users?role=CUSTOMER" },
    { label: "Total Seller",   value: stats.totalSellers,  icon: "bi-shop-window",     color: "#6f42c1", bg: "#f3e8ff", border: "#6f42c1",   link: "/admin/users?role=SELLER" },
    { label: "Total Toko",     value: stats.totalStores,   icon: "bi-building-check",  color: "#198754", bg: "#e8f9e9", border: "#198754",   link: "/admin/stores" },
    { label: "Toko Pending",   value: stats.pendingStores, icon: "bi-hourglass-split", color: "#fd7e14", bg: "#fff3e0", border: "#fd7e14",   link: "/admin/stores" },
    { label: "Total Order",    value: stats.totalOrders,   icon: "bi-receipt-cutoff",  color: "#0dcaf0", bg: "#e0f7fa", border: "#0dcaf0",   link: "/admin/transactions" },
    { label: "Total Produk",   value: stats.totalProducts, icon: "bi-box-seam",        color: "#dc3545", bg: "#fce8ea", border: "#dc3545",   link: "/admin/products" },
  ];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">

        {/* Page header */}
        <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1">Admin Dashboard</h4>
            <p className="text-muted mb-0" style={{ fontSize: ".875rem" }}>
              Selamat datang di panel admin TokoKita
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/stores" className="btn btn-sm btn-primary fw-semibold">
              <i className="bi bi-shop me-1" />Kelola Toko
            </Link>
            <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-people me-1" />Kelola User
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="col-6 col-md-4 col-lg-2">
              <Link to={s.link} className="text-decoration-none">
                <div className="card border-0 shadow-sm stat-card h-100" style={{ borderLeftColor: s.border }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                        <i className={`bi ${s.icon}`} />
                      </div>
                      <i className="bi bi-arrow-up-right text-muted" style={{ fontSize: ".7rem" }} />
                    </div>
                    <div className="stat-value" style={{ color: s.color, fontSize: "1.6rem" }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Recent orders */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0"><i className="bi bi-receipt me-2 text-success" />Order Terbaru</h6>
                <Link to="/admin/transactions" className="btn btn-sm btn-outline-secondary">Lihat Semua</Link>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>#</th><th>Customer</th><th>Total</th><th>Status</th><th>Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-muted">Belum ada order</td></tr>
                    ) : recentOrders.map(o => (
                      <tr key={o.id}>
                        <td className="fw-semibold" style={{ fontSize: ".8rem" }}>#{o.id}</td>
                        <td>
                          <div style={{ fontSize: ".875rem", fontWeight: 500 }}>{o.user?.name}</div>
                          <div style={{ fontSize: ".75rem", color: "#9e9e9e" }}>
                            {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </div>
                        </td>
                        <td className="fw-semibold" style={{ fontSize: ".875rem" }}>Rp {Number(o.total).toLocaleString("id-ID")}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>{o.payment ? <StatusBadge status={o.payment.status} /> : <span className="text-muted">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-12 col-lg-5 d-flex flex-column gap-4">
            {/* Pending store approvals */}
            <div className="card border-0 shadow-sm">
              <div className="card-header py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-hourglass-split me-2 text-warning" />Toko Menunggu Approval
                  {pendingStores.length > 0 && (
                    <span className="badge bg-warning text-dark ms-2">{pendingStores.length}</span>
                  )}
                </h6>
                <Link to="/admin/stores" className="btn btn-sm btn-outline-secondary">Kelola</Link>
              </div>
              <div className="list-group list-group-flush">
                {pendingStores.length === 0 ? (
                  <div className="list-group-item text-center text-muted py-3" style={{ fontSize: ".875rem" }}>
                    <i className="bi bi-check-circle text-success me-2" />Tidak ada toko yang perlu diapprove
                  </div>
                ) : pendingStores.map(s => (
                  <div key={s.id} className="list-group-item d-flex align-items-center gap-3 py-2 px-3">
                    <div className="avatar-circle flex-shrink-0" style={{ background: "#fff3e0", color: "#fd7e14" }}>
                      {s.name[0].toUpperCase()}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{s.name}</div>
                      <div className="text-muted" style={{ fontSize: ".75rem" }}>{s.seller?.name}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav */}
            <div className="card border-0 shadow-sm">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-grid me-2 text-success" />Menu Admin</h6>
              </div>
              <div className="list-group list-group-flush">
                {[
                  { to: "/admin/users",        icon: "bi-people-fill",    label: "Kelola User",        color: "text-primary",  desc: "Customer, seller, suspend" },
                  { to: "/admin/stores",       icon: "bi-shop-window",    label: "Kelola Toko",        color: "text-success",  desc: "Approve / reject toko" },
                  { to: "/admin/products",     icon: "bi-box-seam",       label: "Semua Produk",       color: "text-warning",  desc: "Produk di platform" },
                  { to: "/admin/transactions", icon: "bi-credit-card",    label: "Semua Transaksi",    color: "text-info",     desc: "Riwayat pembayaran" },
                ].map(a => (
                  <Link key={a.to} to={a.to}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 px-3">
                    <i className={`bi ${a.icon} ${a.color} fs-5`} style={{ width: 22 }} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{a.label}</div>
                      <div className="text-muted" style={{ fontSize: ".75rem" }}>{a.desc}</div>
                    </div>
                    <i className="bi bi-chevron-right text-muted" style={{ fontSize: ".75rem" }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
