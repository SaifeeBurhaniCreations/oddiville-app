import api from "../lib/axios"

const LoginService = async (loginCred) => {
    return await api.post("/admin/authentication/login", loginCred)
}

export { LoginService }