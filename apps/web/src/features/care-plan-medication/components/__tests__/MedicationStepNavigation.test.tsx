import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedicationStepNavigation } from "../MedicationStepNavigation";

describe("MedicationStepNavigation", () => {
  const defaultProps = {
    currentStepIndex: 0,
    onBack: vi.fn(),
    onNext: vi.fn(),
    onSave: vi.fn(),
    saving: false,
  };

  it("ステップインジケーターを表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} />);
    expect(screen.getByText("ステップ 1: リスク薬剤の確認")).toBeDefined();
  });

  it("最初のステップで戻るボタンが無効化される", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={0} />);
    const backButton = screen.getByText("戻る");
    expect(backButton).toBeDefined();
    expect((backButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("2番目のステップで戻るボタンが有効になる", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={1} />);
    const backButton = screen.getByText("戻る");
    expect((backButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("最終ステップ以外で進むボタンを表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={0} />);
    expect(screen.getByText("進む")).toBeDefined();
  });

  it("最終ステップで保存して完了ボタンを表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={3} />);
    expect(screen.getByText("保存して完了")).toBeDefined();
  });

  it("保存中は保存中...と表示される", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={3} saving={true} />);
    expect(screen.getByText("保存中...")).toBeDefined();
  });

  it("戻るボタンクリックでonBackが呼ばれる", () => {
    const onBack = vi.fn();
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={1} onBack={onBack} />);
    fireEvent.click(screen.getByText("戻る"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("進むボタンクリックでonNextが呼ばれる", () => {
    const onNext = vi.fn();
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={0} onNext={onNext} />);
    fireEvent.click(screen.getByText("進む"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("保存ボタンクリックでonSaveが呼ばれる", () => {
    const onSave = vi.fn();
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={3} onSave={onSave} />);
    fireEvent.click(screen.getByText("保存して完了"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("2番目のステップの情報を正しく表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={1} />);
    expect(screen.getByText("ステップ 2: オピオイド薬剤の確認")).toBeDefined();
  });

  it("3番目のステップの情報を正しく表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={2} />);
    expect(screen.getByText("ステップ 3: 薬剤変更提案")).toBeDefined();
  });

  it("4番目のステップの情報を正しく表示する", () => {
    render(<MedicationStepNavigation {...defaultProps} currentStepIndex={3} />);
    expect(screen.getByText("ステップ 4: 確認")).toBeDefined();
  });
});
