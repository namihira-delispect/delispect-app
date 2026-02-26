"use client";

import { useState, useCallback, type CSSProperties } from "react";
import type {
  CarePlanDetailResponse,
  TranscriptionHistoryEntry,
  TranscriptionOptions,
} from "../types";
import { generateTranscriptionText, DEFAULT_TRANSCRIPTION_OPTIONS } from "../types";

export interface TranscriptionPanelProps {
  /** ケアプラン詳細 */
  detail: CarePlanDetailResponse;
  /** 転記履歴 */
  histories: TranscriptionHistoryEntry[];
  /** 転記保存コールバック */
  onSaveTranscription: (content: string) => Promise<void>;
}

const panelStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  padding: "1rem",
  marginTop: "1rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
};

const optionGroupStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginBottom: "0.75rem",
  flexWrap: "wrap",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  color: "#475569",
  cursor: "pointer",
};

const previewStyle: CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  padding: "0.75rem",
  fontSize: "0.8125rem",
  color: "#334155",
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  maxHeight: "300px",
  overflowY: "auto",
  marginBottom: "0.75rem",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const primaryButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
};

const disabledButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const successMessageStyle: CSSProperties = {
  color: "#16a34a",
  fontSize: "0.8125rem",
  marginTop: "0.5rem",
};

const errorMessageStyle: CSSProperties = {
  color: "#dc2626",
  fontSize: "0.8125rem",
  marginTop: "0.5rem",
};

const historyTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  marginTop: "1.5rem",
  marginBottom: "0.5rem",
};

const historyItemStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  padding: "0.375rem 0",
  borderBottom: "1px solid #f1f5f9",
};

/**
 * 看護記録転記パネルコンポーネント
 *
 * ケアプラン詳細から転記用テキストを生成し、
 * クリップボードへのコピーおよび転記履歴の保存を行う。
 */
export function TranscriptionPanel({
  detail,
  histories,
  onSaveTranscription,
}: TranscriptionPanelProps) {
  const [options, setOptions] = useState<TranscriptionOptions>(DEFAULT_TRANSCRIPTION_OPTIONS);
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const transcriptionText = generateTranscriptionText(detail, options);

  const handleOptionChange = useCallback((key: keyof TranscriptionOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage(null);
  }, []);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      setCopying(true);
      setMessage(null);
      await navigator.clipboard.writeText(transcriptionText);
      setMessage({ type: "success", text: "クリップボードにコピーしました" });
    } catch {
      setMessage({
        type: "error",
        text: "コピーに失敗しました。ブラウザの権限を確認してください。",
      });
    } finally {
      setCopying(false);
    }
  }, [transcriptionText]);

  const handleCopyAndSave = useCallback(async () => {
    try {
      setSaving(true);
      setMessage(null);

      // クリップボードにコピー
      try {
        await navigator.clipboard.writeText(transcriptionText);
      } catch {
        // クリップボードコピーに失敗しても転記履歴の保存は続行
      }

      // 転記履歴の保存
      await onSaveTranscription(transcriptionText);
      setMessage({ type: "success", text: "クリップボードにコピーし、転記履歴を保存しました" });
    } catch {
      setMessage({ type: "error", text: "転記履歴の保存に失敗しました" });
    } finally {
      setSaving(false);
    }
  }, [transcriptionText, onSaveTranscription]);

  return (
    <div style={panelStyle} data-testid="transcription-panel">
      <div style={titleStyle}>看護記録転記</div>

      <div style={optionGroupStyle}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={options.includeAssessment}
            onChange={() => handleOptionChange("includeAssessment")}
          />
          アセスメント結果
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={options.includeSuggestions}
            onChange={() => handleOptionChange("includeSuggestions")}
          />
          ケア提案内容
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={options.includeStatus}
            onChange={() => handleOptionChange("includeStatus")}
          />
          実施状況
        </label>
      </div>

      <div style={previewStyle} data-testid="transcription-preview">
        {transcriptionText}
      </div>

      <div style={buttonGroupStyle}>
        <button
          style={copying ? disabledButtonStyle : secondaryButtonStyle}
          onClick={() => void handleCopyToClipboard()}
          disabled={copying}
        >
          {copying ? "コピー中..." : "クリップボードにコピー"}
        </button>
        <button
          style={saving ? disabledButtonStyle : primaryButtonStyle}
          onClick={() => void handleCopyAndSave()}
          disabled={saving}
        >
          {saving ? "保存中..." : "コピー＆転記履歴保存"}
        </button>
      </div>

      {message && (
        <div
          style={message.type === "success" ? successMessageStyle : errorMessageStyle}
          data-testid="transcription-message"
        >
          {message.text}
        </div>
      )}

      {histories.length > 0 && (
        <>
          <div style={historyTitleStyle}>転記履歴（{histories.length}件）</div>
          {histories.map((history) => (
            <div key={history.id} style={historyItemStyle}>
              {formatDateTime(history.createdAt)}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}
