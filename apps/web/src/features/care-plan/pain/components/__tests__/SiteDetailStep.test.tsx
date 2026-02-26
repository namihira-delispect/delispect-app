import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SiteDetailStep } from "../SiteDetailStep";
import type { PainSiteDetail } from "../../types";

describe("SiteDetailStep", () => {
  const defaultSiteDetails: PainSiteDetail[] = [
    { siteId: "HEAD", touchPain: null, movementPain: null, numbness: null },
  ];

  it("タイトルが表示される", () => {
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD"]}
        siteDetails={defaultSiteDetails}
        onUpdateSiteDetail={() => {}}
      />,
    );
    expect(screen.getByText("各部位の痛みの詳細")).toBeDefined();
  });

  it("選択された部位名がヘッダーに表示される", () => {
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD"]}
        siteDetails={defaultSiteDetails}
        onUpdateSiteDetail={() => {}}
      />,
    );
    expect(screen.getByText("頭部")).toBeDefined();
  });

  it("3つの確認項目が各部位に表示される", () => {
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD"]}
        siteDetails={defaultSiteDetails}
        onUpdateSiteDetail={() => {}}
      />,
    );
    expect(screen.getByText("触った時の痛み")).toBeDefined();
    expect(screen.getByText("動かした時の痛み")).toBeDefined();
    expect(screen.getByText("違和感・しびれ")).toBeDefined();
  });

  it("複数部位が表示される", () => {
    const siteDetails: PainSiteDetail[] = [
      { siteId: "HEAD", touchPain: null, movementPain: null, numbness: null },
      { siteId: "LOWER_BACK", touchPain: null, movementPain: null, numbness: null },
    ];
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD", "LOWER_BACK"]}
        siteDetails={siteDetails}
        onUpdateSiteDetail={() => {}}
      />,
    );
    expect(screen.getByText("頭部")).toBeDefined();
    expect(screen.getByText("腰部")).toBeDefined();
  });

  it("はいボタンをクリックするとonUpdateSiteDetailが呼ばれる", () => {
    const onUpdate = vi.fn();
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD"]}
        siteDetails={defaultSiteDetails}
        onUpdateSiteDetail={onUpdate}
      />,
    );
    // 最初のはいボタン（触った時の痛み）
    const yesButtons = screen.getAllByText("はい");
    fireEvent.click(yesButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith("HEAD", "touchPain", true);
  });

  it("いいえボタンをクリックするとonUpdateSiteDetailが呼ばれる", () => {
    const onUpdate = vi.fn();
    render(
      <SiteDetailStep
        selectedSiteIds={["HEAD"]}
        siteDetails={defaultSiteDetails}
        onUpdateSiteDetail={onUpdate}
      />,
    );
    // 最初のいいえボタン（触った時の痛み）
    const noButtons = screen.getAllByText("いいえ");
    fireEvent.click(noButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith("HEAD", "touchPain", false);
  });
});
