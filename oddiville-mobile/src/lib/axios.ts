// api.ts (or api.js) - replace your existing file with this
import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const API_URL = `${apiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type Policy = "purchase-view" | "purchase-edit" | "production" | "package" | "sales-view" | "sales-edit";

export const blockPolicy: Record<Policy, string[]> = {

  "purchase-view": ["^/raw-material", "^/vendor", "^/admin", "^/bottomsheet", "^/package", "^/location", "^/contractor"],
  "purchase-edit": ["^/raw-material", "^/vendor", "^/admin", "^/bottomsheet", "^/package", "^/location", "^/contractor"],
  production: ["^/production", "^/package", "^/chamber", "^/chamber-stock", "^/lane", "^/admin", "^/bottomsheet", "^/location", "^/contractor"],
  package: ["^/package", "^/chamber", "^/chamber-stock", "/chamber/type/dry", "^/admin", "^/bottomsheet", "^/location", "^/contractor"],
  "sales-view": ["^/package", "^/order", "^/truck", "^/admin", "^/bottomsheet", "^/location", "^/contractor"],
  "sales-edit": ["^/package", "^/order", "^/truck", "^/admin", "^/bottomsheet", "^/location", "^/contractor"],
};

// "regex:^/raw-material/\\d+/confirm$"
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipPolicyCheck?: boolean;
  requiredPolicy?: Policy | Policy[];
}

function getRequestPathnameLower(config: ExtendedAxiosRequestConfig): string {
  const rawUrl = String(config?.url ?? "");
  const base = String(config?.baseURL ?? "");
  try {
    const full = rawUrl.startsWith("http") ? rawUrl : base + rawUrl;
    const u = new URL(full);
    return (u.pathname + u.search).toLowerCase();
  } catch {
    const joined = (rawUrl.startsWith("http") ? rawUrl : base + rawUrl).toLowerCase();
    const protoIdx = joined.indexOf("://");
    if (protoIdx !== -1) {
      const firstSlash = joined.indexOf("/", protoIdx + 3);
      return firstSlash !== -1 ? joined.slice(firstSlash) : "/";
    }
    const idx = joined.indexOf("/");
    return idx !== -1 ? joined.slice(idx) : joined;
  }
}

function normalizePattern(rawPattern: string): string {
  return String(rawPattern ?? "").trim().toLowerCase();
}

function getMatchingPoliciesForRequest(config: ExtendedAxiosRequestConfig): Policy[] {
  const explicit = config?.requiredPolicy;
  if (explicit) {
    if (Array.isArray(explicit)) return explicit as Policy[];
    return [explicit as Policy];
  }

  const pathToMatch = getRequestPathnameLower(config);
  const matches: Policy[] = [];

  (Object.keys(blockPolicy) as Policy[]).forEach((policy) => {
    const patterns = blockPolicy[policy] || [];
    for (const p of patterns) {
      const rawPattern = String(p);
      const pattern = normalizePattern(rawPattern);

      if (pattern.startsWith("regex:")) {
        try {
          const expr = rawPattern.slice("regex:".length);
          const re = new RegExp(expr, "i");
          if (re.test(pathToMatch)) {
            matches.push(policy);
            break;
          }
        } catch (e) {
          console.warn("Invalid policy regex pattern:", rawPattern, e);
          continue;
        }
      } else {
        const patNoLeadingSlash = pattern.replace(/^\/+/, "");
        if (patNoLeadingSlash.startsWith("^")) {
          const want = patNoLeadingSlash.slice(1);
          if (pathToMatch.startsWith(want) || pathToMatch.includes("/" + want)) {
            matches.push(policy);
            break;
          }
        } else {
          const want = patNoLeadingSlash;
          if (!want) continue;
          if (pathToMatch.includes(want) || pathToMatch.includes("/" + want)) {
            matches.push(policy);
            break;
          }
        }
      }
    }
  });

  return matches;
}

api.interceptors.request.use(
  async (cfg: InternalAxiosRequestConfig) => {
    const config = cfg as ExtendedAxiosRequestConfig;

    let tokenRaw = await SecureStore.getItemAsync("metadata");
    let token: string | null = null;
    if (tokenRaw) {
      try {
        const parsed = JSON.parse(tokenRaw);
        token = parsed && parsed.token ? String(parsed.token) : String(tokenRaw);
      } catch {
        token = tokenRaw;
      }
    }

    let userData: { policies?: string[]; role?: string } = { policies: [], role: undefined };
    try {
      const rawData = (await SecureStore.getItemAsync("newsync")) ?? "";
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (parsed && typeof parsed === "object") {
            userData.policies = Array.isArray(parsed.policies)
              ? (parsed.policies as any[]).map((s: any) => String(s).toLowerCase())
              : [];
            userData.role = typeof parsed.role === "string" ? parsed.role : undefined;
          } else {
            userData.policies = [];
            userData.role = undefined;
          }
        } catch {
          userData.policies = [];
          userData.role = undefined;
        }
      }
    } catch {
      userData.policies = [];
      userData.role = undefined;
    }

    config.headers = config.headers ?? ({} as Record<string, unknown>);
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    if ((config as ExtendedAxiosRequestConfig).skipPolicyCheck) {
      return config as InternalAxiosRequestConfig;
    }

    const requiredPolicies = getMatchingPoliciesForRequest(config as ExtendedAxiosRequestConfig);
    if (!requiredPolicies || requiredPolicies.length === 0) {
      return config as InternalAxiosRequestConfig;
    }

    const role = (userData.role ?? "").toString().trim().toLowerCase();
    const isSuperUser = role === "admin" || role === "superadmin";

    if (isSuperUser) {
      console.info("Policy bypass for role", role, "url:", config.url);
      return config as InternalAxiosRequestConfig;
    }

    const userPolicies = (userData.policies ?? []).map((s: string) => s.toLowerCase());
    const hasAtLeastOne = requiredPolicies.some((p) => userPolicies.includes(p));

    if (!hasAtLeastOne) {
      const err = new Error(
        `Blocked: this endpoint requires one of [${requiredPolicies.join(", ")}]`
      );
      (err as any).isPolicyBlock = true;
      (err as any).requiredPolicies = requiredPolicies;
      (err as any).requestUrl = config.url ?? getRequestPathnameLower(config as ExtendedAxiosRequestConfig);

      console.warn("API request blocked by policy", {
        url: (config as InternalAxiosRequestConfig).url,
        baseURL: (config as InternalAxiosRequestConfig).baseURL,
        requiredPolicies,
        userPolicies,
        role,
      });

      return Promise.reject(err);
    }

    return config as InternalAxiosRequestConfig;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if ((err as any)?.isPolicyBlock) {
      console.warn("Request blocked by policy:", (err as any).message);
      return Promise.reject(err);
    }
    if (err.response) {
      console.log("❌ API ERROR", err.response.status, err.response.data, err.config?.url);
    } else {
      console.log("❌ Network / Unknown Axios Error:", err.message);
    }
    if (err.response?.status === 401) console.warn("Token expired or unauthorized!");
    return Promise.reject(err);
  }
);

export default api;