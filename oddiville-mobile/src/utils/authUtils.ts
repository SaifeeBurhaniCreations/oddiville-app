export function isAdminRole(role: "superadmin" | "admin" | "supervisor") {
    if (role === "superadmin" || role === "admin") {
        return "admin-home"
    } else {
        return "supervisor-raw-material"
    }
}

export function rejectEmptyOrNull<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const res = await fn(...args);

    if (!res) throw new Error("Empty response");

    return res;
  };
}
