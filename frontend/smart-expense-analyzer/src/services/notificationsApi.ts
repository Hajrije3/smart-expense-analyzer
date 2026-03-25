import API from "./api";

export interface AppNotification {
    _id: string;
    title: string;
    message: string;
    type: "budget_alert" | "budget_exceeded" | "info";
    read: boolean;
    createdAt: string;
}

export const fetchNotifications = () =>
    API.get<AppNotification[]>("/notifications").then((r) => r.data);

export const markNotificationRead = (id: string) =>
    API.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
    API.put("/notifications/read-all");

export const deleteNotification = (id: string) =>
    API.delete(`/notifications/${id}`);
