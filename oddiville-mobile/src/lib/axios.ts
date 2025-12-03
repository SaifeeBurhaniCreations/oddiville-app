import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const API_URL = `${apiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type Policy = "purchase" | "production" | "packaging" | "sales";

export const blockPolicy: Record<Policy, string[]> = {
  purchase: ["/purchase", "/orders/create", "regex:^/purchase/\\d+/confirm$"],
  production: ["/production", "^/prod"],
  packaging: ["/packaging", "/box"],
  sales: ["/sales", "/clients", "/invoices"],
};

function getMatchingPoliciesForRequest(config: any): Policy[] {
  const explicit = config?.requiredPolicy;
  if (explicit) {
    if (Array.isArray(explicit)) return explicit as Policy[];
    return [explicit as Policy];
  }

  const rawUrl = String(config?.url ?? "");
  const base = String(config?.baseURL ?? "");
  const pathToMatch = (rawUrl.startsWith("http") ? rawUrl : base + rawUrl).toLowerCase();

  const matches: Policy[] = [];

  (Object.keys(blockPolicy) as Policy[]).forEach((policy) => {
    const patterns = blockPolicy[policy] || [];
    for (const p of patterns) {
      const pattern = p.toLowerCase();
      if (pattern.startsWith("regex:")) {
        try {
          const re = new RegExp(pattern.slice("regex:".length));
          if (re.test(pathToMatch)) {
            matches.push(policy);
            break;
          }
        } catch {
        }
      } else if (pattern.startsWith("^")) {
        if (pathToMatch.indexOf(pattern.slice(1)) === 0) {
          matches.push(policy);
          break;
        }
      } else {
        if (pathToMatch.includes(pattern)) {
          matches.push(policy);
          break;
        }
      }
    }
  });

  return matches;
}

api.interceptors.request.use(
  async (config) => {
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

    let userData: { policies?: string[] } = { policies: [] };
    try {
      const rawData = (await SecureStore.getItemAsync("newsync")) ?? "";
      if (rawData) {
        // const parsed = JSON.parse(rawData);
        
        // if (parsed && typeof parsed === "object") {
        //   userData.policies = Array.isArray(parsed.policies) ? parsed.policies.map(String) : [];
        // }
      }
    } catch {
      userData.policies = [];
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requiredPolicies = getMatchingPoliciesForRequest(config); // array

    if (requiredPolicies.length > 0) {
      const hasAtLeastOne = requiredPolicies.some((p) => (userData.policies ?? []).includes(p));
      if (!hasAtLeastOne) {
        const err = new Error(
          `Blocked: this endpoint requires one of [${requiredPolicies.join(", ")}]`
        );
        (err as any).isPolicyBlock = true;
        (err as any).requiredPolicies = requiredPolicies;
        throw err;
      }
    }

    return config;
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
