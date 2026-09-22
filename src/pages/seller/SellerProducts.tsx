import React, { useEffect, useState, useCallback } from "react";
import { getMyProducts, createProduct, updateProduct, deleteProduct, uploadImage } from "../../api/seller";
import { Product } from "../../types";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LIMIT = 10;
const emptyForm = { name: "", description: "", price: "", stock: "", imageUrl: "", status: "ACTIVE" };

interface Meta { page: number; limit: number; total: number; totalPages: number; }

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta]         = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tabStatus, setTabStatus] = useState("ALL");

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (search) params.search = search;
    if (tabStatus !== "ALL") params.status = tabStatus;
    getMyProducts(params)
      .then(r => { setProducts(r.data.data.data); setMeta(r.data.data.meta); })
      .catch(() => { setProducts([]); })
      .finally(() => setLoading(false));
  }, [search, tabStatus]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price),
      stock: String(p.stock), imageUrl: p.imageUrl || "", status: p.status });
    setShowModal(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const r = await uploadImage(file); setForm(f => ({ ...f, imageUrl: r.data.data.url })); showToast("Foto diupload"); }
    catch { showToast("Upload gagal", false); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, { name: form.name, description: form.description,
          price: Number(form.price), stock: Number(form.stock), imageUrl: form.imageUrl,
          status: form.status as "ACTIVE" | "INACTIVE" });
        showToast("Produk diperbarui");
      } else {
        await createProduct({ name: form.name, description: form.description,
          price: Number(form.price), stock: Number(form.stock), imageUrl: form.imageUrl });
        showToast("Produk ditambahkan");
      }
      setShowModal(false); load(meta.page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e.response?.data?.error || "Gagal menyimpan", false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try { await deleteProduct(p.id); showToast("Produk dihapus"); load(meta.page); }
    catch { showToast("Gagal menghapus", false); }
  };

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
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1"><i className="bi bi-box-seam me-2 text-success" />Produk Saya</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{meta.total} produk terdaftar</span>
          </div>
          <button className="btn btn-primary fw-semibold" onClick={openAdd}>
            <i className="bi bi-plus-lg me-2" />Tambah Produk
          </button>
        </div>

        {/* Filter bar */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex gap-1">
              {["ALL","ACTIVE","INACTIVE"].map(t => (
                <button key={t} className={`btn btn-sm fw-semibold ${tabStatus === t ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => { setTabStatus(t); setSearch(""); setSearchInput(""); }} style={{ fontSize: ".8rem" }}>
                  {t === "ALL" ? "Semua" : <StatusBadge status={t} />}
                </button>
              ))}
            </div>
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <div className="input-group input-group-sm" style={{ width: 260 }}>
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                <input className="form-control border-start-0" placeholder="Cari nama produk..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              </div>
              <button className="btn btn-sm btn-primary" type="submit">Cari</button>
              {search && <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => { setSearch(""); setSearchInput(""); }}>✕</button>}
            </form>
          </div>
        </div>

        {/* Table */}
        {loading ? <Spinner /> : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr><th style={{ width: 50 }}>#</th><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th style={{ width: 110 }}>Aksi</th></tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-box d-block mb-2 fs-3" />
                      {search ? "Produk tidak ditemukan" : "Belum ada produk. Klik 'Tambah Produk' untuk mulai."}
                    </td></tr>
                  ) : products.map(p => {
                    const img = p.imageUrl ? (p.imageUrl.startsWith("http") ? p.imageUrl : `${API}${p.imageUrl}`) : null;
                    return (
                      <tr key={p.id}>
                        <td className="text-muted" style={{ fontSize: ".8rem" }}>{p.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "#f8f9fa", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: "1.4rem" }}>📦</span>}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: ".875rem" }}>{p.name}</div>
                              {p.description && <div className="text-muted" style={{ fontSize: ".75rem", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                        <td>
                          <span className={`fw-semibold ${p.stock === 0 ? "text-danger" : p.stock <= 5 ? "text-warning" : "text-success"}`}>{p.stock}</span>
                          {p.stock === 0 && <span className="ms-1 badge bg-danger" style={{ fontSize: 10 }}>Habis</span>}
                          {p.stock > 0 && p.stock <= 5 && <span className="ms-1 badge bg-warning text-dark" style={{ fontSize: 10 }}>Sedikit</span>}
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)} title="Edit"><i className="bi bi-pencil" /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)} title="Hapus"><i className="bi bi-trash" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white px-3 py-2">
              <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPage={p => load(p)} />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2 text-success`} />
                  {editing ? "Edit Produk" : "Tambah Produk Baru"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Nama Produk <span className="text-danger">*</span></label>
                      <input className="form-control" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Harga (Rp) <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text">Rp</span>
                        <input className="form-control" type="number" min="0" required value={form.price}
                          onChange={e => setForm({ ...form, price: e.target.value })} />
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Stok <span className="text-danger">*</span></label>
                      <input className="form-control" type="number" min="0" required value={form.stock}
                        onChange={e => setForm({ ...form, stock: e.target.value })} />
                    </div>
                    {editing && (
                      <div className="col-6">
                        <label className="form-label fw-semibold">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                          <option value="ACTIVE">Aktif</option>
                          <option value="INACTIVE">Nonaktif</option>
                        </select>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Deskripsi</label>
                      <textarea className="form-control" rows={3} value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Foto Produk</label>
                      <input className="form-control" type="file" accept="image/*" onChange={handleImage} />
                      {uploading && <div className="text-muted mt-1" style={{ fontSize: ".8rem" }}><span className="spinner-border spinner-border-sm me-1" />Mengupload...</div>}
                      {form.imageUrl && (
                        <img src={form.imageUrl.startsWith("http") ? form.imageUrl : `${API}${form.imageUrl}`}
                          alt="preview" className="mt-2 rounded" style={{ height: 100, objectFit: "cover" }} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={saving || uploading}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</> : <><i className="bi bi-check-lg me-2" />Simpan</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
