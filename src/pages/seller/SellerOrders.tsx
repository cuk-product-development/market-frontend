import React, { useEffect, useState, useCallback } from "react";
import { getSellerOrders, updateOrderStatus } from "../../api/seller";
import { Order } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

const NEXT: Record<string, string | null> = {
  PENDING: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED",
  DELIVERED: null, CANCELLED: null,
};
const NEXT_LABEL: Record<string, string> = {
  PROCESSING: "Proses", SHIPPED: "Kirim", DELIVERED: "Selesai",
};

interface Meta { page: number; limit: number; total: number; totalPages: number; }
const LIMIT = 10;

export default function SellerOrders() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [meta, setMeta]       = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("ALL");
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (tab !== "ALL") params.status = tab;
    getSellerOrders(params)
      .then(r => { setOrders(r.data.data.data); setMeta(r.data.data.meta); })
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(1); }, [load]);

  const handleUpdate = async (orderId: number, status: string) => {
    try { await updateOrderStatus(orderId, status); showToast(`Status → ${status}`); load(meta.page); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal update", false);
    }
  };

  const STATUS_TABS = ["ALL","PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

  // Summary counts from current page — use meta hints
  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;

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
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-1"><i className="bi bi-receipt me-2 text-success" />Order Masuk</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} total order</span>
          </div>
        </div>

        {/* Quick stat cards */}
        <div className="row g-3 mb-4">
          {[
            { status: "PENDING",    icon: "bi-clock",        color: "#fd7e14", bg: "#fff3e0", border: "#fd7e14", label: "Perlu Diproses" },
            { status: "PROCESSING", icon: "bi-gear",         color: "#0d6efd", bg: "#e8f0fe", border: "#0d6efd", label: "Diproses" },
            { status: "SHIPPED",    icon: "bi-truck",        color: "#0dcaf0", bg: "#e0f7fa", border: "#0dcaf0", label: "Dikirim" },
            { status: "DELIVERED",  icon: "bi-check-circle", color: "#198754", bg: "#e8f9e9", border: "#198754", label: "Selesai" },
          ].map(s => (
            <div key={s.status} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm stat-card"
                style={{ borderLeftColor: s.border, cursor: "pointer" }}
                onClick={() => setTab(s.status)}>
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.3rem", color: s.color }}>
                      {tab === s.status ? meta.total : countByStatus(s.status)}
                    </div>
                    <div className="text-muted" style={{ fontSize: ".75rem" }}>{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-0 px-0">
            <div className="d-flex overflow-auto">
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`btn btn-sm fw-semibold px-4 py-3 rounded-0 border-0`}
                  style={{ borderBottom: tab === t ? "2px solid #03AC0E" : "2px solid transparent",
                    color: tab === t ? "#03AC0E" : "#777", fontSize: ".825rem", whiteSpace: "nowrap" }}>
                  {t === "ALL" ? `Semua (${meta.total})` : <><StatusBadge status={t} /></>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {orders.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5">
                <i className="bi bi-inbox display-4 text-muted d-block mb-3" />
                <h5 className="fw-bold">Tidak ada order</h5>
                <p className="text-muted">Order dari pelanggan akan muncul di sini</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map(o => {
                  const next = NEXT[o.status];
                  const orderUser = (o as unknown as { user?: { name: string } }).user;
                  return (
                    <div key={o.id} className="card border-0 shadow-sm">
                      <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <span className="fw-bold">Order #{o.id}</span>
                          <span className="text-muted" style={{ fontSize: ".8rem" }}>
                            <i className="bi bi-calendar3 me-1" />
                            {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {orderUser && (
                            <span className="text-muted" style={{ fontSize: ".8rem" }}>
                              <i className="bi bi-person me-1" />{orderUser.name}
                            </span>
                          )}
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <StatusBadge status={o.status} />
                          {o.payment && <StatusBadge status={o.payment.status} />}
                        </div>
                      </div>

                      <div className="card-body py-2 px-3">
                        {o.items?.map(i => (
                          <div key={i.id} className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ fontSize: ".875rem" }}>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-box text-muted" style={{ fontSize: ".75rem" }} />
                              <span>{i.product.name}</span>
                              <span className="badge bg-light text-dark fw-normal">×{i.quantity}</span>
                            </div>
                            <span className="fw-semibold">Rp {(Number(i.price) * i.quantity).toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="card-footer bg-white d-flex align-items-center justify-content-between px-3 py-2 flex-wrap gap-2">
                        <span>
                          <span className="text-muted" style={{ fontSize: ".85rem" }}>Total: </span>
                          <span className="fw-bold text-success">Rp {Number(o.total).toLocaleString("id-ID")}</span>
                        </span>
                        {next && (
                          <button className="btn btn-sm btn-primary fw-semibold" onClick={() => handleUpdate(o.id, next)}>
                            <i className="bi bi-arrow-right-circle me-1" />
                            Update → {NEXT_LABEL[next] || next}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPage={p => load(p)} />
          </>
        )}
      </div>
    </div>
  );
}
