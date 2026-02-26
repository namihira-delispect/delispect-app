"use server";

import { redirect } from "next/navigation";
import { invalidateSession } from "@delispect/auth";
import { getSessionCookie, deleteSessionCookie } from "@/lib/auth/cookies";

export async function logoutAction(): Promise<void> {
  const sessionId = await getSessionCookie();

  if (sessionId) {
    await invalidateSession(sessionId);
  }

  await deleteSessionCookie();
  redirect("/login");
}
