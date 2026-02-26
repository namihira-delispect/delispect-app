export interface LoginInput {
  username: string;
  password: string;
}

export interface SessionData {
  sessionId: string;
  userId: number;
  username: string;
  expiresAt: Date;
}

export type AuthResult =
  | { success: true; value: SessionData }
  | {
      success: false;
      value: {
        code:
          | "INVALID_CREDENTIALS"
          | "ACCOUNT_LOCKED"
          | "ACCOUNT_DISABLED"
          | "INTERNAL_ERROR";
        cause?: string;
      };
    };
