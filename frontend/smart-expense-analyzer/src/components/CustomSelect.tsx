import { useEffect, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    value: T;
    onChange: (value: T) => void;
    options: Option<T>[];
    className?: string;
};

export default function CustomSelect<T extends string>({ value, onChange, options, className = "" }: Props<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm hover:border-green-400 dark:hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
            >
                <span>{selected?.label ?? value}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20" fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden py-1">
                    {options.map((opt) => (
                        <li key={opt.value}>
                            <button
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                                    ${opt.value === value
                                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {opt.label}
                                {opt.value === value && (
                                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
