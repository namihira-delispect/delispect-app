import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogSearchForm } from "../AuditLogSearchForm";

// AUDIT_ACTIONSをモック
vi.mock("@/lib/audit", () => ({
  AUDIT_ACTIONS: {
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    VIEW: "VIEW",
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
  },
}));

describe("AuditLogSearchForm", () => {
  const defaultProps = {
    onSearch: vi.fn(),
    onClear: vi.fn(),
  };

  describe("レンダリング", () => {
    it("検索フォームが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByRole("search")).toBeDefined();
    });

    it("日時入力フィールドが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("開始日時")).toBeDefined();
      expect(screen.getByLabelText("終了日時")).toBeDefined();
    });

    it("ユーザー名入力フィールドが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("ユーザー名")).toBeDefined();
    });

    it("患者ID入力フィールドが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("患者ID")).toBeDefined();
    });

    it("IPアドレス入力フィールドが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("IPアドレス")).toBeDefined();
    });

    it("フリーワード入力フィールドが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("フリーワード")).toBeDefined();
    });

    it("操作種別のチェックボックスが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByText("ログイン")).toBeDefined();
      expect(screen.getByText("ログアウト")).toBeDefined();
    });

    it("検索ボタンとクリアボタンが表示される", () => {
      render(<AuditLogSearchForm {...defaultProps} />);
      expect(screen.getByText("検索")).toBeDefined();
      expect(screen.getByText("条件クリア")).toBeDefined();
    });
  });

  describe("検索実行", () => {
    it("検索ボタンをクリックするとonSearchが呼ばれる", () => {
      const onSearch = vi.fn();
      render(<AuditLogSearchForm {...defaultProps} onSearch={onSearch} />);

      fireEvent.click(screen.getByText("検索"));
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("ユーザー名を入力して検索するとパラメータに含まれる", () => {
      const onSearch = vi.fn();
      render(<AuditLogSearchForm {...defaultProps} onSearch={onSearch} />);

      const usernameInput = screen.getByLabelText("ユーザー名");
      fireEvent.change(usernameInput, { target: { value: "admin" } });
      fireEvent.click(screen.getByText("検索"));

      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ username: "admin" }),
      );
    });
  });

  describe("条件クリア", () => {
    it("クリアボタンをクリックするとonClearが呼ばれる", () => {
      const onClear = vi.fn();
      render(<AuditLogSearchForm {...defaultProps} onClear={onClear} />);

      fireEvent.click(screen.getByText("条件クリア"));
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("初期値", () => {
    it("initialParamsが指定された場合に初期値が設定される", () => {
      render(
        <AuditLogSearchForm
          {...defaultProps}
          initialParams={{ username: "test_user" }}
        />,
      );

      const usernameInput = screen.getByLabelText("ユーザー名") as HTMLInputElement;
      expect(usernameInput.value).toBe("test_user");
    });
  });
});
