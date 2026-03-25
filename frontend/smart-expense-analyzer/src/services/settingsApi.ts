import API from "./api";

export type UserProfile = {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
};

export const getProfile = async (): Promise<UserProfile> => {
    const { data } = await API.get("/settings/profile");
    return data;
};

export const updateProfile = async (name: string, email: string): Promise<UserProfile> => {
    const { data } = await API.put("/settings/profile", { name, email });
    return data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await API.put("/settings/password", { currentPassword, newPassword });
};

export const deleteAccount = async (password: string): Promise<void> => {
    await API.delete("/settings/account", { data: { password } });
};

export type NotificationPrefs = {
    emailNotifications: boolean;
    pushNotifications: boolean;
    budgetAlerts: boolean;
};

export const getNotifications = async (): Promise<NotificationPrefs> => {
    const { data } = await API.get("/settings/notifications");
    return data;
};

export const updateNotifications = async (prefs: NotificationPrefs): Promise<NotificationPrefs> => {
    const { data } = await API.put("/settings/notifications", prefs);
    return data;
};
