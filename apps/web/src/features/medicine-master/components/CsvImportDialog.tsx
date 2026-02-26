"use client";

import { useState, useCallback, useRef, type CSSProperties } from "react";
import type { CsvImportPreview } from "../types";

export interface CsvImportDialogProps {
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** プレビュー実行コールバック */
  onPreview: (csvText: string) => Promise<CsvImportPreview | null>;
  /** インポート実行コールバック */
  onImport: (csvText: string) => Promise<boolean>;
  /** 閉じるコールバック */
  onClose: () => void;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  minWidth: "32rem",
  maxWidth: "40rem",
  maxHeight: "80vh",
  overflow: "auto",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const dropzoneStyle = (isDragging: boolean): CSSProperties => ({
  border: `2px dashed ${isDragging ? "#3b82f6" : "#cbd5e1"}`,
  borderRadius: "0.5rem",
  padding: "2rem",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragging ? "#eff6ff" : "#f8fafc",
  transition: "all 0.2s",
});

const previewContainerStyle: CSSProperties = {
  marginTop: "1rem",
  padding: "1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
  border: "1px solid #e2e8f0",
};

const previewStatStyle: CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  marginBottom: "0.5rem",
};

const statItemStyle = (color: string): CSSProperties => ({
  fontSize: "0.875rem",
  color,
  fontWeight: 500,
});

const errorListStyle: CSSProperties = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  borderRadius: "0.25rem",
  border: "1px solid #fecaca",
  fontSize: "0.8125rem",
  color: "#991b1b",
  maxHeight: "12rem",
  overflowY: "auto",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
  marginTop: "1.5rem",
};

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const importButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const successStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "0.375rem",
  color: "#16a34a",
  fontSize: "0.875rem",
  marginTop: "1rem",
};

const errorMsgStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.375rem",
  color: "#dc2626",
  fontSize: "0.875rem",
  marginTop: "1rem",
};

/**
 * CSVインポートダイアログコンポーネント
 *
 * ファイルアップロード、差分プレビュー、インポート実行を提供する。
 */
export function CsvImportDialog({ isOpen, onPreview, onImport, onClose }: CsvImportDialogProps) {
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setCsvText("");
    setFileName("");
    setPreview(null);
    setIsLoading(false);
    setIsImporting(false);
    setImportSuccess(false);
    setErrorMessage("");
  }, []);

  const handleFileRead = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setErrorMessage("CSVファイルを選択してください");
        return;
      }

      setErrorMessage("");
      setFileName(file.name);

      const text = await file.text();
      setCsvText(text);

      // 自動的にプレビューを実行
      setIsLoading(true);
      try {
        const result = await onPreview(text);
        setPreview(result);
      } catch {
        setErrorMessage("プレビューの生成に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [onPreview],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead],
  );

  const handleImport = useCallback(async () => {
    if (!csvText) return;

    setIsImporting(true);
    setErrorMessage("");
    try {
      const success = await onImport(csvText);
      if (success) {
        setImportSuccess(true);
      } else {
        setErrorMessage("インポートに失敗しました");
      }
    } catch {
      setErrorMessage("インポート処理中にエラーが発生しました");
    } finally {
      setIsImporting(false);
    }
  }, [csvText, onImport]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  if (!isOpen) return null;

  const canImport =
    preview &&
    preview.errors.length === 0 &&
    (preview.addCount > 0 || preview.updateCount > 0 || preview.deleteCount > 0) &&
    !importSuccess;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div style={dialogStyle}>
        <h2 id="csv-import-title" style={titleStyle}>
          CSVインポート
        </h2>

        {!importSuccess && (
          <>
            <div
              style={dropzoneStyle(isDragging)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="CSVファイルをドロップまたはクリックして選択"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                {fileName ? `選択済み: ${fileName}` : "CSVファイルをドロップまたはクリックして選択"}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                UTF-8エンコーディングのCSVファイル
              </p>
            </div>

            {isLoading && (
              <p style={{ textAlign: "center", color: "#64748b", marginTop: "1rem" }}>
                プレビュー生成中...
              </p>
            )}
          </>
        )}

        {preview && !importSuccess && (
          <div style={previewContainerStyle}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1e293b",
              }}
            >
              差分プレビュー
            </h3>
            <div style={previewStatStyle}>
              <span style={statItemStyle("#16a34a")}>追加: {preview.addCount}件</span>
              <span style={statItemStyle("#d97706")}>変更: {preview.updateCount}件</span>
              <span style={statItemStyle("#dc2626")}>削除: {preview.deleteCount}件</span>
            </div>

            {preview.errors.length > 0 && (
              <div style={errorListStyle}>
                <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                  バリデーションエラー ({preview.errors.length}件)
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {preview.errors.map((err, i) => (
                    <li key={i}>
                      行{err.row} [{err.column}]: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {importSuccess && <div style={successStyle}>CSVインポートが正常に完了しました。</div>}

        {errorMessage && <div style={errorMsgStyle}>{errorMessage}</div>}

        <div style={buttonGroupStyle}>
          <button type="button" style={cancelButtonStyle} onClick={handleClose}>
            {importSuccess ? "閉じる" : "キャンセル"}
          </button>
          {canImport && (
            <button
              type="button"
              style={{
                ...importButtonStyle,
                opacity: isImporting ? 0.6 : 1,
              }}
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? "インポート中..." : "インポート実行"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
