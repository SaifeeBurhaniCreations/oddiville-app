export function isAdminRole(role: "superadmin" | "admin" | "supervisor") {
    if (role === "superadmin" || role === "admin") {
        return "admin-home"
    } else {
        return "supervisor-raw-material"
    }
}
export function rejectEmptyOrNull<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>
  ): (...args: Args) => Promise<Return> {
    return async (...args: Args) => {
      const data = await fn(...args);
  
      if (data == null) {
        throw new Error("No data received – likely API or network issue");
      }
  
      return data;
    };
  }
  