import type { Transaction } from "../../types/transaction.ts";

export const transactionColumns = (
    onEdit: (tx: Transaction) => void,
    onDelete: (id: string) => void,
    fmt: (n: number) => string = (n) => `$${n}`,
    t: (key: string) => string = (k) => k,
) => [
    { header: t("col_category"), accessor: (row: Transaction) => row.category, width: "2fr" },
    {
        header: "Description",
        accessor: (row: Transaction) => (
            <span className="text-gray-500 dark:text-gray-400 truncate">{row.description || "—"}</span>
        ),
        width: "3fr",
    },
    {
        header: t("col_type"),
        accessor: (row: Transaction) => <span className="text-gray-500 capitalize">{row.type}</span>,
        width: "2fr",
    },
    {
        header: t("col_date"),
        accessor: (row: Transaction) => new Date(row.date).toLocaleDateString(),
        width: "2fr",
    },
    {
        header: t("col_status"),
        accessor: () => (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                {t("tx_completed")}
            </span>
        ),
        width: "2fr",
    },
    {
        header: t("col_amount"),
        accessor: (row: Transaction) => (
            <span className={row.type === "expense" ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                {row.type === "expense" ? "-" : "+"}{fmt(row.amount)}
            </span>
        ),
        width: "2fr",
    },
    {
        header: t("col_actions"),
        accessor: (row: Transaction) => (
            <div className="flex gap-3 whitespace-nowrap">
                <button onClick={() => onEdit(row)} className="text-indigo-600 hover:underline">{t("edit")}</button>
                <button onClick={() => onDelete(row._id)} className="text-red-600 hover:underline">{t("delete")}</button>
            </div>
        ),
        width: "2fr",
    },
];
