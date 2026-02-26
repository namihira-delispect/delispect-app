"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";

const formStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "flex-end",
  marginBottom: "1.5rem",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 500,
};

const inputStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#1e293b",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

interface DashboardFilterProps {
  defaultStartDate: string;
  defaultEndDate: string;
}

export function DashboardFilter({
  defaultStartDate,
  defaultEndDate,
}: DashboardFilterProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ startDate, endDate });
    router.push(`/admin/research-logs?${params.toString()}`);
  };

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <div style={fieldStyle}>
        <label style={labelStyle}>開始日</label>
        <input
          type="date"
          style={inputStyle}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>終了日</label>
        <input
          type="date"
          style={inputStyle}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button type="submit" style={buttonStyle}>
        表示期間を変更
      </button>
    </form>
  );
}
