import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProduct, addToCart, createReview } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import { Product, Review } from "../../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi ${i <= rating ? "bi-star-fill star-filled" : "bi-star star-empty"}`}
          style={{ fontSize: size }} />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<(Product & { reviews: Review[] }) | null>(null);
  const [qty, setQty]         = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "review">("desc");

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = () => {
    getProduct(Number(id))
      .then(r => setProduct(r.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { setLoading(true); load(); }, [id]);

  const handleAddCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(Number(id), qty);
      showToast("Ditambahkan ke keranjang!");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal", false);
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(Number(id), qty);
      navigate("/cart");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal", false);
    } finally { setAdding(false); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview({ productId: Number(id), ...reviewForm });
      showToast("Ulasan berhasil dikirim!");
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal mengirim ulasan", false);
    } finally { setSubmitting(false); }
  };

  if (loading) return <Spinner />;
  if (!product) return null;

  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${API}${product.imageUrl}`)
    : null;
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {toast && (
        <div className={`toast-fixed toast show border-0 text-white ${toast.ok ? "bg-success" : "bg-danger"}`}>
          <div className="d-flex">
            <div className="toast-body fw-semibold">
              <i className={`bi ${toast.ok ? "bi-check-circle" : "bi-x-circle"} me-2`} />{toast.msg}
            </div>
            <button className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      <div className="container-xl py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: ".82rem" }}>
            <li className="breadcrumb-item"><Link to="/" className="text-success text-decoration-none">Beranda</Link></li>
            {product.store && (
              <li className="breadcrumb-item">
                <Link to={`/stores/${product.store.id}`} className="text-success text-decoration-none">{product.store.name}</Link>
              </li>
            )}
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        {/* Main */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Image */}
              <div className="col-md-5 border-end">
                <div className="d-flex align-items-center justify-content-center bg-light"
                  style={{ minHeight: 380, borderRadius: "10px 0 0 10px" }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={product.name}
                        style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain", padding: 20 }}
                        onError={e => { const t = e.target as HTMLImageElement; t.style.display="none"; const p = t.parentElement; if(p) { p.innerHTML = '<span style="font-size:6rem">📦</span>'; } }} />
                    : <span style={{ fontSize: "6rem" }}>📦</span>
                  }
                </div>
              </div>

              {/* Info */}
              <div className="col-md-7 p-4">
                <div className="mb-1">
                  {product.store && (
                    <Link to={`/stores/${product.store.id}`}
                      className="text-success text-decoration-none fw-semibold" style={{ fontSize: ".85rem" }}>
                      <i className="bi bi-shop me-1" />{product.store.name}
                    </Link>
                  )}
                </div>
                <h4 className="fw-bold mb-3">{product.name}</h4>

                {product.reviews?.length > 0 && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Stars rating={Math.round(avgRating)} />
                    <span className="fw-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-muted" style={{ fontSize: ".85rem" }}>({product.reviews.length} ulasan)</span>
                  </div>
                )}

                <div className="mb-4 pb-4 border-bottom">
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#212121" }}>
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="text-muted" style={{ fontSize: ".9rem" }}>Stok:</span>
                  <span className="fw-semibold">{product.stock}</span>
                  <StatusBadge status={product.status} />
                </div>

                {user?.role === "CUSTOMER" && product.stock > 0 && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <span className="text-muted" style={{ fontSize: ".9rem" }}>Jumlah:</span>
                      <div className="qty-group">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary px-4 fw-semibold" disabled={adding}
                        onClick={handleAddCart}>
                        <i className="bi bi-cart-plus me-2" />+ Keranjang
                      </button>
                      <button className="btn btn-primary px-4 fw-semibold" disabled={adding}
                        onClick={handleBuyNow}>
                        <i className="bi bi-lightning-fill me-2" />Beli Sekarang
                      </button>
                    </div>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="alert alert-warning py-2">
                    <i className="bi bi-exclamation-triangle me-2" />Stok produk habis
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "desc" ? "active" : ""}`}
                  onClick={() => setActiveTab("desc")}>
                  <i className="bi bi-file-text me-2" />Deskripsi
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "review" ? "active" : ""}`}
                  onClick={() => setActiveTab("review")}>
                  <i className="bi bi-chat-dots me-2" />
                  Ulasan <span className="badge bg-secondary ms-1">{product.reviews?.length || 0}</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {activeTab === "desc" && (
              <div>
                {product.description
                  ? <p className="mb-0" style={{ lineHeight: 1.8 }}>{product.description}</p>
                  : <p className="text-muted mb-0">Tidak ada deskripsi produk.</p>
                }
              </div>
            )}
            {activeTab === "review" && (
              <div>
                {/* Rating summary */}
                {avgRating > 0 && (
                  <div className="d-flex align-items-center gap-4 p-3 bg-light rounded mb-4">
                    <div className="text-center">
                      <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>{avgRating.toFixed(1)}</div>
                      <Stars rating={Math.round(avgRating)} size={18} />
                      <div className="text-muted mt-1" style={{ fontSize: ".8rem" }}>dari {product.reviews.length} ulasan</div>
                    </div>
                    <div className="flex-grow-1">
                      {[5,4,3,2,1].map(n => {
                        const count = product.reviews.filter(r => r.rating === n).length;
                        const pct = product.reviews.length ? Math.round(count / product.reviews.length * 100) : 0;
                        return (
                          <div key={n} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".8rem" }}>
                            <span>{n}</span><i className="bi bi-star-fill star-filled" style={{ fontSize: 11 }} />
                            <div className="progress flex-grow-1" style={{ height: 6 }}>
                              <div className="progress-bar" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-muted" style={{ minWidth: 24 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Write review */}
                {user?.role === "CUSTOMER" && (
                  <div className="card bg-light border-0 mb-4">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Tulis Ulasan</h6>
                      <form onSubmit={handleReview}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: ".85rem" }}>Rating</label>
                          <div className="d-flex gap-1">
                            {[1,2,3,4,5].map(n => (
                              <button key={n} type="button"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: "1.6rem",
                                  color: n <= reviewForm.rating ? "#FFC400" : "#dee2e6" }}
                                onClick={() => setReviewForm({ ...reviewForm, rating: n })}>★</button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: ".85rem" }}>Komentar</label>
                          <textarea className="form-control" rows={3}
                            placeholder="Bagikan pengalaman menggunakan produk ini..."
                            value={reviewForm.comment}
                            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                        </div>
                        <button className="btn btn-primary btn-sm px-4 fw-semibold" disabled={submitting}>
                          {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Mengirim...</> : "Kirim Ulasan"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Review list */}
                {product.reviews?.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-chat-dots display-5 d-block mb-2" />
                    Belum ada ulasan
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {product.reviews.map(r => (
                      <div key={r.id} className="d-flex gap-3 pb-3 border-bottom">
                        <div className="avatar-circle flex-shrink-0" style={{ width: 38, height: 38, fontSize: ".85rem" }}>
                          {r.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-semibold" style={{ fontSize: ".9rem" }}>{r.user?.name}</span>
                            <Stars rating={r.rating} size={12} />
                          </div>
                          {r.comment && <p className="mb-0 text-muted" style={{ fontSize: ".875rem" }}>{r.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
