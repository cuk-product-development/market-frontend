import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrder, cancelOrder } from "../../api/customer";
import { Order } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ORDER_STEPS = ["PENDING","PROCESSING","SHIPPED","DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = () => {
    setLoading(true);
    getOrder(Number(id)).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    if (!confirm("Batalkan pesanan ini?")) return;
    try {
      await cancelOrder(Number(id));
      showToast("Pesanan berhasil dibatalkan");
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal", false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="container py-5 text-center text-muted">Order tidak ditemukan</div>;

  const stepIdx = ORDER_STEPS.indexOf(order.status);

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
        {/* Back + title */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate("/orders")}>
            <i className="bi bi-arrow-left me-1" />Kembali
          </button>
          <div>
            <h5 className="fw-bold mb-0">Order #{order.id}</h5>
            <span className="text-muted" style={{ fontSize: ".8rem" }}>
              {new Date(order.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="ms-auto d-flex gap-2">
            <StatusBadge status={order.status} />
            {order.payment && <StatusBadge status={order.payment.status} />}
          </div>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8">

            {/* Progress tracker */}
            {order.status !== "CANCELLED" && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header py-3">
                  <h6 className="fw-bold mb-0"><i className="bi bi-truck me-2 text-success" />Status Pengiriman</h6>
                </div>
                <div className="card-body px-4 py-3">
                  <div className="d-flex align-items-center justify-content-between position-relative">
                    <div className="position-absolute" style={{ top: 18, left: "5%", right: "5%", height: 3, background: "#e9ecef", zIndex: 0 }} />
                    <div className="position-absolute" style={{
                      top: 18, left: "5%", height: 3, zIndex: 1, background: "#03AC0E",
                      width: stepIdx >= 0 ? `${(stepIdx / (ORDER_STEPS.length - 1)) * 90}%` : "0%",
                      transition: "width .3s"
                    }} />
                    {ORDER_STEPS.map((s, i) => {
                      const done = i <= stepIdx;
                      const icons: Record<string, string> = { PENDING: "bi-clock", PROCESSING: "bi-gear", SHIPPED: "bi-truck", DELIVERED: "bi-check-circle-fill" };
                      return (
                        <div key={s} className="d-flex flex-column align-items-center gap-1 position-relative" style={{ zIndex: 2 }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: 36, height: 36, background: done ? "#03AC0E" : "#e9ecef", color: done ? "#fff" : "#aaa", fontSize: "1.1rem" }}>
                            <i className={`bi ${icons[s]}`} />
                          </div>
                          <span style={{ fontSize: ".7rem", fontWeight: done ? 600 : 400, color: done ? "#03AC0E" : "#aaa", textAlign: "center" }}>
                            {s === "PENDING" ? "Menunggu" : s === "PROCESSING" ? "Diproses" : s === "SHIPPED" ? "Dikirim" : "Diterima"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-box me-2 text-success" />Item Pesanan</h6>
              </div>
              {order.items.map(i => {
                const img = i.product.imageUrl
                  ? (i.product.imageUrl.startsWith("http") ? i.product.imageUrl : `${API}${i.product.imageUrl}`)
                  : null;
                return (
                  <div key={i.id} className="card-body border-top d-flex gap-3 align-items-center py-3 px-3">
                    <div style={{ width: 64, height: 64, background: "#f8f9fa", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {img ? <img src={img} alt={i.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "1.8rem" }}>📦</span>}
                    </div>
                    <div className="flex-grow-1">
                      <Link to={`/products/${i.product.id}`} className="fw-semibold text-decoration-none text-dark" style={{ fontSize: ".9rem" }}>
                        {i.product.name}
                      </Link>
                      <div className="text-muted" style={{ fontSize: ".8rem" }}>{i.store.name}</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: ".875rem" }}>{i.quantity} × Rp {Number(i.price).toLocaleString("id-ID")}</div>
                      <div className="fw-bold">Rp {(Number(i.price) * i.quantity).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                );
              })}
              <div className="card-footer bg-white py-2 px-3">
                <div className="d-flex justify-content-between" style={{ fontSize: ".875rem" }}>
                  <span className="text-muted">Ongkos Kirim</span>
                  <span>Rp {Number(order.shippingFee).toLocaleString("id-ID")}</span>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <span className="fw-bold">Total Pembayaran</span>
                  <span className="fw-bold text-success fs-6">Rp {Number(order.total).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="card border-0 shadow-sm">
                <div className="card-header py-3">
                  <h6 className="fw-bold mb-0"><i className="bi bi-geo-alt me-2 text-success" />Alamat Pengiriman</h6>
                </div>
                <div className="card-body">
                  <div className="fw-semibold">{order.address.label}</div>
                  <div className="text-muted" style={{ fontSize: ".875rem" }}>
                    {order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action sidebar */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0">Aksi Pesanan</h6>
              </div>
              <div className="card-body d-flex flex-column gap-2">
                {order.payment?.status === "PENDING" && order.status === "PENDING" && (
                  <Link to={`/orders/${order.id}/payment`} className="btn btn-primary fw-semibold">
                    <i className="bi bi-credit-card me-2" />Bayar Sekarang
                  </Link>
                )}
                {["PENDING","PROCESSING"].includes(order.status) && (
                  <button className="btn btn-outline-danger" onClick={handleCancel}>
                    <i className="bi bi-x-circle me-2" />Batalkan Pesanan
                  </button>
                )}
                {order.status === "DELIVERED" && (
                  <Link to={`/products/${order.items[0]?.productId}`} className="btn btn-outline-primary">
                    <i className="bi bi-star me-2" />Tulis Ulasan
                  </Link>
                )}
                <button className="btn btn-outline-secondary" onClick={() => navigate("/orders")}>
                  <i className="bi bi-list-ul me-2" />Semua Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
