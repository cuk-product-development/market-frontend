import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, pay } from "../../api/customer";
import { Order } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<"paid" | "failed" | null>(null);

  useEffect(() => {
    getOrder(Number(id)).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (simulate: "success" | "failure") => {
    setPaying(true);
    try {
      await pay(Number(id), simulate);
      const r = await getOrder(Number(id));
      setOrder(r.data.data);
      setResult(simulate === "success" ? "paid" : "failed");
      if (simulate === "success") setTimeout(() => navigate("/orders"), 2000);
    } catch {
      setResult("failed");
    } finally { setPaying(false); }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="container py-5 text-center text-muted">Order tidak ditemukan</div>;

  const alreadyPaid   = order.payment?.status === "PAID";
  const paymentFailed = order.payment?.status === "FAILED";

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container py-4" style={{ maxWidth: 640 }}>
        <h4 className="fw-bold mb-4"><i className="bi bi-credit-card me-2 text-success" />Pembayaran</h4>

        {/* Order info */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header py-3 d-flex align-items-center justify-content-between">
            <span className="fw-bold">Order #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="list-group list-group-flush">
            {order.items.map(i => (
              <div key={i.id} className="list-group-item d-flex justify-content-between py-2 px-3">
                <div>
                  <div style={{ fontSize: ".875rem", fontWeight: 500 }}>{i.product.name}</div>
                  <div className="text-muted" style={{ fontSize: ".8rem" }}>{i.store.name} · {i.quantity} pcs</div>
                </div>
                <div className="fw-semibold" style={{ fontSize: ".875rem" }}>
                  Rp {(Number(i.price) * i.quantity).toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer bg-white py-2 px-3">
            <div className="d-flex justify-content-between">
              <span className="text-muted" style={{ fontSize: ".875rem" }}>Total Pembayaran</span>
              <span className="fw-bold text-success fs-6">Rp {Number(order.total).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Payment result */}
        {result === "paid" && (
          <div className="alert alert-success d-flex align-items-center gap-3 mb-4">
            <i className="bi bi-check-circle-fill fs-4" />
            <div>
              <div className="fw-bold">Pembayaran Berhasil!</div>
              <div style={{ fontSize: ".875rem" }}>Pesanan kamu sedang diproses. Mengalihkan ke halaman pesanan...</div>
            </div>
          </div>
        )}
        {result === "failed" && (
          <div className="alert alert-danger d-flex align-items-center gap-3 mb-4">
            <i className="bi bi-x-circle-fill fs-4" />
            <div>
              <div className="fw-bold">Pembayaran Gagal</div>
              <div style={{ fontSize: ".875rem" }}>Pesanan telah dibatalkan dan stok dikembalikan.</div>
            </div>
          </div>
        )}

        {/* Simulation panel */}
        {!alreadyPaid && !paymentFailed && !result && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div style={{ fontSize: "3rem", marginBottom: 8 }}>💳</div>
                <h5 className="fw-bold">Simulasi Pembayaran</h5>
                <p className="text-muted mb-0" style={{ fontSize: ".875rem" }}>
                  Ini adalah simulasi pembayaran. Pilih hasil yang ingin disimulasikan.
                </p>
              </div>

              <div className="alert alert-info py-2 mb-4" style={{ fontSize: ".825rem" }}>
                <i className="bi bi-info-circle me-2" />
                Total: <strong>Rp {Number(order.total).toLocaleString("id-ID")}</strong>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <button className="btn btn-success w-100 py-3 fw-semibold d-flex flex-column align-items-center gap-1"
                    style={{ borderRadius: 10 }}
                    disabled={paying} onClick={() => handlePay("success")}>
                    {paying
                      ? <span className="spinner-border spinner-border-sm" />
                      : <i className="bi bi-check-circle-fill fs-3" />
                    }
                    <span>Bayar Sukses</span>
                    <small className="fw-normal opacity-75">Simulasi pembayaran berhasil</small>
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-outline-danger w-100 py-3 fw-semibold d-flex flex-column align-items-center gap-1"
                    style={{ borderRadius: 10 }}
                    disabled={paying} onClick={() => handlePay("failure")}>
                    <i className="bi bi-x-circle fs-3" />
                    <span>Simulasi Gagal</span>
                    <small className="fw-normal opacity-75">Pesanan akan dibatalkan</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(alreadyPaid || paymentFailed) && (
          <div className={`alert ${alreadyPaid ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2`}>
            <i className={`bi ${alreadyPaid ? "bi-check-circle-fill" : "bi-x-circle-fill"} fs-5`} />
            <span>{alreadyPaid ? "Pembayaran sudah dilakukan." : "Pembayaran gagal. Pesanan dibatalkan."}</span>
          </div>
        )}

        <button className="btn btn-outline-secondary w-100 mt-3" onClick={() => navigate("/orders")}>
          <i className="bi bi-list-ul me-2" />Lihat Semua Pesanan
        </button>
      </div>
    </div>
  );
}
