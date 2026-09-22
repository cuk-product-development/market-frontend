import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function imgSrc(url?: string) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API}${url}`;
}

export default function ProductCard({ product, onAddCart }: {
  product: Product;
  onAddCart?: (p: Product) => void;
}) {
  const src = imgSrc(product.imageUrl);
  const price = Number(product.price).toLocaleString("id-ID");

  return (
    <div className="card product-card h-100">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        {src
          ? <img src={src} className="card-img-top product-img w-100" alt={product.name} loading="lazy" />
          : <div className="product-img-placeholder">📦</div>
        }
        <div className="card-body p-2">
          <div className="product-name mb-1">{product.name}</div>
          <div className="product-price">Rp {price}</div>
          {product.store && (
            <div className="product-store mt-1">
              <i className="bi bi-geo-alt me-1" />
              {product.store.name}
            </div>
          )}
          {product.stock === 0 && (
            <span className="badge bg-secondary mt-1" style={{ fontSize: 10 }}>Stok Habis</span>
          )}
        </div>
      </Link>
      {onAddCart && (
        <div className="card-footer p-2 bg-white border-top-0">
          <button
            className="btn btn-outline-primary btn-sm w-100"
            disabled={product.stock === 0}
            onClick={() => onAddCart(product)}
          >
            <i className="bi bi-cart-plus me-1" />
            {product.stock === 0 ? "Habis" : "Keranjang"}
          </button>
        </div>
      )}
    </div>
  );
}
