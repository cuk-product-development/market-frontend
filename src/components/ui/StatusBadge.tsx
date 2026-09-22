import React from "react";

const config: Record<string, { label: string; icon: string }> = {
  PENDING:    { label: "Menunggu",   icon: "bi-clock-fill" },
  PROCESSING: { label: "Diproses",   icon: "bi-gear-fill" },
  SHIPPED:    { label: "Dikirim",    icon: "bi-truck" },
  DELIVERED:  { label: "Diterima",   icon: "bi-check-circle-fill" },
  CANCELLED:  { label: "Dibatalkan", icon: "bi-x-circle-fill" },
  PAID:       { label: "Lunas",      icon: "bi-check-circle-fill" },
  FAILED:     { label: "Gagal",      icon: "bi-x-circle-fill" },
  APPROVED:   { label: "Aktif",      icon: "bi-check-circle-fill" },
  REJECTED:   { label: "Ditolak",    icon: "bi-slash-circle-fill" },
  SUSPENDED:  { label: "Disuspend",  icon: "bi-pause-circle-fill" },
  ACTIVE:     { label: "Aktif",      icon: "bi-circle-fill" },
  INACTIVE:   { label: "Nonaktif",   icon: "bi-circle" },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { label: status, icon: "bi-circle" };
  return (
    <span className={`badge-status badge-${status}`}>
      <i className={`bi ${c.icon}`} style={{ fontSize: ".65rem" }} />
      {c.label}
    </span>
  );
}
