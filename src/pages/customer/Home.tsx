import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getProducts, addToCart } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/ui/ProductCard";
import Spinner from "../../components/ui/Spinner";
import { Product } from "../../types";

const CATS = [
  { icon: "⌨️", label: "Keyboard",  q: "keyboard" },
  { icon: "🖱️", label: "Mouse",     q: "mouse" },
  { icon: "🎧", label: "Headphone", q: "headphone" },
  { icon: "🖥️", label: "Monitor",   q: "monitor" },
  { icon: "📷", label: "Webcam",    q: "webcam" },
  { icon: "🔌", label: "USB Hub",   q: "usb hub" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [products, setProducts]     = useState<Product[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState(qParam);
  const [minPrice, setMinPrice]     = useState("");
  const [maxPrice, setMaxPrice]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search)   params.q        = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await getProducts(params);
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } finally { setLoading(false); }
  }, [page, search, minPrice, maxPrice]);

  useEffect(() => { setSearch(qParam); setPage(1); }, [qParam]);
  useEffect(() => { load(); }, [load]);

  const handleAddCart = async (p: Product) => {
    if (!user) { navigate("/login"); return; }
    try {
      await addToCart(p.id, 1);
      showToast(`${p.name} ditambahkan ke keranjang`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal menambahkan", false);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div className={`toast-fixed toast show align-items-center text-white border-0 ${toast.ok ? "bg-success" : "bg-danger"}`} role="alert">
          <div className="d-flex">
            <div className="toast-body fw-semibold">
              <i className={`bi ${toast.ok ? "bi-check-circle" : "bi-x-circle"} me-2`} />
              {toast.msg}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      <div className="container-xl py-4">

        {/* Hero */}
        {!search && (
          <div className="hero-banner p-4 p-lg-5 mb-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)" }}>
                  Belanja Mudah,<br />Harga Terjangkau 🎉
                </h1>
                <p className="mb-3 opacity-90">Temukan produk elektronik & aksesoris terbaik dari seller terpercaya</p>
                <Link to="/stores" className="btn btn-light fw-semibold">
                  <i className="bi bi-shop me-2" />Lihat Semua Toko
                </Link>
              </div>
              <div className="col-md-4 text-end d-none d-md-block">
                <span style={{ fontSize: "5rem" }}>🛒</span>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {!search && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Kategori Populer
            </h6>
            <div className="d-flex gap-2 flex-wrap">
              {CATS.map(c => (
                <Link to={`/?q=${encodeURIComponent(c.q)}`} key={c.q} className="text-decoration-none">
                  <div className="cat-chip">
                    <span className="cat-icon">{c.icon}</span>
                    {c.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="row g-3">
          {/* Sidebar filter */}
          <div className="col-12 col-md-3 col-lg-2">
            <div className="card sticky-top" style={{ top: 72 }}>
              <div className="card-header py-3">
                <span className="fw-semibold"><i className="bi bi-funnel me-2 text-success" />Filter</span>
              </div>
              <div className="card-body">
                <p className="fw-semibold mb-2" style={{ fontSize: ".8rem" }}>Rentang Harga</p>
                <div className="mb-2">
                  <input className="form-control form-control-sm" type="number" placeholder="Min (Rp)"
                    value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
                </div>
                <div className="mb-3">
                  <input className="form-control form-control-sm" type="number" placeholder="Max (Rp)"
                    value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
                </div>
                {(minPrice || maxPrice) && (
                  <button className="btn btn-outline-secondary btn-sm w-100"
                    onClick={() => { setMinPrice(""); setMaxPrice(""); setPage(1); }}>
                    <i className="bi bi-x me-1" />Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-12 col-md-9 col-lg-10">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div>
                {search ? (
                  <>
                    <span className="fw-bold fs-5">Hasil untuk </span>
                    <span className="text-success fw-bold">"{search}"</span>
                    <span className="text-muted ms-2" style={{ fontSize: ".85rem" }}>{total} produk</span>
                  </>
                ) : (
                  <span className="fw-bold fs-5">Semua Produk <span className="text-muted fw-normal" style={{ fontSize: ".9rem" }}>({total})</span></span>
                )}
              </div>
              {search && (
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setSearch(""); setPage(1); navigate("/"); }}>
                  <i className="bi bi-x me-1" />Hapus Pencarian
                </button>
              )}
            </div>

            {loading ? <Spinner /> : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: "3.5rem" }}>🔍</div>
                    <h5 className="fw-bold mt-3">Produk tidak ditemukan</h5>
                    <p className="text-muted">Coba kata kunci lain atau reset filter</p>
                  </div>
                ) : (
                  <div className="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                    {products.map(p => (
                      <div key={p.id} className="col">
                        <ProductCard product={p}
                          onAddCart={user?.role === "CUSTOMER" ? handleAddCart : undefined} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-4">
                    <ul className="pagination justify-content-center mb-0">
                      <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage(p => p - 1)}>
                          <i className="bi bi-chevron-left" />
                        </button>
                      </li>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                        <li key={n} className={`page-item ${page === n ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setPage(n)}>{n}</button>
                        </li>
                      ))}
                      <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage(p => p + 1)}>
                          <i className="bi bi-chevron-right" />
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
