import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserListClient } from "../UserListClient";

// Next.js router mock
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// deactivateUser action mock
vi.mock("../actions", () => ({
  deactivateUser: vi.fn().mockResolvedValue({ success: true }),
}));

const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    firstName: "太郎",
    lastName: "管理",
    isActive: true,
    roles: [{ id: 1, name: "SUPER_ADMIN" }],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    username: "nurse01",
    email: "nurse@example.com",
    firstName: "花子",
    lastName: "看護",
    isActive: true,
    roles: [{ id: 3, name: "GENERAL_USER" }],
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    username: "inactive_user",
    email: "inactive@example.com",
    firstName: "次郎",
    lastName: "無効",
    isActive: false,
    roles: [{ id: 3, name: "GENERAL_USER" }],
    createdAt: "2026-01-03T00:00:00.000Z",
  },
];

describe("UserListClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザー一覧が表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("nurse01")).toBeInTheDocument();
    expect(screen.getByText("inactive_user")).toBeInTheDocument();
  });

  it("ユーザー件数が表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByTestId("user-total-count")).toHaveTextContent(
      "3件のユーザー"
    );
  });

  it("ロール名が日本語で表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByText("全権管理者")).toBeInTheDocument();
    expect(screen.getAllByText("一般ユーザー")).toHaveLength(2);
  });

  it("有効/無効の状態が表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    // テーブル内の状態表示（フィルターのドロップダウンにも「有効」があるため3件）
    const activeStatuses = screen.getAllByText("有効");
    expect(activeStatuses.length).toBeGreaterThanOrEqual(2);
    // 「無効」はテーブルとフィルターの両方にある
    const inactiveStatuses = screen.getAllByText("無効");
    expect(inactiveStatuses.length).toBeGreaterThanOrEqual(1);
  });

  it("新規登録リンクが存在する", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    const createLink = screen.getByText("新規登録");
    expect(createLink).toHaveAttribute("href", "/admin/users/new");
  });

  it("編集リンクが各ユーザーに存在する", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByTestId("user-edit-1")).toHaveAttribute(
      "href",
      "/admin/users/1"
    );
    expect(screen.getByTestId("user-edit-2")).toHaveAttribute(
      "href",
      "/admin/users/2"
    );
  });

  it("有効なユーザーに無効化ボタンが表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByTestId("user-deactivate-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-deactivate-2")).toBeInTheDocument();
    // 無効ユーザーには無効化ボタンがない
    expect(screen.queryByTestId("user-deactivate-3")).not.toBeInTheDocument();
  });

  it("ユーザーが0件の場合にメッセージが表示される", () => {
    render(
      <UserListClient
        users={[]}
        totalCount={0}
        totalPages={0}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByTestId("user-empty-message")).toHaveTextContent(
      "ユーザーが見つかりません"
    );
  });

  it("検索フォームで検索できる", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    const input = screen.getByTestId("user-search-input");
    fireEvent.change(input, { target: { value: "admin" } });
    fireEvent.submit(screen.getByTestId("user-search-form"));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("query=admin")
    );
  });

  it("ソートボタンをクリックするとソート順が変わる", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    fireEvent.click(screen.getByTestId("sort-username"));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("sortKey=username")
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("sortDirection=asc")
    );
  });

  it("ページネーションが複数ページの場合に表示される", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={60}
        totalPages={3}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.getByTestId("user-pagination")).toBeInTheDocument();
  });

  it("ページネーションが1ページの場合に非表示", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    expect(screen.queryByTestId("user-pagination")).not.toBeInTheDocument();
  });

  it("状態フィルターが変更できる", () => {
    render(
      <UserListClient
        users={mockUsers}
        totalCount={3}
        totalPages={1}
        currentPage={1}
        query=""
        sortKey="createdAt"
        sortDirection="desc"
      />
    );

    const filter = screen.getByTestId("user-status-filter");
    fireEvent.change(filter, { target: { value: "true" } });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("isActive=true")
    );
  });
});
