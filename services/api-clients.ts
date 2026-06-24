import { createAuthenticatedClient } from "@/lib/api-utils";

/**
 * Sanitizes environment variables for the DMZ architecture.
 * If in production and the variable is empty/null, it returns "" (Relative Path).
 * If in development, it returns the local fallback.
 */
const getBaseUrl = (envVar: string | undefined, fallback: string): string => {
  // 1. Check if the variable is literally the string "null" or "undefined" (common CI/CD artifact)
  const isInvalid = !envVar || envVar === "null" || envVar === "undefined" || envVar === "";

  // 2. In Production (EKS), we WANT an empty string for Relative Paths
  if (process.env.NODE_ENV === "production") {
    return isInvalid ? "" : envVar;
  }

  // 3. In Development (Localhost), use the fallback
  return isInvalid ? fallback : envVar;
};

export const authClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_API_URL, "") + "/aabhar/v1/auth"
);

export const rolesClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_ROLES_API_URL, "") + "/aabhar/v1/roles"
);

export const employeesClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_EMPLOYEE_API_URL, "") + "/aabhar/v1/employees"
);

export const walletClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_WALLET_API_URL, "") + "/aabhar/v1/wallets"
);

export const recognitionClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_RECOGNITION_API_URL, "") + "/aabhar/v1/recognitions"
);

export const rewardsClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_REWARDS_API_URL, "") + "/aabhar/v1/rewards"
);

export const orgClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_ORG_API_URL, "") + "/aabhar/v1/organizations"
);

export const analyticsClient = createAuthenticatedClient(
  getBaseUrl(process.env.NEXT_PUBLIC_ANALYTICS_API_URL, "") + "/aabhar/v1/analytics"
);