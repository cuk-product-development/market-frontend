import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const DEMO = [
  { role: "Admin",    email: "admin@market.test",    password: "Admin123!",    icon: "bi-shield-check" },
  { role: "Seller A", email: "seller.a@market.test", password: "Seller123!",   icon: "bi-shop" },
  { role: "Seller B", email: "seller.b@market.test", password: "Seller123!",   icon: "bi-shop" },
  { role: "Customer", email: "customer@market.test", password: "Customer123!", icon: "bi-person-circle" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiLogin(form);
      const { user, token } = res.data.data;
      login(user, token);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "SELLER") navigate("/seller");
      else navigate("/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Email atau password salah");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4"
      style={{ background: "linear-gradient(135deg, #03AC0E 0%, #017a0a 100%)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: 20 }}>
              <div className="row g-0">

                {/* ── Left panel ── */}
                <div className="col-md-5 d-none d-md-flex flex-column"
                  style={{ background: "linear-gradient(160deg, #03AC0E 0%, #017a0a 100%)", color: "#fff", minHeight: 560, position: "relative", overflow: "hidden" }}>

                  {/* Background decorative circles */}
                  <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: -80, right: -80 }} />
                  <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)", bottom: 40, left: -60 }} />
                  <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.08)", bottom: 160, right: 20 }} />

                  {/* Content */}
                  <div className="p-4 p-lg-5 d-flex flex-column h-100 position-relative">
                    {/* Logo */}
                    <div className="fw-bold mb-4" style={{ fontSize: "1.8rem" }}>
                      Toko<span style={{ color: "#ffce31" }}>Kita</span>
                    </div>

                    {/* Hero illustration */}
                    <div className="text-center my-3">
                      <div style={{
                        background: "rgba(255,255,255,.12)",
                        borderRadius: 20,
                        padding: "24px 20px",
                        backdropFilter: "blur(4px)",
                      }}>
                        {/* Shopping illustration with emojis */}
                        <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: 12 }}>🛍️</div>
                        <div className="d-flex justify-content-center gap-2 mb-2">
                          {["⌨️","🖱️","🎧","🖥️"].map(e => (
                            <div key={e} style={{
                              background: "rgba(255,255,255,.15)",
                              borderRadius: 10, padding: "8px 10px",
                              fontSize: "1.4rem", lineHeight: 1,
                            }}>{e}</div>
                          ))}
                        </div>
                        <div className="d-flex justify-content-center gap-2">
                          {["📷","🔌","💾","🎮"].map(e => (
                            <div key={e} style={{
                              background: "rgba(255,255,255,.12)",
                              borderRadius: 10, padding: "8px 10px",
                              fontSize: "1.4rem", lineHeight: 1,
                            }}>{e}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-2 mt-3" style={{ fontSize: "1.2rem" }}>
                      Belanja & Jual Lebih Mudah
                    </h4>
                    <p style={{ opacity: .85, fontSize: ".85rem", lineHeight: 1.7 }}>
                      Temukan ribuan produk elektronik & aksesoris dari seller terpercaya di TokoKita.
                    </p>

                    {/* Feature pills */}
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {["✓ Gratis Ongkir","✓ Seller Terverifikasi","✓ Bayar Aman"].map(t => (
                        <span key={t} style={{
                          background: "rgba(255,255,255,.18)", borderRadius: 999,
                          padding: "4px 12px", fontSize: ".75rem", fontWeight: 600,
                        }}>{t}</span>
                      ))}
                    </div>

                    {/* Demo accounts */}
                    <div className="mt-auto pt-4">
                      <p className="fw-semibold mb-2" style={{ fontSize: ".72rem", opacity: .7, textTransform: "uppercase", letterSpacing: ".08em" }}>
                        Akun Demo
                      </p>
                      <div className="d-flex flex-column gap-2">
                        {DEMO.map(d => (
                          <button key={d.role}
                            className="btn btn-sm text-start d-flex align-items-center gap-2"
                            style={{ background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, transition: "background .15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.25)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                            onClick={() => setForm({ email: d.email, password: d.password })}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className={`bi ${d.icon}`} style={{ fontSize: ".85rem" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: ".8rem", fontWeight: 700, lineHeight: 1.2 }}>{d.role}</div>
                              <div style={{ fontSize: ".68rem", opacity: .75 }}>{d.email}</div>
                            </div>
                            <i className="bi bi-arrow-right-circle ms-auto opacity-75" style={{ fontSize: ".85rem" }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right panel ── */}
                <div className="col-md-7 d-flex flex-column justify-content-center"
                  style={{ padding: "48px 40px", background: "#fff" }}>

                  {/* Mobile logo */}
                  <div className="d-md-none fw-bold mb-4 text-center" style={{ fontSize: "1.6rem", color: "#03AC0E" }}>
                    Toko<span style={{ color: "#ffce31" }}>Kita</span>
                  </div>

                  <h3 className="fw-bold mb-1">Selamat Datang 👋</h3>
                  <p className="text-muted mb-4" style={{ fontSize: ".9rem" }}>
                    Masuk ke akun TokoKita kamu
                  </p>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: ".875rem" }}>
                      <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted" />
                        </span>
                        <input className="form-control border-start-0 ps-0" type="email"
                          placeholder="email@contoh.com" required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted" />
                        </span>
                        <input className="form-control border-start-0 ps-0" type="password"
                          placeholder="••••••••" required
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })} />
                      </div>
                    </div>

                    <button className="btn btn-primary w-100 py-2 fw-semibold" style={{ borderRadius: 10, fontSize: ".95rem" }}
                      disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Masuk...</>
                        : <><i className="bi bi-box-arrow-in-right me-2" />Masuk</>
                      }
                    </button>
                  </form>

                  <div className="d-flex align-items-center gap-3 my-4">
                    <hr className="flex-grow-1 m-0" />
                    <span className="text-muted" style={{ fontSize: ".8rem" }}>atau</span>
                    <hr className="flex-grow-1 m-0" />
                  </div>

                  {/* Mobile demo buttons */}
                  <div className="d-md-none">
                    <p className="text-muted text-center mb-2" style={{ fontSize: ".8rem" }}>Login cepat dengan akun demo:</p>
                    <div className="row g-2 mb-4">
                      {DEMO.map(d => (
                        <div key={d.role} className="col-6">
                          <button className="btn btn-outline-secondary btn-sm w-100 fw-semibold"
                            style={{ fontSize: ".75rem", borderRadius: 8 }}
                            onClick={() => setForm({ email: d.email, password: d.password })}>
                            <i className={`bi ${d.icon} me-1`} />{d.role}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-center mb-0" style={{ fontSize: ".9rem", color: "#555" }}>
                    Belum punya akun?{" "}
                    <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: "#03AC0E" }}>
                      Daftar Sekarang
                    </Link>
                  </p>

                  {/* Trust badges */}
                  <div className="d-flex justify-content-center gap-4 mt-4 pt-3 border-top">
                    {[
                      { icon: "bi-shield-check", label: "Aman" },
                      { icon: "bi-lock-fill",    label: "Terenkripsi" },
                      { icon: "bi-award-fill",   label: "Terpercaya" },
                    ].map(b => (
                      <div key={b.label} className="text-center" style={{ color: "#aaa", fontSize: ".72rem" }}>
                        <i className={`bi ${b.icon} d-block mb-1`} style={{ fontSize: "1.1rem", color: "#03AC0E" }} />
                        {b.label}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
