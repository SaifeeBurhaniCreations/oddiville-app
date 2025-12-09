export type addUserTypes = {
  username: string;
  email: string;
  name: string;
  phone: string;
  profilepic: string;
 policies: Array<"purchase" | "production" | "packaging" | "sales">;
  role: "admin" | "supervisor";
};