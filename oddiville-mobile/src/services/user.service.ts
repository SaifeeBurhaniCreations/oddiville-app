import api from "@/src/lib/axios";
import { addUserTypes } from "../types/form";
import { UserResponse, UpdatePayload } from "../hooks/user";
import { AxiosResponse } from "axios";

export async function getAllUsers() {
    return await api.get("/admin/users");
}

export async function addUsers(data: addUserTypes) {
  return await api.post("/admin/users", data);
}
export async function removeUser(username: string) {
  return await api.delete(`/admin/user/${username}`);
}

export async function fetchUserById(username: string) {
  const response = await api.get(`/admin/user/${username}`)
  return response.data;
}

export const updateUser = (username: string, data: UpdatePayload): Promise<AxiosResponse<UserResponse>> => {
  return api.patch(`admin/user/${username}`, data);
};