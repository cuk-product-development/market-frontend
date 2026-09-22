import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`);
  };

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate("/login");
  };

  const initial = user?.name?.[0]?.toUpperCase() || "U";

  const navLink = (to: string, icon: string, label: string) => (
    <Link to={to} className="nav-link text-white d-flex flex-column align-items-center px-2" style={{ fontSize: 11 }}>
      <i className={`bi ${icon} fs-5`} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="navbar navbar-toko navbar-expand-lg py-0" style={{ minHeight: 60, position: "sticky", top: 0, zIndex: 1030 }}>
      <div className="container-xl">
        {/* Logo */}
        <Link
          to={user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/"}
          className="navbar-brand me-3"
        >
          Toko<span>Kita</span>
        </Link>

        {/* Search — customer/guest only */}
        {(!user || user.role === "CUSTOMER") && (
          <form className="navbar-search d-flex me-3" onSubmit={handleSearch}>
            <input
              className="form-control form-control-sm"
              placeholder="Cari produk, toko, kategori..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <button className="btn btn-sm btn-success" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>
        )}

        {/* Right side */}
        <div className="d-flex align-items-center gap-1 ms-auto">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-sm btn-outline-light">Masuk</Link>
              <Link to="/register" className="btn btn-sm ms-1"
                style={{ background: "#fff", color: "var(--toko-green)", fontWeight: 600 }}>
                Daftar
              </Link>
            </>
          ) : (
            <>
              {user.role === "CUSTOMER" && (
                <>
                  {navLink("/stores",  "bi-shop",     "Toko")}
                  {navLink("/cart",    "bi-cart3",    "Keranjang")}
                  {navLink("/orders",  "bi-box-seam", "Pesanan")}
                </>
              )}
              {user.role === "SELLER" && (
                <>
                  {navLink("/seller",          "bi-speedometer2", "Dashboard")}
                  {navLink("/seller/products", "bi-box",          "Produk")}
                  {navLink("/seller/orders",   "bi-receipt",      "Order")}
                  {navLink("/seller/report",   "bi-bar-chart",    "Laporan")}
                </>
              )}
              {user.role === "ADMIN" && (
                <>
                  {navLink("/admin",              "bi-speedometer2", "Dashboard")}
                  {navLink("/admin/users",        "bi-people",       "Users")}
                  {navLink("/admin/stores",       "bi-shop",         "Toko")}
                  {navLink("/admin/transactions", "bi-credit-card",  "Transaksi")}
                </>
              )}

              {/* Custom dropdown — no Bootstrap JS needed */}
              <div className="ms-2 position-relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "none", borderRadius: 8 }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                    style={{ width: 28, height: 28, background: "#fff", color: "var(--toko-green)", fontSize: ".8rem", flexShrink: 0 }}
                  >
                    {initial}
                  </div>
                  <span style={{ fontSize: 13, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name.split(" ")[0]}
                  </span>
                  <i className={`bi bi-chevron-${dropOpen ? "up" : "down"}`} style={{ fontSize: 10 }} />
                </button>

                {dropOpen && (
                  <div
                    className="bg-white shadow rounded"
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      minWidth: 200, zIndex: 9999,
                      border: "1px solid #e8e8e8",
                      animation: "fadeIn .15s ease",
                    }}
                  >
                    {/* User info */}
                    <div className="px-3 py-2 border-bottom">
                      <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{user.name}</div>
                      <div className="text-muted" style={{ fontSize: ".775rem" }}>{user.email}</div>
                      <div className="mt-1">
                        <span className="badge bg-success" style={{ fontSize: 10 }}>{user.role}</span>
                      </div>
                    </div>

                    {/* Links */}
                    {user.role === "CUSTOMER" && (
                      <>
                        <Link to="/orders" onClick={() => setDropOpen(false)}
                          className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                          style={{ fontSize: ".875rem" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <i className="bi bi-box-seam text-success" />Pesanan Saya
                        </Link>
                        <Link to="/cart" onClick={() => setDropOpen(false)}
                          className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                          style={{ fontSize: ".875rem" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <i className="bi bi-cart3 text-success" />Keranjang
                        </Link>
                      </>
                    )}
                    {user.role === "SELLER" && (
                      <Link to="/seller" onClick={() => setDropOpen(false)}
                        className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                        style={{ fontSize: ".875rem" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <i className="bi bi-speedometer2 text-success" />Dashboard Seller
                      </Link>
                    )}
                    {user.role === "ADMIN" && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                        style={{ fontSize: ".875rem" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <i className="bi bi-speedometer2 text-success" />Dashboard Admin
                      </Link>
                    )}

                    {/* Divider + logout */}
                    <div className="border-top mx-2 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-100 d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent text-danger fw-semibold"
                      style={{ fontSize: ".875rem", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <i className="bi bi-box-arrow-right" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
