import type {Transaction} from "../../types/transaction.ts";

export const transactionColumns = [
    {
        header: "Category",
        accessor: (row: Transaction) => row.category,
    },
    {
        header: "Type",
        accessor: (row: Transaction) => (
            <span className="text-gray-500 capitalize">
                {row.type}
                </span>
        ),
    },
    {
        header: "Date",
        accessor: (row: Transaction) =>
            new Date(row.date).toLocaleDateString(),
    },
    {
        header: "Status",
        accessor: () => (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                Completed
                </span>
        ),
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
},
];