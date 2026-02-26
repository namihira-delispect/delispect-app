"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CreateTranscriptionResponse } from "../types";
import { createTranscriptionSchema } from "../schemata";

/**
 * 転記履歴を作成するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * ケアプランの転記テキストを保存し、転記履歴を作成する。
 */
export async function createTranscriptionAction(input: {
  carePlanId: number;
  content: string;
}): Promise<Result<CreateTranscriptionResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = createTranscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  try {
    // ケアプランの存在確認
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: parsed.data.carePlanId },
    });

    if (!carePlan) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "指定されたケアプランが見つかりません",
        },
      };
    }

    // 転記履歴の作成
    const transcription = await prisma.transcriptionHistory.create({
      data: {
        carePlanId: parsed.data.carePlanId,
        content: parsed.data.content,
      },
    });

    return {
      success: true,
      value: {
        id: transcription.id,
        createdAt: transcription.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[Transcription] 転記履歴の作成に失敗しました", {
      carePlanId: parsed.data.carePlanId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "TRANSCRIPTION_CREATE_ERROR",
        cause: "転記履歴の作成に失敗しました",
      },
    };
  }
}
