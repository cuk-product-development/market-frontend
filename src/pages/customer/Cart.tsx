import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../../api/customer";
import { CartItem } from "../../types";
import Spinner from "../../components/ui/Spinner";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems]   = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2000); };

  const load = useCallback(() => {
    setLoading(true);
    getCart().then(r => setItems(r.data.data.items)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleQty = async (item: CartItem, qty: number) => {
    if (qty < 1) return;
    try {
      await updateCartItem(item.id, qty);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: qty } : i));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal update", false);
    }
  };

  const handleRemove = async (id: number) => {
    await removeCartItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    showToast("Item dihapus dari keranjang");
  };

  // group by store
  const byStore: Record<number, { name: string; items: CartItem[] }> = {};
  items.forEach(i => {
    const sid = i.product.store.id;
    if (!byStore[sid]) byStore[sid] = { name: i.product.store.name, items: [] };
    byStore[sid].items.push(i);
  });

  const subtotal  = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const shipping  = 10000;
  const total     = subtotal + shipping;

  if (loading) return <Spinner />;

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
        <h4 className="fw-bold mb-4"><i className="bi bi-cart3 me-2 text-success" />Keranjang Belanja</h4>

        {items.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5">
            <div className="card-body">
              <i className="bi bi-cart-x display-3 text-muted d-block mb-3" />
              <h5 className="fw-bold">Keranjang Kosong</h5>
              <p className="text-muted mb-4">Yuk mulai belanja dan temukan produk favoritmu!</p>
              <button className="btn btn-primary px-5 fw-semibold" onClick={() => navigate("/")}>
                <i className="bi bi-bag me-2" />Mulai Belanja
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            {/* Items */}
            <div className="col-12 col-lg-8">
              {/* Select all bar */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-semibold" style={{ fontSize: ".875rem" }}>
                    <i className="bi bi-box me-2 text-success" />{items.length} produk dari {Object.keys(byStore).length} toko
                  </span>
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={async () => { if (confirm("Kosongkan keranjang?")) { await Promise.all(items.map(i => removeCartItem(i.id))); setItems([]); } }}>
                    <i className="bi bi-trash me-1" />Kosongkan
                  </button>
                </div>
              </div>

              {/* Per store */}
              {Object.entries(byStore).map(([sid, group]) => (
                <div key={sid} className="card border-0 shadow-sm mb-3">
                  <div className="card-header py-2 px-3 d-flex align-items-center gap-2">
                    <i className="bi bi-shop text-success" />
                    <span className="fw-semibold" style={{ fontSize: ".9rem" }}>{group.name}</span>
                  </div>
                  {group.items.map(item => {
                    const img = item.product.imageUrl
                      ? (item.product.imageUrl.startsWith("http") ? item.product.imageUrl : `${API}${item.product.imageUrl}`)
                      : null;
                    return (
                      <div key={item.id} className="card-body py-3 px-3 border-top d-flex gap-3 align-items-start">
                        {/* Image */}
                        <div className="flex-shrink-0" style={{ width: 80, height: 80, background: "#f8f9fa", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {img
                            ? <img src={img} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: "2rem" }}>📦</span>
                          }
                        </div>
                        {/* Detail */}
                        <div className="flex-grow-1 min-width-0">
                          <Link to={`/products/${item.product.id}`} className="text-decoration-none text-dark fw-semibold" style={{ fontSize: ".9rem" }}>
                            {item.product.name}
                          </Link>
                          <div className="text-success fw-bold mt-1">
                            Rp {Number(item.product.price).toLocaleString("id-ID")}
                          </div>
                          <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
                            <div className="qty-group">
                              <button onClick={() => handleQty(item, item.quantity - 1)}>−</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => handleQty(item, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}>+</button>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <span className="fw-bold">
                                Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                              </span>
                              <button className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemove(item.id)}>
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm sticky-top" style={{ top: 72 }}>
                <div className="card-header py-3">
                  <h6 className="fw-bold mb-0"><i className="bi bi-receipt me-2 text-success" />Ringkasan Belanja</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".9rem" }}>
                    <span className="text-muted">Total Harga ({items.length} barang)</span>
                    <span className="fw-semibold">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: ".9rem" }}>
                    <span className="text-muted">Ongkos Kirim</span>
                    <span className="fw-semibold">Rp {shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold">Total Pembayaran</span>
                    <span className="fw-bold text-success fs-5">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <button className="btn btn-primary w-100 fw-semibold py-2" onClick={() => navigate("/checkout")}>
                    <i className="bi bi-bag-check me-2" />Checkout ({items.length} item)
                  </button>
                  <button className="btn btn-outline-secondary w-100 mt-2 btn-sm" onClick={() => navigate("/")}>
                    <i className="bi bi-arrow-left me-1" />Lanjut Belanja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
