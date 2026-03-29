import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CustomSelect from "../components/CustomSelect";
import { useAppearance } from "../context/AppearanceContext";
import {
    getProfile, updateProfile, changePassword, deleteAccount,
    getNotifications, updateNotifications,
    type UserProfile, type NotificationPrefs,
} from "../services/settingsApi";


const InputField = ({
    label, type = "text", value, onChange, placeholder,
}: {
    label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
    </div>
);

const Alert = ({ type, message }: { type: "success" | "error"; message: string }) => (
    <div className={`text-sm px-4 py-3 rounded-xl ${type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
        {message}
    </div>
);

const CURRENCIES = [
    "USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "CAD (C$)",
    "AUD (A$)", "CHF (CHF)", "CNY (¥)", "INR (₹)", "BRL (R$)",
];

const LANGUAGES = [
    "English", "Italian", "Arabic", "Albanian",
];


export default function Settings() {
    const navigate = useNavigate();
    const { darkMode, setDarkMode, currency, setCurrency, language, setLanguage, t } = useAppearance();

    const [profile, setProfile]         = useState<UserProfile | null>(null);
    const [firstName, setFirstName]      = useState("");
    const [lastName, setLastName]        = useState("");
    const [email, setEmail]              = useState("");
    const [profileMsg, setProfileMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword]          = useState("");
    const [confirmPassword, setConfirmPassword]  = useState("");
    const [passwordMsg, setPasswordMsg]          = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordLoading, setPasswordLoading]  = useState(false);

    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
        emailNotifications: true, pushNotifications: true, budgetAlerts: true,
    });

    const [deletePassword, setDeletePassword]   = useState("");
    const [deleteConfirm, setDeleteConfirm]     = useState("");
    const [deleteMsg, setDeleteMsg]             = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [deleteLoading, setDeleteLoading]     = useState(false);
    const [showDeleteSection, setShowDeleteSection] = useState(false);

    useEffect(() => {
        getNotifications().then(setNotifPrefs).catch(() => {});
        getProfile().then((p) => {
            setProfile(p);
            const parts = (p.name ?? "").split(" ");
            setFirstName(parts[0] ?? "");
            setLastName(parts.slice(1).join(" ") ?? "");
            setEmail(p.email);
        });
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg(null);
        setProfileLoading(true);
        try {
            const fullName = [firstName, lastName].filter(Boolean).join(" ");
            const updated = await updateProfile(fullName, email);
            setProfile(updated);
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, email: updated.email }));
            setProfileMsg({ type: "success", text: "Profile updated successfully." });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setProfileMsg({ type: "error", text: msg ?? "Failed to update profile." });
        } finally { setProfileLoading(false); }
    };

    const handleProfileCancel = () => {
        if (!profile) return;
        const parts = (profile.name ?? "").split(" ");
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" ") ?? "");
        setEmail(profile.email);
        setProfileMsg(null);
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg(null);
        if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "New passwords do not match." }); return; }
        setPasswordLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            setPasswordMsg({ type: "success", text: "Password changed successfully." });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setPasswordMsg({ type: "error", text: msg ?? "Failed to change password." });
        } finally { setPasswordLoading(false); }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteConfirm !== "DELETE") { setDeleteMsg({ type: "error", text: 'Type "DELETE" to confirm.' }); return; }
        setDeleteLoading(true); setDeleteMsg(null);
        try {
            await deleteAccount(deletePassword);
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setDeleteMsg({ type: "error", text: msg ?? "Failed to delete account." });
        } finally { setDeleteLoading(false); }
    };

    const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "";

    return (
        <Layout>
            <div className="w-full space-y-5 sm:space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("settings")}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("manage_account")}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t("profile_info")}</h2>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {initials}
                        </div>
                        {memberSince && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{t("member_since")} {memberSince}</p>
                        )}
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
                            <InputField label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe"  />
                        </div>
                        <InputField label={t("email_address")} type="email" value={email} onChange={setEmail} placeholder="john@example.com" />
                        {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}

                        <div className="flex justify-end gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleProfileCancel}
                                className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                {profileLoading ? t("saving") : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Notifications</h2>
                    </div>

                    {([
                        {
                            key: "emailNotifications" as const,
                            label: "Email notifications",
                            desc: "Receive updates via email",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                </svg>
                            ),
                        },
                        {
                            key: "pushNotifications" as const,
                            label: "Push notifications",
                            desc: "Get alerts on your device",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                                </svg>
                            ),
                        },
                        {
                            key: "budgetAlerts" as const,
                            label: "Budget alerts",
                            desc: "Alert when approaching budget limits",
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            ),
                        },
                    ] as const).map(({ key, label, desc, icon }, i, arr) => (
                        <div key={key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
                                    <p className="text-xs text-orange-500">{desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
                                    setNotifPrefs(updated);
                                    updateNotifications(updated).catch(() => {});
                                }}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${notifPrefs[key] ? "bg-[#22c55e]" : "bg-gray-200 dark:bg-gray-600"}`}
                                role="switch"
                                aria-checked={notifPrefs[key]}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifPrefs[key] ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t("appearance")}</h2>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{t("dark_mode")}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{t("toggle_dark")}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${darkMode ? "bg-[#22c55e]" : "bg-gray-200"}`}
                            role="switch"
                            aria-checked={darkMode}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>

                    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("currency_label")}</p>
                        <CustomSelect
                            value={currency}
                            onChange={setCurrency}
                            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                        />
                    </div>

                    <div className="pt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("language_label")}</p>
                        <CustomSelect
                            value={language}
                            onChange={setLanguage}
                            options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t("change_password")}</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 ml-7">{t("password_hint")}</p>
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                        <InputField label={t("current_password")} type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label={t("new_password")}     type="password" value={newPassword}     onChange={setNewPassword}     placeholder="••••••••" />
                            <InputField label={t("confirm_password")} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                        </div>
                        {passwordMsg && <Alert type={passwordMsg.type} message={passwordMsg.text} />}
                        <div className="flex justify-end gap-3 pt-1">
                            <button type="button" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordMsg(null); }}
                                className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                {t("cancel")}
                            </button>
                            <button type="submit" disabled={passwordLoading}
                                className="bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                                {passwordLoading ? t("updating") : t("update_password")}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/40 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <div>
                                <h2 className="text-base font-semibold text-red-600">{t("danger_zone")}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t("danger_zone_desc")}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDeleteSection((v) => !v)}
                            className="self-start sm:self-auto flex-shrink-0 text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-colors"
                        >
                            {showDeleteSection ? t("cancel") : t("delete_account")}
                        </button>
                    </div>

                    {showDeleteSection && (
                        <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4 border-t border-red-100 dark:border-red-900/40 pt-5">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">{t("delete_warning")}</div>
                            <InputField label={t("confirm_your_password")} type="password" value={deletePassword} onChange={setDeletePassword} placeholder="••••••••" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("type_delete")}</label>
                                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                                    className="w-full border border-red-200 dark:border-red-800 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                            </div>
                            {deleteMsg && <Alert type={deleteMsg.type} message={deleteMsg.text} />}
                            <div className="flex justify-end">
                                <button type="submit" disabled={deleteLoading}
                                    className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                                    {deleteLoading ? t("deleting") : t("permanently_delete")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </Layout>
    );
}
