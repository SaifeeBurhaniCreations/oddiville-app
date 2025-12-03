import api from "@/src/lib/axios";

const getAdminProfile = (token: string) => {
    return api.get("/admin/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export { getAdminProfile };
