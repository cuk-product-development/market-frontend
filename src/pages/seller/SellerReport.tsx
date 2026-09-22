import React, { useEffect, useState } from "react";
import { getReport } from "../../api/seller";
import Spinner from "../../components/ui/Spinner";

interface ReportItem {
  id: number; productId: number; quantity: number; price: number | string;
  product: { id: number; name: string };
  order: { id: number; status: string; createdAt: string };
}

export default function SellerReport() {
  const [data, setData] = useState<{ totalRevenue: number; totalOrders: number; items: ReportItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  // top products
  const byProduct: Record<number, { name: string; qty: number; revenue: number }> = {};
  data.items.forEach(i => {
    if (!byProduct[i.productId]) byProduct[i.productId] = { name: i.product.name, qty: 0, revenue: 0 };
    byProduct[i.productId].qty += i.quantity;
    byProduct[i.productId].revenue += Number(i.price) * i.quantity;
  });
  const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // revenue by month
  const byMonth: Record<string, number> = {};
  data.items.forEach(i => {
    const m = new Date(i.order.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    byMonth[m] = (byMonth[m] || 0) + Number(i.price) * i.quantity;
  });

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">
        <h4 className="fw-bold mb-4"><i className="bi bi-graph-up-arrow me-2 text-success" />Laporan Penjualan</h4>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Pendapatan", value: `Rp ${data.totalRevenue.toLocaleString("id-ID")}`, icon: "bi-cash-coin", color: "#198754", bg: "#e8f9e9", border: "#198754" },
            { label: "Total Order Selesai", value: data.totalOrders, icon: "bi-receipt-cutoff", color: "#0d6efd", bg: "#e8f0fe", border: "#0d6efd" },
            { label: "Total Item Terjual", value: data.items.reduce((s, i) => s + i.quantity, 0), icon: "bi-box-seam", color: "#fd7e14", bg: "#fff3e0", border: "#fd7e14" },
            { label: "Produk Berbeda", value: Object.keys(byProduct).length, icon: "bi-tags", color: "#6f42c1", bg: "#f3e8ff", border: "#6f42c1" },
          ].map(s => (
            <div key={s.label} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm stat-card" style={{ borderLeftColor: s.border }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                  </div>
                  <div className="stat-value" style={{ color: s.color, fontSize: "1.4rem" }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          {/* Top products */}
          <div className="col-12 col-md-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-trophy me-2 text-warning" />Produk Terlaris</h6>
              </div>
              <div className="card-body p-0">
                {topProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted">Belum ada data</div>
                ) : topProducts.map((p, i) => (
                  <div key={p.name} className="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
                    <div className="fw-bold text-muted" style={{ width: 24, fontSize: ".875rem" }}>#{i + 1}</div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: ".75rem" }}>{p.qty} terjual</div>
                    </div>
                    <div className="fw-bold text-success" style={{ fontSize: ".875rem" }}>
                      Rp {p.revenue.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by month */}
          <div className="col-12 col-md-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-bar-chart me-2 text-success" />Pendapatan per Bulan</h6>
              </div>
              <div className="card-body">
                {Object.keys(byMonth).length === 0 ? (
                  <div className="text-center text-muted py-4">Belum ada data</div>
                ) : Object.entries(byMonth).map(([m, v]) => {
                  const max = Math.max(...Object.values(byMonth));
                  return (
                    <div key={m} className="mb-2">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: ".8rem" }}>
                        <span className="text-muted">{m}</span>
                        <span className="fw-semibold">Rp {v.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className="progress-bar" style={{ width: `${(v / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="card border-0 shadow-sm">
          <div className="card-header py-3">
            <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-success" />Riwayat Transaksi</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Order</th><th>Produk</th><th>Qty</th><th>Harga Satuan</th><th>Subtotal</th><th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">Belum ada transaksi</td></tr>
                ) : data.items.map(i => (
                  <tr key={i.id}>
                    <td><span className="badge bg-light text-dark fw-semibold">#{i.order.id}</span></td>
                    <td className="fw-semibold" style={{ fontSize: ".875rem" }}>{i.product.name}</td>
                    <td>{i.quantity}</td>
                    <td>Rp {Number(i.price).toLocaleString("id-ID")}</td>
                    <td className="fw-bold text-success">Rp {(Number(i.price) * i.quantity).toLocaleString("id-ID")}</td>
                    <td className="text-muted" style={{ fontSize: ".8rem" }}>
                      {new Date(i.order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
