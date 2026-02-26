// Password utilities
export {
  validatePassword,
  hashPassword,
  verifyPassword,
} from "./password";
export type { PasswordValidationResult } from "./password";

// Login lock
export {
  checkLoginLock,
  incrementFailedAttempts,
  resetFailedAttempts,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_HOURS,
} from "./loginLock";
export type {
  LoginLockInfo,
  LoginLockResult,
  FailedAttemptResult,
} from "./loginLock";

// Session management
export {
  generateSessionId,
  createSessionData,
  isSessionExpired,
  extendSessionExpiry,
  SESSION_TIMEOUT_MINUTES,
} from "./session";
export type { CreateSessionParams, SessionData } from "./session";

// Role-based access control
export {
  RoleName,
  PermissionCode,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
} from "./roles";

// Validation schemas
export { loginSchema, changePasswordSchema } from "./validation";
export type { LoginInput, ChangePasswordInput } from "./validation";
