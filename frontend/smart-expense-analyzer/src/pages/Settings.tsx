import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppearance } from "../context/AppearanceContext";
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    type UserProfile,
} from "../services/settingsApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const InputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}: {
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
    </div>
);

const Alert = ({ type, message }: { type: "success" | "error"; message: string }) => (
    <div
        className={`text-sm px-4 py-3 rounded-xl ${
            type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
        }`}
    >
        {message}
    </div>
);

const CURRENCIES = [
    "USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "CAD (C$)",
    "AUD (A$)", "CHF (CHF)", "CNY (¥)", "INR (₹)", "BRL (R$)",
];

const LANGUAGES = [
    "English", "Spanish", "French", "German", "Italian",
    "Portuguese", "Chinese", "Japanese", "Arabic", "Hindi",
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
    const navigate = useNavigate();
    const { darkMode, setDarkMode, currency, setCurrency, language, setLanguage, t } = useAppearance();

    // Profile
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Delete
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleteMsg, setDeleteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteSection, setShowDeleteSection] = useState(false);

    useEffect(() => {
        getProfile().then((p) => {
            setProfile(p);
            setName(p.name);
            setEmail(p.email);
        });
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg(null);
        setProfileLoading(true);
        try {
            const updated = await updateProfile(name, email);
            setProfile(updated);
            // Keep localStorage in sync so the sidebar name updates
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, email: updated.email }));
            setProfileMsg({ type: "success", text: "Profile updated successfully." });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setProfileMsg({ type: "error", text: msg ?? "Failed to update profile." });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg(null);
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: "error", text: "New passwords do not match." });
            return;
        }
        setPasswordLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMsg({ type: "success", text: "Password changed successfully." });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setPasswordMsg({ type: "error", text: msg ?? "Failed to change password." });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteConfirm !== "DELETE") {
            setDeleteMsg({ type: "error", text: 'Type "DELETE" to confirm.' });
            return;
        }
        setDeleteLoading(true);
        setDeleteMsg(null);
        try {
            await deleteAccount(deletePassword);
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setDeleteMsg({ type: "error", text: msg ?? "Failed to delete account." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "";

    return (
        <Layout>
            <div className="max-w-2xl space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and preferences</p>
                </div>

                {/* Appearance card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t("appearance")}</h2>
                    </div>

                    {/* Dark mode toggle */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{t("dark_mode")}</p>
                                <p className="text-xs text-indigo-400">{t("toggle_dark")}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${darkMode ? "bg-indigo-500" : "bg-gray-200"}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>

                    {/* Currency */}
                    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t("currency_label")}</p>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Language */}
                    <div className="pt-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t("language_label")}</p>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Profile card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    {/* Avatar row */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold flex-shrink-0">
                            {name ? name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                            {memberSince && (
                                <p className="text-xs text-gray-400 mt-0.5">{t("member_since")} {memberSince}</p>
                            )}
                        </div>
                    </div>

                    <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">{t("profile_info")}</h2>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <InputField label={t("full_name")} value={name} onChange={setName} placeholder={t("name_placeholder")} />
                        <InputField label={t("email_address")} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                        {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                {profileLoading ? t("saving") : t("save_changes")}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">{t("change_password")}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("password_hint")}</p>
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                        <InputField label={t("current_password")} type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
                        <InputField label={t("new_password")} type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
                        <InputField label={t("confirm_password")} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                        {passwordMsg && <Alert type={passwordMsg.type} message={passwordMsg.text} />}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                            >
                                {passwordLoading ? t("updating") : t("update_password")}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger zone */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-red-900/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-red-600">{t("danger_zone")}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {t("danger_zone_desc")}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteSection((v) => !v)}
                            className="text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-colors"
                        >
                            {showDeleteSection ? t("cancel") : t("delete_account")}
                        </button>
                    </div>

                    {showDeleteSection && (
                        <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4 border-t border-red-100 dark:border-red-900/40 pt-5">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
                                {t("delete_warning")}
                            </div>
                            <InputField
                                label={t("confirm_your_password")}
                                type="password"
                                value={deletePassword}
                                onChange={setDeletePassword}
                                placeholder="••••••••"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t("type_delete")}
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full border border-red-200 dark:border-red-800 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            {deleteMsg && <Alert type={deleteMsg.type} message={deleteMsg.text} />}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={deleteLoading}
                                    className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                                >
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
