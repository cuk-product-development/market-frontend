import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getAddresses, createAddress, checkout } from "../../api/customer";
import { CartItem, Address } from "../../types";
import Spinner from "../../components/ui/Spinner";

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems]           = useState<CartItem[]>([]);
  const [addresses, setAddresses]   = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "", street: "", city: "", province: "", postalCode: "", isDefault: false });

  useEffect(() => {
    Promise.all([getCart(), getAddresses()]).then(([cr, ar]) => {
      const cartItems = cr.data.data.items;
      const addrs: Address[] = ar.data.data;
      setItems(cartItems);
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault);
      if (def) setSelectedAddr(def.id);
      if (cartItems.length === 0) navigate("/cart");
    }).finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAddress(addrForm);
      const newAddr = res.data.data;
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddr(newAddr.id);
      setShowAddrForm(false);
      setAddrForm({ label: "", street: "", city: "", province: "", postalCode: "", isDefault: false });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Gagal simpan alamat");
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await checkout(selectedAddr || undefined);
      navigate(`/orders/${res.data.data.id}/payment`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Checkout gagal");
    } finally { setSubmitting(false); }
  };

  if (loading) return <Spinner />;

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const shipping = 10000;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">
        {/* Steps */}
        <div className="d-flex align-items-center gap-0 mb-4" style={{ maxWidth: 420 }}>
          {["Keranjang","Pengiriman","Pembayaran"].map((s, i) => (
            <React.Fragment key={s}>
              <div className="d-flex align-items-center gap-2">
                <div className={`d-flex align-items-center justify-content-center rounded-circle fw-bold`}
                  style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0,
                    background: i === 0 ? "#03AC0E" : i === 1 ? "#03AC0E" : "#dee2e6",
                    color: i <= 1 ? "#fff" : "#999" }}>
                  {i === 0 ? <i className="bi bi-check" /> : i + 1}
                </div>
                <span style={{ fontSize: ".8rem", fontWeight: i <= 1 ? 600 : 400, color: i <= 1 ? "#03AC0E" : "#aaa" }}>{s}</span>
              </div>
              {i < 2 && <div className="flex-grow-1 mx-2" style={{ height: 2, background: i === 0 ? "#03AC0E" : "#dee2e6", minWidth: 30 }} />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert alert-danger d-flex gap-2 align-items-center py-2 mb-3">
          <i className="bi bi-exclamation-circle-fill" />{error}
        </div>}

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8">
            {/* Address */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header py-3 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0"><i className="bi bi-geo-alt me-2 text-success" />Alamat Pengiriman</h6>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAddrForm(v => !v)}>
                  <i className="bi bi-plus me-1" />Tambah Alamat
                </button>
              </div>

              {showAddrForm && (
                <div className="card-body border-bottom bg-light">
                  <p className="fw-semibold mb-3" style={{ fontSize: ".875rem" }}>Alamat Baru</p>
                  <form onSubmit={handleAddAddress}>
                    <div className="row g-2">
                      <div className="col-12">
                        <input className="form-control form-control-sm" placeholder="Label (Rumah / Kantor)" required
                          value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} />
                      </div>
                      <div className="col-12">
                        <input className="form-control form-control-sm" placeholder="Alamat lengkap (jalan, nomor)" required
                          value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Kota" required
                          value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Provinsi" required
                          value={addrForm.province} onChange={e => setAddrForm(p => ({ ...p, province: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Kode Pos" required
                          value={addrForm.postalCode} onChange={e => setAddrForm(p => ({ ...p, postalCode: e.target.value }))} />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-sm btn-primary fw-semibold" type="submit">Simpan</button>
                      <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setShowAddrForm(false)}>Batal</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card-body">
                {addresses.length === 0 ? (
                  <div className="text-center text-muted py-3" style={{ fontSize: ".875rem" }}>
                    <i className="bi bi-geo d-block mb-1 fs-4" />Belum ada alamat. Tambahkan alamat pengiriman.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {addresses.map(a => (
                      <label key={a.id} className={`d-flex gap-3 p-3 rounded cursor-pointer border ${selectedAddr === a.id ? "border-success bg-success bg-opacity-10" : "border-light"}`}
                        style={{ cursor: "pointer" }}>
                        <input type="radio" className="form-check-input mt-0 flex-shrink-0" name="addr"
                          checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} />
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ fontSize: ".9rem" }}>{a.label}</span>
                            {a.isDefault && <span className="badge bg-success" style={{ fontSize: 10 }}>Utama</span>}
                          </div>
                          <div className="text-muted" style={{ fontSize: ".825rem" }}>
                            {a.street}, {a.city}, {a.province} {a.postalCode}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order items */}
            <div className="card border-0 shadow-sm">
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-box me-2 text-success" />Item Pesanan</h6>
              </div>
              <div className="list-group list-group-flush">
                {items.map(i => (
                  <div key={i.id} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2">
                    <div>
                      <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{i.product.name}</div>
                      <div className="text-muted" style={{ fontSize: ".8rem" }}>{i.product.store?.name} · {i.quantity} pcs</div>
                    </div>
                    <div className="fw-bold" style={{ fontSize: ".9rem" }}>
                      Rp {(Number(i.product.price) * i.quantity).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: 72 }}>
              <div className="card-header py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-receipt me-2 text-success" />Ringkasan Pembayaran</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".9rem" }}>
                  <span className="text-muted">Subtotal ({items.length} barang)</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="d-flex justify-content-between mb-3" style={{ fontSize: ".9rem" }}>
                  <span className="text-muted">Ongkos Kirim</span>
                  <span>Rp {shipping.toLocaleString("id-ID")}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total Pembayaran</span>
                  <span className="fw-bold text-success fs-6">Rp {(subtotal + shipping).toLocaleString("id-ID")}</span>
                </div>
                <button className="btn btn-primary w-100 fw-semibold py-2" disabled={submitting} onClick={handleCheckout}>
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Memproses...</>
                    : <><i className="bi bi-bag-check me-2" />Buat Pesanan</>
                  }
                </button>
                <button className="btn btn-outline-secondary w-100 mt-2 btn-sm" onClick={() => navigate("/cart")}>
                  <i className="bi bi-arrow-left me-1" />Kembali ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
