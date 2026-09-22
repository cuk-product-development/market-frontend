import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStores } from "../../api/customer";
import { Store } from "../../types";
import Spinner from "../../components/ui/Spinner";

export default function StoreList() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    getStores().then(r => setStores(r.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.seller?.name?.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div className="container-xl py-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-0">Semua Toko</h4>
            <span className="text-muted" style={{ fontSize: ".875rem" }}>{stores.length} toko aktif</span>
          </div>
          <div style={{ width: 280 }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
              <input className="form-control border-start-0" placeholder="Cari toko..."
                value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-shop display-4 text-muted d-block mb-3" />
            <h5 className="fw-bold">Toko tidak ditemukan</h5>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {filtered.map(s => (
              <div key={s.id} className="col">
                <div className="card h-100 border-0 shadow-sm product-card"
                  onClick={() => navigate(`/stores/${s.id}`)}>
                  <div className="card-body d-flex flex-column align-items-center text-center p-4">
                    <div className="avatar-circle avatar-circle-lg mb-3">
                      {s.name[0].toUpperCase()}
                    </div>
                    <h6 className="fw-bold mb-1">{s.name}</h6>
                    <p className="text-muted mb-2" style={{ fontSize: ".8rem" }}>
                      <i className="bi bi-person me-1" />{s.seller?.name}
                    </p>
                    {s.description && (
                      <p className="text-muted mb-2" style={{ fontSize: ".8rem", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.description}
                      </p>
                    )}
                    <div className="mt-auto pt-2">
                      <span className="badge bg-success-subtle text-success fw-semibold">
                        <i className="bi bi-box me-1" />{s._count?.products || 0} produk
                      </span>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-top text-center py-2">
                    <span className="text-primary fw-semibold" style={{ fontSize: ".85rem" }}>
                      Kunjungi Toko <i className="bi bi-arrow-right" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
