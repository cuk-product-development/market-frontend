import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiRegister(form);
      const { user, token } = res.data.data;
      login(user, token);
      if (user.role === "SELLER") navigate("/seller");
      else navigate("/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Gagal mendaftar");
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

                  {/* Decorative circles */}
                  <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: -70, right: -70 }} />
                  <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.06)", bottom: 60, left: -50 }} />

                  <div className="p-4 p-lg-5 d-flex flex-column h-100 position-relative">
                    <div className="fw-bold mb-4" style={{ fontSize: "1.8rem" }}>
                      Toko<span style={{ color: "#ffce31" }}>Kita</span>
                    </div>

                    {/* Illustration */}
                    <div className="text-center my-3">
                      <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 20, padding: "28px 20px" }}>
                        <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>🚀</div>
                        <div className="d-flex justify-content-center gap-3">
                          {[
                            { icon: "🛒", label: "Belanja" },
                            { icon: "🏪", label: "Berjualan" },
                            { icon: "💰", label: "Cuan" },
                          ].map(i => (
                            <div key={i.label} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{i.icon}</div>
                              <div style={{ fontSize: ".7rem", opacity: .85 }}>{i.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-2 mt-3" style={{ fontSize: "1.2rem" }}>Bergabung Sekarang</h4>
                    <p style={{ opacity: .85, fontSize: ".85rem", lineHeight: 1.7 }}>
                      Daftar gratis dan mulai belanja atau berjualan di TokoKita.
                    </p>

                    {/* Benefits */}
                    <div className="d-flex flex-column gap-3 mt-3">
                      {[
                        { icon: "bi-person-check-fill", title: "Daftar Gratis",     desc: "Proses cepat, tidak butuh kartu kredit" },
                        { icon: "bi-shield-fill-check", title: "Aman & Terpercaya", desc: "Data kamu terlindungi enkripsi SSL" },
                        { icon: "bi-graph-up-arrow",    title: "Mulai Berjualan",   desc: "Buka toko dan raih penghasilan" },
                      ].map(f => (
                        <div key={f.title} className="d-flex gap-3 align-items-start">
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <i className={`bi ${f.icon}`} style={{ fontSize: ".9rem" }} />
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: ".85rem", lineHeight: 1.3 }}>{f.title}</div>
                            <div style={{ fontSize: ".75rem", opacity: .75 }}>{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4" style={{ fontSize: ".82rem", opacity: .75 }}>
                      Sudah punya akun?{" "}
                      <Link to="/login" style={{ color: "#ffce31", fontWeight: 700 }}>Masuk di sini</Link>
                    </div>
                  </div>
                </div>

                {/* ── Right panel ── */}
                <div className="col-md-7 d-flex flex-column justify-content-center"
                  style={{ padding: "40px 40px", background: "#fff" }}>

                  <div className="d-md-none fw-bold mb-4 text-center" style={{ fontSize: "1.6rem", color: "#03AC0E" }}>
                    Toko<span style={{ color: "#ffce31" }}>Kita</span>
                  </div>

                  <h3 className="fw-bold mb-1">Buat Akun Baru</h3>
                  <p className="text-muted mb-4" style={{ fontSize: ".9rem" }}>Gratis dan selesai dalam 1 menit!</p>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: ".875rem" }}>
                      <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Nama Lengkap</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person text-muted" />
                        </span>
                        <input className="form-control border-start-0 ps-0" placeholder="Nama lengkap kamu" required
                          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted" />
                        </span>
                        <input className="form-control border-start-0 ps-0" type="email"
                          placeholder="email@contoh.com" required
                          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted" />
                        </span>
                        <input className="form-control border-start-0 ps-0" type="password"
                          placeholder="Min. 6 karakter" required minLength={6}
                          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: ".875rem" }}>Daftar sebagai</label>
                      <div className="row g-2">
                        {[
                          { val: "CUSTOMER", icon: "🛒", title: "Customer",  desc: "Saya ingin belanja" },
                          { val: "SELLER",   icon: "🏪", title: "Seller",    desc: "Saya ingin berjualan" },
                        ].map(r => (
                          <div key={r.val} className="col-6">
                            <input type="radio" className="btn-check" id={`role-${r.val}`}
                              name="role" checked={form.role === r.val}
                              onChange={() => setForm({ ...form, role: r.val })} />
                            <label htmlFor={`role-${r.val}`}
                              className="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-1"
                              style={{ borderRadius: 12, fontSize: ".82rem", transition: "all .15s" }}>
                              <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{r.icon}</span>
                              <span className="fw-bold">{r.title}</span>
                              <span className="text-muted" style={{ fontSize: ".72rem" }}>{r.desc}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-primary w-100 py-2 fw-semibold" style={{ borderRadius: 10, fontSize: ".95rem" }}
                      disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Mendaftar...</>
                        : <><i className="bi bi-person-plus me-2" />Daftar Sekarang</>
                      }
                    </button>
                  </form>

                  <p className="text-center mt-4 mb-0" style={{ fontSize: ".9rem", color: "#555" }}>
                    Sudah punya akun?{" "}
                    <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "#03AC0E" }}>
                      Masuk
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
