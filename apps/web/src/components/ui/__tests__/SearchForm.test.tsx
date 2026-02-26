import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchForm } from "../SearchForm";

describe("SearchForm", () => {
  it("検索フォームが表示される", () => {
    render(<SearchForm onSearch={vi.fn()} />);

    expect(screen.getByTestId("search-form")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("search-submit-button")).toBeInTheDocument();
  });

  it("プレースホルダーが表示される", () => {
    render(<SearchForm onSearch={vi.fn()} placeholder="患者名で検索" />);

    expect(screen.getByPlaceholderText("患者名で検索")).toBeInTheDocument();
  });

  it("検索ボタンクリックで検索が実行される", () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "テスト検索" } });
    fireEvent.submit(screen.getByTestId("search-form"));

    expect(onSearch).toHaveBeenCalledWith("テスト検索");
  });

  it("クリアボタンで入力がリセットされる", () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "テスト" } });

    // クリアボタンが表示される
    const clearButton = screen.getByTestId("search-clear-button");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("入力が空の場合はクリアボタンが非表示", () => {
    render(<SearchForm onSearch={vi.fn()} />);

    expect(screen.queryByTestId("search-clear-button")).not.toBeInTheDocument();
  });

  it("初期値が設定される", () => {
    render(<SearchForm onSearch={vi.fn()} defaultValue="初期値" />);

    expect(screen.getByTestId("search-input")).toHaveValue("初期値");
  });

  it("検索時に前後の空白がトリムされる", () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "  テスト  " } });
    fireEvent.submit(screen.getByTestId("search-form"));

    expect(onSearch).toHaveBeenCalledWith("テスト");
  });
});
