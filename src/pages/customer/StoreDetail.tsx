import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStore, addToCart } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/ui/ProductCard";
import Spinner from "../../components/ui/Spinner";
import { Store, Product } from "../../types";

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<(Store & { products: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    getStore(Number(id))
      .then(r => setStore(r.data.data))
      .catch(() => navigate("/stores"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddCart = async (p: Product) => {
    if (!user) { navigate("/login"); return; }
    try {
      await addToCart(p.id, 1);
      showToast(`${p.name} ditambahkan ke keranjang`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal", false);
    }
  };

  if (loading) return <Spinner />;
  if (!store) return null;

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

      {/* Store banner */}
      <div style={{ background: "linear-gradient(135deg,#03AC0E 0%,#017a0a 100%)", color: "#fff" }}>
        <div className="container-xl py-4">
          <div className="d-flex align-items-center gap-4">
            <div className="avatar-circle avatar-circle-lg flex-shrink-0"
              style={{ background: "rgba(255,255,255,.2)", color: "#fff", fontSize: "1.6rem", border: "3px solid rgba(255,255,255,.4)" }}>
              {store.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="fw-bold mb-1">{store.name}</h3>
              <div style={{ opacity: .85, fontSize: ".9rem" }}>
                <i className="bi bi-person-circle me-1" />{store.seller?.name}
              </div>
              {store.description && (
                <p className="mb-0 mt-1" style={{ opacity: .8, fontSize: ".85rem" }}>{store.description}</p>
              )}
            </div>
            <div className="ms-auto text-center d-none d-md-block">
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{store.products.length}</div>
              <div style={{ fontSize: ".8rem", opacity: .85 }}>Produk</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-box me-2 text-success" />Produk Toko
          <span className="badge bg-secondary ms-2 fw-normal">{store.products.length}</span>
        </h6>

        {store.products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box display-4 text-muted d-block mb-3" />
            <h5 className="fw-bold">Belum ada produk</h5>
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-xl-5 g-3">
            {store.products.map(p => (
              <div key={p.id} className="col">
                <ProductCard product={p}
                  onAddCart={user?.role === "CUSTOMER" ? handleAddCart : undefined} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
