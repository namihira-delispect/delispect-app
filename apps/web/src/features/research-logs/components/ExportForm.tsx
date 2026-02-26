"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

const formStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  backgroundColor: "#ffffff",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
  marginTop: 0,
};

const fieldGroupStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "flex-end",
  marginBottom: "1rem",
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
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const messageStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#ef4444",
  marginTop: "0.5rem",
};

interface ExportFormProps {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function ExportForm({
  defaultStartDate = "",
  defaultEndDate = "",
}: ExportFormProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("開始日と終了日を入力してください");
      return;
    }

    if (startDate > endDate) {
      setError("開始日は終了日以前である必要があります");
      return;
    }

    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(`/api/research-logs/export?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data?.value?.cause ?? "エクスポートに失敗しました");
        return;
      }

      // BlobとしてダウンロードURLを生成
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `research-logs_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {
      setError("エクスポートに失敗しました。再度お試しください。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <form style={formStyle} onSubmit={handleExport}>
      <h2 style={titleStyle}>CSVエクスポート</h2>
      <div style={fieldGroupStyle}>
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
        <button
          type="submit"
          style={isExporting ? disabledButtonStyle : buttonStyle}
          disabled={isExporting}
        >
          {isExporting ? "エクスポート中..." : "CSVエクスポート"}
        </button>
      </div>
      {error && <p style={messageStyle}>{error}</p>}
    </form>
  );
}
