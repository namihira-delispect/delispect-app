import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogTable } from "../AuditLogTable";
import type { MaskedAuditLogEntry } from "../../types";

const mockLogs: MaskedAuditLogEntry[] = [
  {
    id: "1",
    actorId: 1,
    actorUsername: "admin_user",
    action: "LOGIN",
    targetType: "SESSION",
    targetId: "sess-001",
    occurredAt: "2026-02-26T10:00:00.000Z",
    ipAddress: "192.168.1.1",
    beforeData: null,
    afterData: { ipAddress: "192.168.1.1" },
    maskedActorUsername: "a*********r",
    maskedPatientName: null,
  },
  {
    id: "2",
    actorId: 2,
    actorUsername: "nurse_user",
    action: "VIEW",
    targetType: "PATIENT",
    targetId: "P001",
    occurredAt: "2026-02-26T11:00:00.000Z",
    ipAddress: "192.168.1.2",
    beforeData: null,
    afterData: { patientLastName: "山田", patientFirstName: "太郎" },
    maskedActorUsername: "n********r",
    maskedPatientName: "山○太○",
  },
];

describe("AuditLogTable", () => {
  const defaultProps = {
    logs: mockLogs,
    sortColumn: "occurredAt",
    sortDirection: "desc" as const,
    onSort: vi.fn(),
  };

  describe("レンダリング", () => {
    it("テーブルが表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByLabelText("監査ログ一覧")).toBeDefined();
    });

    it("ログの件数分の行が表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      // テーブル行を確認（ヘッダー + データ行）
      expect(screen.getByText("a*********r")).toBeDefined();
      expect(screen.getByText("n********r")).toBeDefined();
    });

    it("マスキングされたユーザー名が表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByText("a*********r")).toBeDefined();
      expect(screen.queryByText("admin_user")).toBeNull();
    });

    it("操作種別のラベルが表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByText("ログイン")).toBeDefined();
      expect(screen.getByText("閲覧")).toBeDefined();
    });

    it("対象種別のラベルが表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByText("セッション")).toBeDefined();
      expect(screen.getByText("患者")).toBeDefined();
    });

    it("IPアドレスが表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByText("192.168.1.1")).toBeDefined();
    });

    it("マスキング済み患者名が表示される", () => {
      render(<AuditLogTable {...defaultProps} />);
      expect(screen.getByText("山○太○")).toBeDefined();
    });
  });

  describe("空の状態", () => {
    it("ログが空の場合はメッセージが表示される", () => {
      render(<AuditLogTable {...defaultProps} logs={[]} />);
      expect(screen.getByText("該当する監査ログはありません")).toBeDefined();
    });
  });

  describe("ソート", () => {
    it("日時ヘッダーをクリックするとonSortが呼ばれる", () => {
      const onSort = vi.fn();
      render(<AuditLogTable {...defaultProps} onSort={onSort} />);

      const sortButton = screen.getByLabelText("日時でソート");
      fireEvent.click(sortButton);
      expect(onSort).toHaveBeenCalled();
    });
  });

  describe("マスキング解除", () => {
    it("canUnmask=trueの場合にマスキング解除列が表示される", () => {
      render(
        <AuditLogTable
          {...defaultProps}
          canUnmask={true}
          onUnmask={vi.fn()}
        />,
      );
      expect(screen.getByText("マスキング")).toBeDefined();
    });

    it("canUnmask=falseの場合にマスキング解除列が表示されない", () => {
      render(<AuditLogTable {...defaultProps} canUnmask={false} />);
      expect(screen.queryByText("マスキング")).toBeNull();
    });

    it("解除ボタンをクリックするとonUnmaskが呼ばれる", () => {
      const onUnmask = vi.fn();
      render(
        <AuditLogTable
          {...defaultProps}
          canUnmask={true}
          onUnmask={onUnmask}
        />,
      );

      const unmaskButtons = screen.getAllByText("解除");
      fireEvent.click(unmaskButtons[0]);
      expect(onUnmask).toHaveBeenCalledWith("1");
    });

    it("マスキング解除済みのログには解除済みと表示される", () => {
      const unmaskedIds = new Set(["1"]);
      const unmaskedUsernames = new Map([["1", "admin_user"]]);
      render(
        <AuditLogTable
          {...defaultProps}
          canUnmask={true}
          onUnmask={vi.fn()}
          unmaskedLogIds={unmaskedIds}
          unmaskedUsernames={unmaskedUsernames}
        />,
      );

      expect(screen.getByText("解除済み")).toBeDefined();
      // 解除済みのログは実ユーザー名が表示される
      expect(screen.getByText("admin_user")).toBeDefined();
    });
  });

  describe("詳細展開", () => {
    it("対象IDをクリックすると詳細が展開される", () => {
      render(<AuditLogTable {...defaultProps} />);

      const targetIdButton = screen.getByLabelText(
        "詳細を開く: sess-001",
      );
      fireEvent.click(targetIdButton);

      // 展開後に変更後データが表示される
      expect(screen.getByText("変更後:")).toBeDefined();
    });
  });
});
