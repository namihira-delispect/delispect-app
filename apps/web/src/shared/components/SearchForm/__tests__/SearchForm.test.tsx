import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "../SearchForm";

describe("SearchForm", () => {
  it("検索フォームが表示される", () => {
    render(<SearchForm onSearch={vi.fn()} />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByLabelText("検索キーワード")).toBeInTheDocument();
  });

  it("カスタムプレースホルダーが表示される", () => {
    render(<SearchForm onSearch={vi.fn()} placeholder="患者名で検索" />);
    expect(screen.getByPlaceholderText("患者名で検索")).toBeInTheDocument();
  });

  it("検索ボタンをクリックするとonSearchが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} />);

    const input = screen.getByLabelText("検索キーワード");
    await user.type(input, "テスト");
    await user.click(screen.getByText("検索"));

    expect(onSearch).toHaveBeenCalledWith("テスト");
  });

  it("Enterキーで検索が実行される", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} />);

    const input = screen.getByLabelText("検索キーワード");
    await user.type(input, "テスト{Enter}");

    expect(onSearch).toHaveBeenCalledWith("テスト");
  });

  it("テキスト入力時にクリアボタンが表示される", async () => {
    const user = userEvent.setup();

    render(<SearchForm onSearch={vi.fn()} />);

    const input = screen.getByLabelText("検索キーワード");
    await user.type(input, "テスト");

    expect(screen.getByText("クリア")).toBeInTheDocument();
  });

  it("クリアボタンで入力がクリアされる", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onClear = vi.fn();

    render(<SearchForm onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByLabelText("検索キーワード");
    await user.type(input, "テスト");
    await user.click(screen.getByText("クリア"));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("初期値が設定される", () => {
    render(<SearchForm onSearch={vi.fn()} defaultValue="初期値" />);
    expect(screen.getByLabelText("検索キーワード")).toHaveValue("初期値");
  });
});
