import { useState, useEffect, useRef } from "react";
import { fetchCategories, createCategory, type Category } from "../services/categoriesApi";

const PRESET_ICONS = ["🍔","🚗","🛍️","🎬","🏠","💊","📚","✈️","💡","💰","📦","🎯","🎮","👗","⚽","🐾","🌱","🎵","📱","🍕","☕","🏋️","🎨","💻","🏥","💼"];
const PRESET_COLORS = ["#22c55e","#3b82f6","#a855f7","#f97316","#ef4444","#ec4899","#eab308","#14b8a6","#6366f1","#6b7280","#0ea5e9","#84cc16"];

type Props = {
    value: string;
    onChange: (name: string) => void;
    placeholder?: string;
};

export default function CategoryPicker({ value, onChange, placeholder = "Select category" }: Props) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [newIcon, setNewIcon] = useState("📦");
    const [newColor, setNewColor] = useState("#6b7280");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCategories().then(setCategories).catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setShowNew(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selected = categories.find((c) => c.name === value);

    const handleSelect = (cat: Category) => {
        onChange(cat.name);
        setOpen(false);
        setShowNew(false);
    };

    const handleCreate = async () => {
        setError("");
        if (!newName.trim()) { setError("Name is required"); return; }
        setCreating(true);
        try {
            const created = await createCategory({ name: newName.trim(), icon: newIcon, color: newColor });
            setCategories((prev) => [...prev, created]);
            onChange(created.name);
            setNewName(""); setNewIcon("📦"); setNewColor("#6b7280");
            setShowNew(false);
            setOpen(false);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? "Failed to create category");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen((o) => !o); setShowNew(false); }}
                className="w-full flex items-center justify-between border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-700"
            >
                {selected ? (
                    <span className="flex items-center gap-2">
                        <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                            style={{ backgroundColor: selected.color + "22" }}
                        >
                            {selected.icon}
                        </span>
                        <span>{selected.name}</span>
                    </span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
                )}
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    {/* Category grid */}
                    <div className="max-h-52 overflow-y-auto p-2 grid grid-cols-2 gap-1">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => handleSelect(cat)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    value === cat.name ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-400" : ""
                                }`}
                            >
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                                    style={{ backgroundColor: cat.color + "22" }}
                                >
                                    {cat.icon}
                                </span>
                                <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Add new */}
                    <div className="border-t border-gray-100 dark:border-gray-700">
                        {!showNew ? (
                            <button
                                type="button"
                                onClick={() => setShowNew(true)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#22c55e] hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New category
                            </button>
                        ) : (
                            <div className="p-3 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Category</p>

                                {/* Name */}
                                <input
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                    autoFocus
                                    type="text"
                                    placeholder="Category name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                />

                                {/* Icon picker */}
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Icon</p>
                                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                        {PRESET_ICONS.map((ic) => (
                                            <button
                                                key={ic}
                                                type="button"
                                                onClick={() => setNewIcon(ic)}
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                    newIcon === ic ? "bg-green-100 dark:bg-green-900/30 ring-1 ring-green-400" : ""
                                                }`}
                                            >
                                                {ic}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color picker */}
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Color</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_COLORS.map((col) => (
                                            <button
                                                key={col}
                                                type="button"
                                                onClick={() => setNewColor(col)}
                                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                                                    newColor === col ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""
                                                }`}
                                                style={{ backgroundColor: col }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-500">{error}</p>}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowNew(false); setError(""); }}
                                        className="flex-1 border dark:border-gray-600 dark:text-gray-300 rounded-lg py-2 text-xs text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={creating}
                                        className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-60 transition-colors"
                                    >
                                        {creating ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
