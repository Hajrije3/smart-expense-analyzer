import type { Transaction } from "../../types/transaction.ts";

export const transactionColumns = (onEdit: (tx: Transaction) => void, onDelete: (id: string) => void) => [
    {
        header: "Category",
        accessor: (row: Transaction) => row.category,
        width: "2fr",
    },
    {
        header: "Type",
        accessor: (row: Transaction) => (
            <span className="text-gray-500 capitalize">
                {row.type}
            </span>
        ),
        width: "2fr",

    },
    {
        header: "Date",
        accessor: (row: Transaction) =>
            new Date(row.date).toLocaleDateString(),
        width: "2fr",
    },
    {
        header: "Status",
        accessor: () => (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                Completed
            </span>
        ),
        width: "2fr",
    },
    {
        header: "Amount",
        accessor: (row: Transaction) => (
            <span
                className={
                    row.type === "expense"
                        ? "text-red-500 font-medium"
                        : "text-green-500 font-medium"
                }
            >
                {row.type === "expense" ? "-" : "+"}${row.amount}
            </span>
        ),
        width: "2fr",
    },
    {
        header: "Actions",
        accessor: (row: Transaction) => (
            <div className="flex gap-3 whitespace-nowrap">
                <button
                    onClick={() => onEdit(row)}
                    className="text-indigo-600 hover:underline"
                >
                    Edit
                </button>

                <button
                    onClick={() => onDelete(row._id)} // 👈 Mongo ID
                    className="text-red-600 hover:underline"
                >
                    Delete
                </button>
            </div>
        ),
        width: "2fr",
    },
];