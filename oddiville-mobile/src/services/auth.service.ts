import api from "@/src/lib/axios";
import { loginProps } from "../types"

const LoginService = (loginCred: loginProps) => {
    return api.post("/admin/authentication/login", loginCred)
}

export { LoginService }