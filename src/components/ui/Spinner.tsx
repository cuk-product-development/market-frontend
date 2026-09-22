import React from "react";

export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? 48 : size === "sm" ? 20 : 32;
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-success" style={{ width: s, height: s }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
