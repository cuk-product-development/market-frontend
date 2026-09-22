import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders, cancelOrder } from "../../api/customer";
import { Order } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";

const STATUS_TABS = ["Semua","PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Semua");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(() => {
    setLoading(true);
    getOrders().then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: number) => {
    if (!confirm("Batalkan pesanan ini?")) return;
    try {
      await cancelOrder(id);
      showToast("Pesanan berhasil dibatalkan");
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal membatalkan", false);
    }
  };

  const filtered = tab === "Semua" ? orders : orders.filter(o => o.status === tab);

  if (loading) return <Spinner />;

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
        <h4 className="fw-bold mb-4"><i className="bi bi-box-seam me-2 text-success" />Pesanan Saya</h4>

        {/* Tab filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2 px-0">
            <div className="d-flex overflow-auto" style={{ borderBottom: "1px solid #f0f0f0" }}>
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`btn btn-sm fw-semibold px-4 py-2 rounded-0 border-0 border-bottom ${tab === t ? "text-success border-success" : "text-muted"}`}
                  style={{ borderBottomWidth: tab === t ? 2 : 0, borderBottomStyle: "solid", fontSize: ".825rem", whiteSpace: "nowrap" }}>
                  {t === "Semua" ? t : <StatusBadge status={t} />}
                  {t === "Semua" && (
                    <span className="badge bg-secondary ms-1 fw-normal">{orders.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5">
            <div className="card-body">
              <i className="bi bi-inbox display-4 text-muted d-block mb-3" />
              <h5 className="fw-bold">Belum ada pesanan</h5>
              <p className="text-muted mb-4">Mulai belanja dan pesanan kamu akan muncul di sini</p>
              <button className="btn btn-primary px-5" onClick={() => navigate("/")}>Belanja Sekarang</button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map(o => (
              <div key={o.id} className="card border-0 shadow-sm">
                {/* Order header */}
                <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted" style={{ fontSize: ".8rem" }}>
                      <i className="bi bi-receipt me-1" />Order #{o.id}
                    </span>
                    <span className="text-muted" style={{ fontSize: ".8rem" }}>
                      <i className="bi bi-calendar3 me-1" />{new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <StatusBadge status={o.status} />
                    {o.payment && <StatusBadge status={o.payment.status} />}
                  </div>
                </div>

                {/* Items preview */}
                <div className="card-body py-3 px-3">
                  {o.items.slice(0, 2).map(i => (
                    <div key={i.id} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".875rem" }}>
                      <i className="bi bi-box text-muted" style={{ fontSize: ".75rem" }} />
                      <span>{i.product.name}</span>
                      <span className="text-muted">× {i.quantity}</span>
                      <span className="text-muted ms-auto">{i.store.name}</span>
                    </div>
                  ))}
                  {o.items.length > 2 && (
                    <div className="text-muted" style={{ fontSize: ".8rem" }}>
                      +{o.items.length - 2} produk lainnya
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3">
                  <div>
                    <span className="text-muted" style={{ fontSize: ".8rem" }}>Total Belanja: </span>
                    <span className="fw-bold text-success">Rp {Number(o.total).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {o.payment?.status === "PENDING" && o.status === "PENDING" && (
                      <button className="btn btn-sm btn-primary fw-semibold"
                        onClick={() => navigate(`/orders/${o.id}/payment`)}>
                        <i className="bi bi-credit-card me-1" />Bayar Sekarang
                      </button>
                    )}
                    {["PENDING","PROCESSING"].includes(o.status) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(o.id)}>
                        <i className="bi bi-x-circle me-1" />Batalkan
                      </button>
                    )}
                    <Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-eye me-1" />Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
