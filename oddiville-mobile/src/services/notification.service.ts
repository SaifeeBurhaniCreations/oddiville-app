import api from "@/src/lib/axios";

export type FetchNotificationParams = {
    search?: string;
    limit?: number;
    offset?: number;
};

export async function fetchNotificationsInformative(params: FetchNotificationParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
    if (params.offset !== undefined) queryParams.append("offset", String(params.offset));
    if (params.search) queryParams.append("search", params.search);

    return await api.get(`/notifications/informative?${queryParams.toString()}`);
}

export async function fetchNotificationsActionable(params: FetchNotificationParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
    if (params.offset !== undefined) queryParams.append("offset", String(params.offset));
    if (params.search) queryParams.append("search", params.search);

    return await api.get(`/notifications/actionable?${queryParams.toString()}`);
}

export async function fetchNotificationsTodays(
  params: FetchNotificationParams = {}
) {
  const queryParams = new URLSearchParams();

  if (params.limit !== undefined)
    queryParams.append("limit", String(params.limit));
  if (params.offset !== undefined)
    queryParams.append("offset", String(params.offset));
  if (params.search) queryParams.append("search", params.search);

  return await api.get(`/notifications/today?${queryParams.toString()}`);
}


export async function updateNotificationService(id: string, updates: { read: boolean }) {
    const response = await api.patch(`/notifications/update/${id}`, updates);
    return response.data;
}


