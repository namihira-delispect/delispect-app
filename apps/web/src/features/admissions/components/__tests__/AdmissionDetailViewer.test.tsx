import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AdmissionDetailViewer } from "../AdmissionDetailViewer";
import type { AdmissionDetailResponse } from "../../types";

// Next.js のモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockDetailResponse: AdmissionDetailResponse = {
  admissionId: 1,
  version: 0,
  patientId: "P001",
  patientInternalId: 1,
  patientName: "田中 太郎",
  patientNameKana: "タナカ タロウ",
  age: 75,
  gender: "MALE",
  admissionDate: "2026-02-25",
  dischargeDate: null,
  ward: "3A病棟",
  room: "301",
  attendingDoctor: "山田医師",
  latestVitalSign: {
    bodyTemperature: 36.5,
    pulse: 72,
    systolicBp: 120,
    diastolicBp: 80,
    spo2: 98.0,
    measuredAt: "2026-02-25T10:30:00.000Z",
  },
  labResults: [
    {
      itemCode: "CRP",
      itemName: "CRP",
      value: 0.5,
      measuredAt: "2026-02-25T08:00:00.000Z",
    },
  ],
  careInfo: {
    painStatus: "IN_PROGRESS",
    constipationStatus: null,
    prescriptions: [],
    assessedAt: "2026-02-25T10:00:00.000Z",
  },
  riskAssessments: [
    {
      riskLevel: "HIGH",
      riskFactors: { isOver70: true },
      riskScore: 0.85,
      assessedAt: "2026-02-25T14:00:00.000Z",
      assessedBy: "山田医師",
    },
  ],
  carePlan: null,
  isHighRisk: true,
};

// Server Actionsのモック
const mockGetAdmissionDetailAction = vi.fn();
const mockCheckVersionAction = vi.fn();

vi.mock("../../server-actions/getAdmissionDetailAction", () => ({
  getAdmissionDetailAction: (...args: unknown[]) => mockGetAdmissionDetailAction(...args),
}));

vi.mock("../../server-actions/checkVersionAction", () => ({
  checkVersionAction: (...args: unknown[]) => mockCheckVersionAction(...args),
}));

describe("AdmissionDetailViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdmissionDetailAction.mockResolvedValue({
      success: true,
      value: mockDetailResponse,
    });
    mockCheckVersionAction.mockResolvedValue({
      success: true,
      value: { currentVersion: 0 },
    });
  });

  describe("初回ロード", () => {
    it("読み込み中のメッセージが表示される", () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      expect(screen.getByText("読み込み中...")).toBeDefined();
    });

    it("データ取得後に基本情報が表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("基本情報")).toBeDefined();
      });
      expect(screen.getByText("P001")).toBeDefined();
      // 患者名はパンくずリストと基本情報の2箇所に表示される
      expect(screen.getAllByText("田中 太郎").length).toBeGreaterThanOrEqual(1);
    });

    it("データ取得後にバイタルサインが表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("バイタルサイン")).toBeDefined();
      });
    });

    it("データ取得後に採血結果が表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("採血結果")).toBeDefined();
      });
    });

    it("データ取得後にリスク評価情報が表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("リスク評価情報")).toBeDefined();
      });
    });

    it("データ取得後にケアプラン情報が表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("ケアプラン情報")).toBeDefined();
      });
    });
  });

  describe("エラー時", () => {
    it("データ取得に失敗した場合にエラーメッセージが表示される", async () => {
      mockGetAdmissionDetailAction.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "指定された入院情報が見つかりません" },
      });

      render(<AdmissionDetailViewer admissionId={999} />);
      await waitFor(() => {
        expect(screen.getByText("指定された入院情報が見つかりません")).toBeDefined();
      });
    });

    it("エラー時に再読み込みボタンが表示される", async () => {
      mockGetAdmissionDetailAction.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "指定された入院情報が見つかりません" },
      });

      render(<AdmissionDetailViewer admissionId={999} />);
      await waitFor(() => {
        expect(screen.getByText("再読み込み")).toBeDefined();
      });
    });
  });

  describe("パンくずリスト", () => {
    it("患者入院一覧へのリンクが表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        const link = screen.getByText("患者入院一覧");
        expect(link.closest("a")?.getAttribute("href")).toBe("/admissions");
      });
    });

    it("ハイリスクバッジが表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("ハイリスク")).toBeDefined();
      });
    });
  });

  describe("楽観的ロック", () => {
    it("競合チェックボタンが表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("競合チェック")).toBeDefined();
      });
    });

    it("バージョン競合時に警告メッセージが表示される", async () => {
      mockCheckVersionAction.mockResolvedValue({
        success: false,
        value: {
          code: "VERSION_CONFLICT",
          cause: "データが他のユーザーによって更新されています。最新データを再取得してください。",
        },
      });

      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("競合チェック")).toBeDefined();
      });

      fireEvent.click(screen.getByText("競合チェック"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "データが他のユーザーによって更新されています。最新データを再取得してください。",
          ),
        ).toBeDefined();
      });
    });

    it("競合時に最新データを取得ボタンが表示される", async () => {
      mockCheckVersionAction.mockResolvedValue({
        success: false,
        value: {
          code: "VERSION_CONFLICT",
          cause: "データが他のユーザーによって更新されています。最新データを再取得してください。",
        },
      });

      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        expect(screen.getByText("競合チェック")).toBeDefined();
      });

      fireEvent.click(screen.getByText("競合チェック"));

      await waitFor(() => {
        expect(screen.getByText("最新データを取得")).toBeDefined();
      });
    });
  });

  describe("画面遷移", () => {
    it("ケアプランがない場合にケアプラン作成リンクが表示される", async () => {
      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        const links = screen.getAllByText("ケアプラン作成");
        expect(links.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("ケアプランがある場合にケアプラン編集リンクが表示される", async () => {
      const detailWithCarePlan = {
        ...mockDetailResponse,
        carePlan: {
          id: 10,
          items: [],
          createdAt: "2026-02-24T09:00:00.000Z",
          updatedAt: "2026-02-25T14:00:00.000Z",
          createdBy: "看護師A",
        },
      };
      mockGetAdmissionDetailAction.mockResolvedValue({
        success: true,
        value: detailWithCarePlan,
      });

      render(<AdmissionDetailViewer admissionId={1} />);
      await waitFor(() => {
        const links = screen.getAllByText("ケアプラン編集");
        expect(links.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
