"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { TranscriptionHistoryEntry } from "../types";

/**
 * 転記履歴一覧を取得する
 *
 * ケアプランIDに基づき、転記履歴を新しい順に返す。
 */
export async function getTranscriptionHistory(
  carePlanId: number,
): Promise<Result<TranscriptionHistoryEntry[]>> {
  try {
    const histories = await prisma.transcriptionHistory.findMany({
      where: { carePlanId },
      orderBy: { createdAt: "desc" },
    });

    const entries: TranscriptionHistoryEntry[] = histories.map((h) => ({
      id: h.id,
      content: h.content,
      createdAt: h.createdAt.toISOString(),
    }));

    return {
      success: true,
      value: entries,
    };
  } catch (error) {
    console.error("[TranscriptionHistory] 転記履歴の取得に失敗しました", {
      carePlanId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "TRANSCRIPTION_HISTORY_FETCH_ERROR",
        cause: "転記履歴の取得に失敗しました",
      },
    };
  }
}
